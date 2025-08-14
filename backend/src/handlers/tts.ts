import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { TTSService, type TTSOptions } from '../lib/tts-service'
import { validateTTSRequest } from '../lib/validators'

type Env = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  GOOGLE_PRIVATE_KEY: string
  GOOGLE_CLIENT_EMAIL: string
}

const tts = new Hono<{ Bindings: Env }>()

// CORS中间件
tts.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// TTS预览端点 - 仅生成音频供前端预览，不保存
tts.post('/preview', async (c) => {
  try {
    const body = await c.req.json()
    
    // 验证请求
    const validation = validateTTSRequest(body)
    if (!validation.success) {
      return c.json({ 
        success: false, 
        error: 'Invalid request', 
        details: validation.errors 
      }, 400)
    }

    const options: TTSOptions = {
      text: body.text,
      language: body.language || 'en-US',
      voice: body.voice || 'auto',
      encoding: body.encoding || 'MP3',
      rate: body.rate || 1.0,
      pitch: body.pitch || 0,
      useSSML: body.useSSML || false
    }

    // 生成TTS音频
    const ttsService = new TTSService({
      GOOGLE_PRIVATE_KEY: c.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_CLIENT_EMAIL: c.env.GOOGLE_CLIENT_EMAIL
    })
    
    const audioBytes = await ttsService.synthesize(options)

    // 返回音频流
    const mimeTypes = {
      'MP3': 'audio/mpeg',
      'OGG_OPUS': 'audio/ogg',
      'LINEAR16': 'audio/wav'
    }

    return new Response(audioBytes, {
      headers: {
        'Content-Type': mimeTypes[options.encoding!] || 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Content-Disposition': 'inline'
      }
    })

  } catch (error) {
    console.error('TTS preview failed:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

// 列出可用声音
tts.get('/voices', async (c) => {
  try {
    const language = c.req.query('language') || 'en-US'
    
    const ttsService = new TTSService({
      GOOGLE_PRIVATE_KEY: c.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_CLIENT_EMAIL: c.env.GOOGLE_CLIENT_EMAIL
    })
    
    const voices = await ttsService.listVoices(language)
    
    return c.json({ success: true, data: voices })
  } catch (error) {
    console.error('List voices failed:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

export { tts }
