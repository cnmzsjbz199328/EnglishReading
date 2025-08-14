export interface TTSOptions {
  text: string
  language: string
  voice?: string
  encoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16'
  rate?: number
  pitch?: number
  useSSML?: boolean
}

export interface TTSEnv {
  GOOGLE_PRIVATE_KEY: string
  GOOGLE_CLIENT_EMAIL: string
}

// Google Cloud API 响应类型
interface TokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
}

interface TTSResponse {
  audioContent: string
}

interface Voice {
  languageCodes: string[]
  name: string
  ssmlGender?: string
  naturalSampleRateHertz?: number
}

interface VoicesResponse {
  voices: Voice[]
}

export class TTSService {
  constructor(private env: TTSEnv) {}

  async synthesize(options: TTSOptions): Promise<Uint8Array> {
    const {
      text,
      language,
      voice = 'auto',
      encoding = 'MP3',
      rate = 1.0,
      pitch = 0,
      useSSML = false
    } = options

    // 1. 获取访问令牌
    const accessToken = await this.getAccessToken()
    
    // 2. 选择最佳声音
    const voiceName = voice === 'auto' 
      ? await this.pickBestVoice(accessToken, language)
      : voice

    // 3. 调用TTS API
    const audioBytes = await this.callTTSAPI({
      text,
      language,
      voiceName,
      encoding,
      rate,
      pitch,
      useSSML,
      accessToken
    })

    return audioBytes
  }

  async listVoices(language: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(language)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to list voices: ${response.status}`)
    }

    return response.json()
  }

  private async getAccessToken(): Promise<string> {
    const jwt = await this.generateJWT()
    
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token request failed: ${response.status} - ${errorText}`)
    }

    const tokenData = await response.json() as TokenResponse
    const { access_token } = tokenData
    if (!access_token) {
      throw new Error('No access token received')
    }

    return access_token
  }

  private async generateJWT(): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: "RS256", typ: "JWT" }
    const payload = {
      iss: this.env.GOOGLE_CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    }

    const encodeBase64Url = (obj: any) => btoa(JSON.stringify(obj))
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    const jwtHeader = encodeBase64Url(header)
    const jwtPayload = encodeBase64Url(payload)
    const toSign = `${jwtHeader}.${jwtPayload}`

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      this.stringToArrayBuffer(this.env.GOOGLE_PRIVATE_KEY),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(toSign)
    )

    return `${toSign}.${this.arrayBufferToBase64Url(signature)}`
  }

  private async callTTSAPI(params: {
    text: string
    language: string
    voiceName: string
    encoding: string
    rate: number
    pitch: number
    useSSML: boolean
    accessToken: string
  }): Promise<Uint8Array> {
    const { text, language, voiceName, encoding, rate, pitch, useSSML, accessToken } = params

    const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: useSSML ? { ssml: text } : { text },
        voice: { languageCode: language, name: voiceName },
        audioConfig: {
          audioEncoding: encoding,
          speakingRate: rate,
          pitch: pitch
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TTS API failed: ${response.status} - ${errorText}`)
    }

    const ttsData = await response.json() as TTSResponse
    const { audioContent } = ttsData
    if (!audioContent) {
      throw new Error('No audio content in TTS response')
    }

    return this.base64ToUint8Array(audioContent)
  }

  private async pickBestVoice(accessToken: string, language: string): Promise<string> {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(language)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    if (!response.ok) return ''

    const voicesData = await response.json() as VoicesResponse
    const { voices = [] } = voicesData
    const list = voices.filter((v: Voice) => (v.languageCodes || []).includes(language))
    if (!list.length) return ''

    // 优先级：Studio > Chirp HD > Neural2 > Neural > Wavenet > HD > 其余
    const priority = [/studio/i, /chirp.*hd/i, /neural2/i, /neural/i, /wavenet/i, /hd/i]
    const score = (name = '') => {
      for (let i = 0; i < priority.length; i++) {
        if (priority[i].test(name)) return i
      }
      return 999
    }

    list.sort((a: any, b: any) =>
      score(a.name) - score(b.name) ||
      (b.naturalSampleRateHertz || 0) - (a.naturalSampleRateHertz || 0)
    )

    return list[0]?.name || ''
  }

  // 工具方法
  private stringToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem.replace(/-----.*?-----/g, "").replace(/\n/g, "").trim()
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes.buffer
  }

  private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let b of bytes) binary += String.fromCharCode(b)
    return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  }

  private base64ToUint8Array(b64: string): Uint8Array {
    const norm = b64.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(norm)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  // 辅助函数
  clampNumber(n: number, min: number, max: number): number {
    if (Number.isNaN(n)) return min
    return Math.max(min, Math.min(max, n))
  }
}
