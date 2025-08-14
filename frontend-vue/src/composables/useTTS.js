import { ref, reactive, computed } from 'vue'
import { ttsApi } from '../services/api.js'

// 全局TTS状态（单例模式）
const globalTTSState = reactive({
  isLoading: false,
  isPlaying: false,
  currentAudio: null,
  voices: [],
  voicesLoaded: false,
  error: null
})

// 音频缓存 - 避免重复生成相同文本的音频
const audioCache = new Map()

export function useTTS() {
  // 本地状态
  const isGenerating = ref(false)
  const generatedBlob = ref(null)
  const generatedUrl = ref(null)
  const currentText = ref('')
  const settings = reactive({
    language: 'en-US',
    voice: 'auto',
    rate: 1.0,
    pitch: 0.0,
    encoding: 'MP3',
    useSSML: false
  })

  // 计算属性
  const isAudioReady = computed(() => !!generatedBlob.value)
  const canPlay = computed(() => isAudioReady.value && !globalTTSState.isPlaying)
  const availableVoices = computed(() => {
    return globalTTSState.voices.filter(voice => 
      voice.languageCodes?.includes(settings.language) || 
      voice.language === settings.language
    )
  })

  // 清理音频资源
  function cleanup() {
    if (generatedUrl.value) {
      URL.revokeObjectURL(generatedUrl.value)
      generatedUrl.value = null
    }
    if (globalTTSState.currentAudio) {
      globalTTSState.currentAudio.pause()
      globalTTSState.currentAudio = null
    }
    generatedBlob.value = null
    globalTTSState.isPlaying = false
  }

  // 获取声音列表
  async function loadVoices(language = null) {
    if (globalTTSState.voicesLoaded && !language) {
      return globalTTSState.voices
    }

    try {
      globalTTSState.isLoading = true
      globalTTSState.error = null
      
      const lang = language || settings.language
      const response = await ttsApi.getVoices(lang)
      
      if (response.success && response.data?.voices) {
        globalTTSState.voices = response.data.voices
        globalTTSState.voicesLoaded = true
        return response.data.voices
      } else {
        throw new Error(response.error || '获取声音列表失败')
      }
    } catch (error) {
      console.error('Load voices error:', error)
      globalTTSState.error = error.message
      throw error
    } finally {
      globalTTSState.isLoading = false
    }
  }

  // 语音合成
  async function generateAudio(text, options = {}) {
    if (!text || !text.trim()) {
      throw new Error('文本内容不能为空')
    }

    // 创建缓存键
    const cacheKey = JSON.stringify({
      text: text.trim(),
      ...settings,
      ...options
    })

    // 检查缓存
    if (audioCache.has(cacheKey)) {
      const cachedBlob = audioCache.get(cacheKey)
      generatedBlob.value = cachedBlob
      generatedUrl.value = URL.createObjectURL(cachedBlob)
      currentText.value = text.trim()
      return cachedBlob
    }

    try {
      isGenerating.value = true
      globalTTSState.error = null

      const synthesizeOptions = {
        text: text.trim(),
        ...settings,
        ...options
      }

      const audioBlob = await ttsApi.synthesize(synthesizeOptions)
      
      // 清理之前的音频
      cleanup()
      
      // 设置新的音频
      generatedBlob.value = audioBlob
      generatedUrl.value = URL.createObjectURL(audioBlob)
      currentText.value = text.trim()
      
      // 缓存音频（限制缓存大小）
      if (audioCache.size >= 10) {
        const firstKey = audioCache.keys().next().value
        audioCache.delete(firstKey)
      }
      audioCache.set(cacheKey, audioBlob)

      return audioBlob
    } catch (error) {
      console.error('Generate audio error:', error)
      globalTTSState.error = error.message
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  // 播放音频
  async function playAudio() {
    if (!generatedBlob.value || globalTTSState.isPlaying) {
      return
    }

    try {
      // 停止当前播放的音频
      if (globalTTSState.currentAudio) {
        globalTTSState.currentAudio.pause()
      }

      // 创建新的音频对象
      const audio = new Audio(generatedUrl.value)
      globalTTSState.currentAudio = audio
      globalTTSState.isPlaying = true

      // 设置事件监听器
      audio.addEventListener('ended', () => {
        globalTTSState.isPlaying = false
        globalTTSState.currentAudio = null
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        globalTTSState.isPlaying = false
        globalTTSState.currentAudio = null
        globalTTSState.error = '音频播放失败'
      })

      // 播放音频
      await audio.play()
    } catch (error) {
      console.error('Play audio error:', error)
      globalTTSState.isPlaying = false
      globalTTSState.currentAudio = null
      globalTTSState.error = '无法播放音频'
      throw error
    }
  }

  // 停止播放
  function stopAudio() {
    if (globalTTSState.currentAudio) {
      globalTTSState.currentAudio.pause()
      globalTTSState.currentAudio.currentTime = 0
      globalTTSState.currentAudio = null
    }
    globalTTSState.isPlaying = false
  }

  // 预设配置
  function usePreset(preset) {
    const presets = {
      slow: { rate: 0.7, pitch: 0 },
      normal: { rate: 1.0, pitch: 0 },
      fast: { rate: 1.3, pitch: 0 },
      child: { rate: 0.9, pitch: 5 },
      adult: { rate: 1.0, pitch: 0 },
      elder: { rate: 0.8, pitch: -2 }
    }

    if (presets[preset]) {
      Object.assign(settings, presets[preset])
    }
  }

  // 下载音频文件
  function downloadAudio(filename = null) {
    if (!generatedBlob.value) {
      throw new Error('没有可下载的音频')
    }

    const name = filename || `tts-audio-${Date.now()}.mp3`
    const url = URL.createObjectURL(generatedBlob.value)
    
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // 清理临时URL
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  // 返回API和状态
  return {
    // 状态
    isGenerating: computed(() => isGenerating.value),
    isLoading: computed(() => globalTTSState.isLoading),
    isPlaying: computed(() => globalTTSState.isPlaying),
    isAudioReady,
    canPlay,
    error: computed(() => globalTTSState.error),
    generatedBlob: computed(() => generatedBlob.value),
    generatedUrl: computed(() => generatedUrl.value),
    currentText: computed(() => currentText.value),
    
    // 配置
    settings,
    voices: computed(() => globalTTSState.voices),
    availableVoices,
    voicesLoaded: computed(() => globalTTSState.voicesLoaded),
    
    // 方法
    loadVoices,
    generateAudio,
    playAudio,
    stopAudio,
    cleanup,
    usePreset,
    downloadAudio
  }
}

// 提供一些有用的工具函数
export const ttsUtils = {
  // 文本预处理
  preprocessText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ')  // 合并多个空格
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')  // 确保句子间有适当的间隔
  },

  // 估算音频时长（粗略估算）
  estimateDuration(text, rate = 1.0) {
    const wordsPerMinute = 150 * rate  // 平均语速
    const wordCount = text.trim().split(/\s+/).length
    return Math.ceil((wordCount / wordsPerMinute) * 60)  // 秒
  },

  // 检查文本长度是否合适
  validateTextLength(text, maxLength = 5000) {
    return {
      isValid: text.length <= maxLength,
      length: text.length,
      maxLength,
      message: text.length > maxLength ? `文本过长，最多支持${maxLength}个字符` : ''
    }
  },

  // 获取推荐的声音
  getRecommendedVoice(voices, language, gender = null) {
    const filtered = voices.filter(voice => 
      voice.languageCodes?.includes(language) || voice.language === language
    )
    
    if (gender) {
      const genderFiltered = filtered.filter(voice => 
        voice.ssmlGender?.toLowerCase() === gender.toLowerCase()
      )
      if (genderFiltered.length > 0) {
        return genderFiltered[0]
      }
    }
    
    return filtered[0] || null
  }
}
