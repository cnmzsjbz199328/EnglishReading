import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Cloudflare Workers 环境变量类型
type Env = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>()

// 启用 CORS (扩展为 * 以便原型 file:// 访问；上线后可收紧)
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}))

// Health Check - 基础检查
app.get('/api/health', (c) => {
  return c.json({ 
    success: true, 
    data: { status: 'ok', timestamp: new Date().toISOString() } 
  })
})

// Health Check - 数据库连接检查
app.get('/api/health/db', async (c) => {
  try {
    const result = await c.env.DB.prepare("SELECT 1 as test").first()
    
    // 检查数据库表是否存在
    const tableInfo = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='recordings'"
    ).first()
    
    return c.json({ 
      success: true,
      data: { 
        database: 'connected',
        test_query: result,
        recordings_table: tableInfo ? 'exists' : 'not_found',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    return c.json({ 
      success: false, 
      error: 'Database connection failed: ' + error.message 
    }, 500)
  }
})

// 获取所有录音
app.get('/api/recordings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, title, created_at as createdAt FROM recordings ORDER BY created_at DESC"
    ).all()
    
    return c.json({ success: true, data: results || [] })
  } catch (error) {
    console.error('获取录音列表失败:', error)
    return c.json({ 
      success: false, 
      error: '获取录音列表失败: ' + error.message 
    }, 500)
  }
})

// 创建新录音记录 - 符合架构规范
app.post('/api/recordings', async (c) => {
  try {
    const body = await c.req.json()
    
    // 支持架构规范的字段名和当前实现的字段名
    const title = body.title
    const text = body.text || body.originalText // 支持两种字段名
    const audioKey = body.audioKey || body.r2ObjectKey // 支持两种字段名
    
    if (!title) {
      return c.json({ 
        success: false, 
        error: 'Title is required' 
      }, 400)
    }
    
    if (!text) {
      return c.json({ 
        success: false, 
        error: 'Text is required' 
      }, 400)
    }
    
    if (!audioKey) {
      return c.json({ 
        success: false, 
        error: 'Audio key is required' 
      }, 400)
    }
    
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    
    // 插入到数据库
    const { success } = await c.env.DB.prepare(
      "INSERT INTO recordings (id, title, original_text, r2_object_key, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(
      id, 
      title, 
      text,
      audioKey,
      createdAt
    ).run()

    if (!success) {
      throw new Error('数据库插入失败')
    }

    const newRecording = { id, title, createdAt }
    return c.json({ success: true, data: newRecording }, 201)
  } catch (error) {
    console.error('创建录音失败:', error)
    return c.json({ 
      success: false, 
      error: '创建录音失败: ' + error.message 
    }, 500)
  }
})

// 搜索录音 (必须在 :id 路由之前)
app.get('/api/recordings/search', async (c) => {
  try {
    const query = c.req.query('q')
    const limit = parseInt(c.req.query('limit') || '10')
    
    if (!query) {
      return c.json({ 
        success: false, 
        error: 'Search query (q) is required' 
      }, 400)
    }
    
    // 在标题和原始文本中搜索
    const { results } = await c.env.DB.prepare(
      `SELECT id, title, created_at as createdAt 
       FROM recordings 
       WHERE title LIKE ? OR original_text LIKE ? 
       ORDER BY created_at DESC 
       LIMIT ?`
    ).bind(`%${query}%`, `%${query}%`, limit).all()
    
    return c.json({ 
      success: true, 
      data: {
        query: query,
        results: results || [],
        total: (results || []).length
      }
    })
  } catch (error) {
    console.error('搜索录音失败:', error)
    return c.json({ 
      success: false, 
      error: 'Search recordings failed: ' + error.message 
    }, 500)
  }
})

// 获取录音详情
app.get('/api/recordings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const record = await c.env.DB.prepare(
      "SELECT id, title, original_text as originalText, created_at as createdAt FROM recordings WHERE id = ?"
    ).bind(id).first()

    if (!record) {
      return c.json({ success: false, error: '录音不存在' }, 404)
    }

    return c.json({ success: true, data: record })
  } catch (error) {
    console.error('获取录音详情失败:', error)
    return c.json({ 
      success: false, 
      error: '获取录音详情失败: ' + error.message 
    }, 500)
  }
})

// 获取录音音频文件
app.get('/api/recordings/:id/audio', async (c) => {
  try {
    const id = c.req.param('id')
    
    const record = await c.env.DB.prepare("SELECT r2_object_key FROM recordings WHERE id = ?").bind(id).first()
    
    if (!record || !record.r2_object_key) {
      return c.json({ success: false, error: '录音文件不存在' }, 404)
    }
    
    const r2Object = await c.env.R2_BUCKET.get(record.r2_object_key as string)
    
    if (!r2Object) {
      return c.json({ success: false, error: '录音文件不存在' }, 404)  
    }
    
    return new Response(r2Object.body, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('获取录音文件失败:', error)
    return c.json({ 
      success: false, 
      error: '获取录音文件失败: ' + error.message 
    }, 500)
  }
})

// 删除录音
app.delete('/api/recordings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    // 获取完整记录以拿到 r2_object_key / audioKey
    const record = await c.env.DB.prepare("SELECT id, r2_object_key as audioKey FROM recordings WHERE id = ?").bind(id).first() as { id: string, audioKey?: string } | null

    if (!record) {
      return c.json({ success: false, error: '录音不存在' }, 404)
    }

    let r2Deleted: boolean | null = null
    if (record.audioKey) {
      try {
        await c.env.R2_BUCKET.delete(record.audioKey)
        r2Deleted = true
      } catch (err) {
        console.warn('R2 对象删除失败 (继续删除数据库记录):', err)
        r2Deleted = false
      }
    }

    await c.env.DB.prepare("DELETE FROM recordings WHERE id = ?").bind(id).run()

    return c.json({ success: true, data: { message: '录音删除成功', r2Deleted } })
  } catch (error: any) {
    console.error('删除录音失败:', error)
    return c.json({ 
      success: false, 
      error: '删除录音失败: ' + error.message 
    }, 500)
  }
})

// 更新录音
app.put('/api/recordings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    // 检查录音是否存在
    const existingRecord = await c.env.DB.prepare("SELECT * FROM recordings WHERE id = ?").bind(id).first()
    
    if (!existingRecord) {
      return c.json({ success: false, error: '录音不存在' }, 404)
    }
    
    // 支持架构规范的字段名和当前实现的字段名
    const title = body.title || existingRecord.title
    const text = body.text || body.originalText || existingRecord.text
    const audioKey = body.audioKey || body.r2ObjectKey || existingRecord.audioKey
    
    // 更新录音
    await c.env.DB.prepare(`
      UPDATE recordings 
      SET title = ?, text = ?, audioKey = ?, updatedAt = datetime('now') 
      WHERE id = ?
    `).bind(title, text, audioKey, id).run()
    
    // 返回更新后的录音
    const updatedRecord = await c.env.DB.prepare("SELECT * FROM recordings WHERE id = ?").bind(id).first()
    
    return c.json({ 
      success: true, 
      data: {
        id: updatedRecord.id,
        title: updatedRecord.title,
        text: updatedRecord.text,
        audioKey: updatedRecord.audioKey,
        createdAt: updatedRecord.createdAt,
        updatedAt: updatedRecord.updatedAt
      }
    })
  } catch (error) {
    console.error('更新录音失败:', error)
    return c.json({ 
      success: false, 
      error: '更新录音失败: ' + error.message 
    }, 500)
  }
})

// 文件上传端点 - 直接上传到 R2
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as unknown as File
    
    if (!file || typeof file === 'string') {
      return c.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, 400)
    }
    
    // 生成唯一的文件键
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'wav'
    const fileKey = `recordings/${timestamp}-${crypto.randomUUID()}.${fileExtension}`
    
    // 上传文件到 R2
    await c.env.R2_BUCKET.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'audio/wav',
      },
    })
    
    return c.json({ 
      success: true, 
      data: { 
        key: fileKey,
        filename: file.name,
        size: file.size,
        message: 'File uploaded successfully to R2' 
      } 
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return c.json({ 
      success: false, 
      error: '文件上传失败: ' + error.message 
    }, 500)
  }
})

// 获取预签名 URL - 符合架构规范
app.get('/api/presigned-url', async (c) => {
  try {
    const filename = c.req.query('filename')
    
    if (!filename) {
      return c.json({ 
        success: false, 
        error: 'Filename is required.' 
      }, 400)
    }
    
    // 生成唯一的文件键
    const timestamp = Date.now()
    const fileKey = `uploads/${timestamp}-${filename}`
    
    // 由于 Cloudflare R2 API 限制，我们使用直接上传方式
    // 返回上传端点信息而不是真正的预签名URL
    return c.json({ 
      success: true, 
      data: { 
        signedUrl: '/api/upload', // 实际的上传端点
        key: fileKey,
        method: 'POST',
        note: 'Use POST with multipart/form-data to upload file'
      } 
    })
  } catch (error) {
    console.error('生成预签名URL失败:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to generate presigned URL: ' + error.message 
    }, 500)
  }
})

// 保留原有的上传URL端点以兼容现有测试
app.get('/api/upload-url/:filename', async (c) => {
  try {
    const filename = c.req.param('filename')
    
    // 生成唯一的文件键
    const timestamp = Date.now()
    const fileKey = `recordings/${timestamp}-${filename}`
    
    // 返回上传端点信息
    return c.json({ 
      success: true, 
      data: { 
        uploadEndpoint: '/api/upload',
        key: fileKey,
        method: 'POST',
        message: 'Use POST /api/upload with form-data file field' 
      } 
    })
  } catch (error) {
    console.error('生成上传信息失败:', error)
    return c.json({ 
      success: false, 
      error: '生成上传信息失败: ' + error.message 
    }, 500)
  }
})

// 批量操作 - 获取多个录音的详情
app.post('/api/recordings/batch', async (c) => {
  try {
    const body = await c.req.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids)) {
      return c.json({ 
        success: false, 
        error: 'ids array is required' 
      }, 400)
    }
    
    // 创建批量查询
    const placeholders = ids.map(() => '?').join(',')
    const { results } = await c.env.DB.prepare(
      `SELECT id, title, created_at as createdAt FROM recordings WHERE id IN (${placeholders})`
    ).bind(...ids).all()
    
    return c.json({ success: true, data: results || [] })
  } catch (error) {
    console.error('批量获取录音失败:', error)
    return c.json({ 
      success: false, 
      error: '批量获取录音失败: ' + error.message 
    }, 500)
  }
})

// 获取 API 信息和文档
app.get('/api/info', (c) => {
  return c.json({
    success: true,
    data: {
      name: "English Reading Practice API",
      version: "1.0.0",
      description: "API for managing English reading recordings and practice sessions",
      architecture_compliance: "Updated to match ARCHITECTURE.md specifications",
      endpoints: {
        // 架构规范端点
        presignedUrl: "GET /api/presigned-url?filename=xxx - Get presigned upload URL (Architecture spec)",
        recordings: "GET /api/recordings - Get all recordings",
        createRecording: "POST /api/recordings - Create new recording (title, text, audioKey)",
        updateRecording: "PUT /api/recordings/:id - Update recording (title, text, audioKey)",
        getRecordingAudio: "GET /api/recordings/:id/audio - Get recording audio stream",
        deleteRecording: "DELETE /api/recordings/:id - Delete recording (and attempt to delete R2 object)",
        
        // 扩展功能端点
        health: "GET /api/health - 基础健康检查",
        healthDb: "GET /api/health/db - 数据库健康检查", 
        uploadFile: "POST /api/upload - 直接文件上传",
        uploadUrl: "GET /api/upload-url/:filename - 获取上传URL (遗留支持)",
        batchRecordings: "POST /api/recordings/batch - 批量获取录音",
        searchRecordings: "GET /api/recordings/search?q=query - 搜索录音",
        getRecordingDetails: "GET /api/recordings/:id - 获取录音详情"
      },
      features: [
        "CORS enabled for local development",
        "Real D1 database integration",
        "Real R2 storage integration",
        "Comprehensive error handling",
        "RESTful API design",
        "Full-text search capabilities",
        "Architecture specification compliance",
        "Backward compatibility support"
      ]
    }
  })
})

// VOA 代理/提要和文章提取端点
app.get('/api/voa/feed', async (c) => {
  try {
    const FEED_URL = 'https://learningenglish.voanews.com/api/zbmroml-vomx-tpeqboo_'
    const resp = await fetch(FEED_URL, { headers: { 'User-Agent': 'Mozilla/5.0 VOAFetcher/1.0' } })
    if (!resp.ok) return c.json({ success: false, error: 'Upstream feed fetch failed ' + resp.status }, 502)
    const xml = await resp.text()
    // 简易解析 (避免在 Worker 里依赖 DOMParser)
    const items: { title: string; link: string }[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let m: RegExpExecArray | null
    while ((m = itemRegex.exec(xml))) {
      const block = m[1]
      const t = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/.exec(block)
      const l = /<link>(.*?)<\/link>/.exec(block)
      const title = (t && (t[1] || t[2]) || '').trim()
      const link = (l && l[1] || '').trim()
      if (title && link) items.push({ title, link })
    }
    return c.json({ success: true, data: items })
  } catch (err: any) {
    console.error('VOA feed error', err)
    return c.json({ success: false, error: 'Feed fetch error: ' + err.message }, 500)
  }
})

app.get('/api/voa/article', async (c) => {
  try {
    const url = c.req.query('url')
    if (!url || !/^https?:\/\//.test(url)) return c.json({ success: false, error: 'Valid url param required' }, 400)
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 VOAArticleFetcher/1.1' } })
    if (!resp.ok) return c.json({ success: false, error: 'Upstream article fetch failed ' + resp.status }, 502)
    const html = await resp.text()

    // ------------- 标题 -------------
    let title = ''
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    if (titleMatch) title = titleMatch[1].replace(/\s+\|\s*Voice of America.*/i, '').trim()

    // ------------- 音频（优先高码率 data-sources JSON 内 _hq） -------------
    let audio = ''
    // data-sources="[...]"
    const dataSourcesMatch = html.match(/data-sources="([^"]+)"/i)
    if (dataSourcesMatch) {
      try {
        const jsonTxt = dataSourcesMatch[1].replace(/&quot;/g, '"')
        const arr = JSON.parse(jsonTxt)
        if (Array.isArray(arr) && arr.length) {
          // 简单找含 _hq 或 128 kbps
            const hq = arr.find(o => /hq\.mp3/i.test(o.Src || o.AmpSrc || '')) || arr.find(o => /128 kbps/i.test(o.DataInfo||'')) || arr[0]
            audio = (hq.Src || hq.AmpSrc || '').trim()
        }
      } catch {}
    }
    if (!audio) {
      const audioTag = html.match(/<audio[^>]+src="([^"']+\.mp3)"/i)
      if (audioTag) audio = audioTag[1]
    }
    if (!audio) {
      const mp3 = html.match(/https?:\/\/[^"'<>]+\.mp3/)
      if (mp3) audio = mp3[0]
    }

    // ------------- 正文提取 -------------
    // 方案: 定位 id="article-content" 起始，再到 comments/Related/</main> 等结束标记
    const startIdx = html.indexOf('id="article-content"')
    let text = ''
    if (startIdx !== -1) {
      const tail = html.slice(startIdx)
      // 结束标记候选
      const endMarkers = [ 'id="comments"', 'class="comments', 'class="media-block-wrap', '</main>' ]
      let endPos = tail.length
      for (const mk of endMarkers) {
        const p = tail.indexOf(mk)
        if (p !== -1 && p < endPos) endPos = p
      }
      let section = tail.slice(0, endPos)

      // 去掉脚本/样式/quiz/comments 片段/下载块
      section = section
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<div[^>]+class="[^"]*quiz[^"]*"[\s\S]*?<\/div>/gi, '')
        .replace(/<div[^>]+class="[^"]*(media-download|share|comments)[^"]*"[\s\S]*?<\/div>/gi, '')

      // 收集 <p> 段落
      const paragraphs: string[] = []
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
      let pm: RegExpExecArray | null
      while ((pm = pRegex.exec(section))) {
        let raw = pm[1]
        // 跳过空或仅下划线行
        if (/^\s*(__+|\*{3,})\s*$/i.test(raw)) continue
        raw = raw.replace(/<[^>]+>/g, ' ') // 去内部标签
        raw = decodeHtml(raw)
        raw = raw.replace(/\s+/g, ' ').trim()
        if (raw) paragraphs.push(raw)
      }
      text = paragraphs.join('\n\n')
    }

    if (!text) text = '正文抓取失败。'

    return c.json({ success: true, data: { title, audio, text, source: url, wordCount: text === '正文抓取失败。' ? 0 : text.split(/\s+/).length } })
  } catch (err: any) {
    console.error('VOA article error', err)
    return c.json({ success: false, error: 'Article fetch error: ' + err.message }, 500)
  }
})

// 简易 HTML 实体解码
function decodeHtml(str: string): string {
  const map: Record<string,string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return str.replace(/&(#x?[0-9a-f]+|[a-z]+);/ig, (m, g1) => {
    g1 = g1.toLowerCase()
    if (map[g1]) return map[g1]
    if (g1.startsWith('#x')) {
      const code = parseInt(g1.slice(2), 16)
      return code ? String.fromCharCode(code) : m
    }
    if (g1.startsWith('#')) {
      const code = parseInt(g1.slice(1), 10)
      return code ? String.fromCharCode(code) : m
    }
    return m
  })
}

export default app
