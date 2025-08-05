import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 启用 CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Health Check - 基础检查
app.get('/api/health', (c) => {
  return c.json({ 
    success: true, 
    data: { status: 'ok', timestamp: new Date().toISOString() } 
  })
})

// Health Check - 数据库连接检查 (模拟)
app.get('/api/health/db', async (c) => {
  return c.json({ 
    success: true,
    data: { 
      database: 'simulated - OK',
      message: 'Database binding disabled for testing',
      timestamp: new Date().toISOString()
    }
  })
})

// 获取所有录音 (模拟数据)
app.get('/api/recordings', async (c) => {
  const mockRecordings = [
    {
      id: "test-1",
      title: "Test Recording 1",
      createdAt: new Date().toISOString()
    },
    {
      id: "test-2", 
      title: "Test Recording 2",
      createdAt: new Date().toISOString()
    }
  ]
  
  return c.json({ success: true, data: mockRecordings })
})

// 创建新录音记录 (模拟)
app.post('/api/recordings', async (c) => {
  try {
    const body = await c.req.json()
    const { title } = body
    
    if (!title) {
      return c.json({ 
        success: false, 
        error: 'Title is required' 
      }, 400)
    }
    
    const id = crypto.randomUUID()
    const newRecording = { id, title, createdAt: new Date().toISOString() }
    return c.json({ success: true, data: newRecording }, 201)
  } catch (error) {
    return c.json({ 
      success: false, 
      error: '创建录音失败: ' + error.message 
    }, 500)
  }
})

// 获取录音详情 (模拟)
app.get('/api/recordings/:id', async (c) => {
  const id = c.req.param('id')
  const mockRecord = {
    id: id,
    title: `Recording ${id}`,
    createdAt: new Date().toISOString()
  }
  return c.json({ success: true, data: mockRecord })
})

// 删除录音 (模拟)
app.delete('/api/recordings/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ success: true, data: { message: '录音删除成功 (模拟)' } })
})

// 文件上传端点 (模拟预签名 URL)
app.get('/api/upload-url/:filename', async (c) => {
  try {
    const filename = c.req.param('filename')
    
    // 模拟生成预签名 URL
    const mockUploadUrl = `https://mock-r2-bucket.cloudflarestorage.com/recordings/${Date.now()}-${filename}?signature=mock-signature`
    const mockKey = `recordings/${Date.now()}-${filename}`
    
    return c.json({ 
      success: true, 
      data: { 
        uploadUrl: mockUploadUrl, 
        key: mockKey,
        message: 'Mock upload URL generated (R2 not configured)' 
      } 
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: '生成上传 URL 失败: ' + error.message 
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
    
    // 模拟批量获取录音详情
    const mockRecordings = ids.map(id => ({
      id: id,
      title: `Recording ${id}`,
      createdAt: new Date().toISOString(),
      status: 'available'
    }))
    
    return c.json({ success: true, data: mockRecordings })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: '批量获取录音失败: ' + error.message 
    }, 500)
  }
})

// 搜索录音
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
    
    // 模拟搜索结果
    const mockResults = [
      {
        id: "search-1",
        title: `Search Result for "${query}" - Recording 1`,
        createdAt: new Date().toISOString(),
        relevance: 0.95
      },
      {
        id: "search-2", 
        title: `Search Result for "${query}" - Recording 2`,
        createdAt: new Date().toISOString(),
        relevance: 0.87
      }
    ].slice(0, limit)
    
    return c.json({ 
      success: true, 
      data: {
        query: query,
        results: mockResults,
        total: mockResults.length
      }
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Search recordings failed: ' + error.message 
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
      endpoints: {
        health: "GET /api/health - Basic health check",
        healthDb: "GET /api/health/db - Database health check", 
        recordings: "GET /api/recordings - Get all recordings",
        createRecording: "POST /api/recordings - Create new recording",
        getRecording: "GET /api/recordings/:id - Get recording details",
        deleteRecording: "DELETE /api/recordings/:id - Delete recording",
        uploadUrl: "GET /api/upload-url/:filename - Get upload URL",
        batchRecordings: "POST /api/recordings/batch - Get multiple recordings",
        searchRecordings: "GET /api/recordings/search?q=query - Search recordings"
      },
      features: [
        "CORS enabled for local development",
        "Mock data responses (database disabled)",
        "Comprehensive error handling",
        "RESTful API design"
      ]
    }
  })
})

export default app
