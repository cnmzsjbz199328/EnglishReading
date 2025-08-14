// Simple API helper matching the prototype behavior
const API_BASE = import.meta.env.VITE_API_BASE || ''

// TTS API配置
const TTS_BASE_URL = 'https://english-reading-app.tj15982183241.workers.dev'

export async function fetchJSON(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, options)
  let text = ''
  try {
    text = await res.text()
  } catch {
    /* ignore */
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  return JSON.parse(text)
}

export async function uploadFile(file) {
  // Try direct upload first
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd })
    if (res.ok) {
      const json = await res.json().catch(() => ({}))
      if (json?.success && json?.data?.key) return json.data.key
    }
  } catch {
    /* ignore and fallback */
  }
  // Fallback presigned
  const qsName = encodeURIComponent(file.name)
  const pre = await fetchJSON(`/api/presigned-url?filename=${qsName}`)
  const data = pre.data || pre
  const uploadUrl = data.uploadUrl || data.url
  const key = data.key || data.r2ObjectKey || data.objectKey || ''
  if (!uploadUrl || !key) throw new Error('Invalid presigned response')
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!(putRes.ok || putRes.status === 204)) throw new Error('PUT upload failed: ' + putRes.status)
  return key
}

// TTS相关API
export const ttsApi = {
  /**
   * 获取可用声音列表
   * @param {string} language - 语言代码 (e.g., 'en-US', 'cmn-CN')
   * @returns {Promise<Object>} 声音列表响应
   */
  async getVoices(language = 'en-US') {
    try {
      const url = `${TTS_BASE_URL}/api/tts/voices?language=${encodeURIComponent(language)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`获取声音列表失败: ${response.status} ${errorData}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('TTS getVoices error:', error)
      throw new Error(error.message || '网络错误，无法获取声音列表')
    }
  },

  /**
   * 语音合成
   * @param {Object} options - 合成选项
   * @param {string} options.text - 要合成的文本
   * @param {string} options.language - 语言代码
   * @param {string} options.voice - 声音名称
   * @param {number} options.rate - 语速 (0.25-4.0)
   * @param {number} options.pitch - 音调 (-20 to 20)
   * @param {string} options.encoding - 音频格式
   * @param {boolean} options.useSSML - 是否使用SSML
   * @returns {Promise<Blob>} 音频Blob
   */
  async synthesize(options) {
    try {
      const {
        text,
        language = 'en-US',
        voice = 'auto',
        encoding = 'MP3',
        rate = 1.0,
        pitch = 0.0,
        useSSML = false
      } = options

      if (!text || !text.trim()) {
        throw new Error('文本内容不能为空')
      }

      const requestBody = {
        text: text.trim(),
        language,
        voice,
        encoding,
        rate: Number(rate),
        pitch: Number(pitch),
        useSSML
      }

      const response = await fetch(`${TTS_BASE_URL}/api/tts/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `语音合成失败: ${response.status}`)
      }

      // 返回音频Blob
      const audioBuffer = await response.arrayBuffer()
      return new Blob([audioBuffer], { type: 'audio/mpeg' })
    } catch (error) {
      console.error('TTS synthesize error:', error)
      throw new Error(error.message || '语音合成失败，请检查网络连接')
    }
  }
}
