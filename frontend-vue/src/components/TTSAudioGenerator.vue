<template>
  <div class="tts-audio-generator">
    <!-- Header -->
    <div class="tts-header">
      <h3 class="tts-title">
        <span class="icon">🎤</span>
        Text-to-Speech Audio Generation
      </h3>
      <button 
        v-if="isAudioReady" 
        @click="$emit('close')"
        class="close-btn"
        aria-label="Close"
      >
        ×
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-alert">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Text Input Section: Hidden in external text mode -->
    <div class="text-input-section" v-if="!useExternalText">
      <label for="tts-text" class="input-label">
        Text to Convert <span class="required">*</span>
      </label>
      <textarea
        id="tts-text"
        v-model="inputText"
        placeholder="Enter the text you want to convert to speech..."
        class="text-input"
        :disabled="isGenerating"
        rows="4"
        maxlength="5000"
      ></textarea>
      <div class="text-info">
        <span class="char-count" :class="{ 'over-limit': inputText.length > 5000 }">
          {{ inputText.length }}/5000 characters
        </span>
        <span v-if="inputText.trim()" class="duration-estimate">
          Est. duration: ~{{ estimatedDuration }}s
        </span>
      </div>
    </div>

    <!-- Voice Settings: Collapsible advanced settings -->
    <div class="voice-settings-container" v-if="useExternalText">
      <div class="settings-toggle">
        <button 
          @click="showSettings = !showSettings" 
          class="btn btn-outline settings-toggle-btn"
          :disabled="isGenerating"
        >
          <span class="toggle-icon">{{ showSettings ? '🔼' : '🔽' }}</span>
          {{ showSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings' }}
        </button>
        <div class="settings-hint">Using default English voice, standard speed</div>
      </div>
      
      <div class="voice-settings" v-if="showSettings">
        <h4 class="settings-title">Voice Settings</h4>
        
        <div class="settings-grid">
          <!-- Language Selection -->
          <div class="setting-item">
            <label for="language-select">Language</label>
            <select 
              id="language-select" 
              v-model="settings.language"
              @change="onLanguageChange"
              :disabled="isGenerating"
              class="setting-select"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-AU">English (AU)</option>
              <option value="cmn-CN">Chinese (Mandarin)</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
              <option value="es-ES">Español</option>
              <option value="fr-FR">Français</option>
              <option value="de-DE">Deutsch</option>
            </select>
          </div>

          <!-- Voice Selection -->
          <div class="setting-item">
            <label for="voice-select">Voice</label>
            <select 
              id="voice-select" 
              v-model="settings.voice"
              :disabled="isGenerating || voiceOptions.length === 0"
              class="setting-select"
            >
              <option value="auto">Auto Select</option>
              <option 
                v-for="voice in voiceOptions" 
                :key="voice.name" 
                :value="voice.name"
              >
                {{ voice.displayName || voice.name }} 
                <span v-if="voice.ssmlGender">({{ voice.ssmlGender }})</span>
              </option>
            </select>
            <div v-if="isLoading && voiceOptions.length === 0" class="loading-voices">
              加载声音列表中...
            </div>
          </div>

          <!-- 语速 -->
          <div class="setting-item">
            <label for="rate-slider">
              语速: {{ settings.rate }}x
            </label>
            <input
              id="rate-slider"
              v-model.number="settings.rate"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              :disabled="isGenerating"
              class="setting-slider"
            />
            <div class="slider-labels">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <!-- Pitch -->
          <div class="setting-item">
            <label for="pitch-slider">
              Pitch: {{ settings.pitch > 0 ? '+' : '' }}{{ settings.pitch }}
            </label>
            <input
              id="pitch-slider"
              v-model.number="settings.pitch"
              type="range"
              min="-10"
              max="10"
              step="1"
              :disabled="isGenerating"
              class="setting-slider"
            />
            <div class="slider-labels">
              <span>Low</span>
              <span>Standard</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <!-- Preset Configurations -->
        <div class="presets">
          <span class="presets-label">Quick Settings:</span>
          <button 
            v-for="preset in presets" 
            :key="preset.name"
            @click="applyPreset(preset.key)"
            :disabled="isGenerating"
            class="preset-btn"
            :title="preset.description"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons: Simple one-click generation -->
    <div class="action-buttons">
      <button
        @click="generateAudio"
        :disabled="!canGenerate || isGenerating"
        class="btn btn-primary generate-btn main-action"
      >
        <span v-if="isGenerating" class="loading-spinner"></span>
        <span class="btn-icon">🎤</span>
        {{ isGenerating ? 'Generating Audio...' : 'Generate Speech' }}
      </button>
      
      <div v-if="useExternalText && effectiveText" class="text-preview-mini">
        <span class="preview-label">Will synthesize:</span>
        <span class="preview-content">{{ effectiveText.slice(0, 50) }}{{ effectiveText.length > 50 ? '...' : '' }}</span>
        <span class="preview-stats">({{ effectiveText.length }} characters, ~{{ estimatedDuration }}s)</span>
      </div>
    </div>

    <!-- Audio Preview Area -->
    <div v-if="isAudioReady" class="audio-preview">
      <div class="preview-header">
        <span class="preview-title">🎵 Audio Preview</span>
        <span class="preview-text">{{ currentText.substring(0, 100) }}{{ currentText.length > 100 ? '...' : '' }}</span>
      </div>
      
      <audio 
        v-if="generatedUrl" 
        :src="generatedUrl" 
        controls 
        class="audio-player"
        preload="metadata"
      ></audio>

      <!-- Confirm Use Buttons -->
      <div class="confirm-actions">
        <button
          @click="confirmUse"
          class="btn btn-success confirm-btn"
        >
          ✓ Use This Audio
        </button>
        <button
          @click="regenerate"
          class="btn btn-outline regenerate-btn"
        >
          🔄 Regenerate
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTTS, ttsUtils } from '../composables/useTTS.js'
// 引入组件专用样式
import '../assets/styles/tts-audio-generator.css'

export default {
  name: 'TTSAudioGenerator',
  emits: ['audioGenerated', 'close'],
  props: {
    // 外部传入的阅读文本
    text: { type: String, default: '' },
    // 是否使用外部文本（隐藏内部输入框与设置）
    useExternalText: { type: Boolean, default: true }
  },
  setup(props, { emit }) {
    const {
      settings,
      isGenerating,
      isLoading,
      isPlaying,
      isAudioReady,
      canPlay,
      error,
      generatedBlob,
      generatedUrl,
      currentText,
      voices,
      availableVoices,
      loadVoices,
      generateAudio: ttsGenerateAudio,
      playAudio: ttsPlayAudio,
      stopAudio: ttsStopAudio,
      cleanup,
      usePreset,
      downloadAudio: ttsDownloadAudio
    } = useTTS()

    // 简洁模式：隐藏所有语音设置
    const showSettings = ref(false)

    // 本地状态（保留以兼容旧用法）
    const inputText = ref('')

    // 外部/内部统一文本来源
    const externalText = computed(() => props.text || '')
    const effectiveText = computed(() => props.useExternalText ? externalText.value : inputText.value)

    // 计算属性
    const canGenerate = computed(() => {
      const text = (effectiveText.value || '').trim()
      return text.length > 0 && text.length <= 5000 && !isGenerating.value
    })

    const estimatedDuration = computed(() => {
      const txt = (effectiveText.value || '').trim()
      if (!txt) return 0
      return ttsUtils.estimateDuration(txt, settings.rate)
    })

    const voiceOptions = computed(() => {
      return availableVoices.value.slice(0, 10)
    })

    // Preset configurations (keep interface, default normal)
    const presets = [
      { name: 'Slow', key: 'slow', description: 'Suitable for learning' },
      { name: 'Normal', key: 'normal', description: 'Standard speed' },
      { name: 'Fast', key: 'fast', description: 'Fast reading' }
    ]

    // 方法
    async function generateAudio() {
      if (!canGenerate.value) return

      try {
        const text = ttsUtils.preprocessText(effectiveText.value || '')
        await ttsGenerateAudio(text)
        // 生成后自动播放预览
        try { await ttsPlayAudio() } catch (e) { /* ignore autoplay error */ }
      } catch (error) {
        console.error('Generate audio failed:', error)
      }
    }

    function playAudio() {
      ttsPlayAudio().catch(error => {
        console.error('Play audio failed:', error)
      })
    }

    function stopAudio() {
      ttsStopAudio()
    }

    function downloadAudio() {
      const filename = `tts-${Date.now()}.mp3`
      ttsDownloadAudio(filename)
    }

    function applyPreset(presetKey) {
      usePreset(presetKey)
    }

    function regenerate() {
      if ((effectiveText.value || '').trim()) {
        generateAudio()
      }
    }

    function confirmUse() {
      if (generatedBlob.value) {
        const file = new File([generatedBlob.value], 'tts-audio.mp3', {
          type: 'audio/mpeg'
        })
        
        emit('audioGenerated', {
          file,
          blob: generatedBlob.value,
          url: generatedUrl.value,
          text: currentText.value,
          settings: { ...settings }
        })
      }
    }

    async function onLanguageChange() {
      // 简洁模式下跳过加载声音
      if (!showSettings.value) return
      try {
        await loadVoices(settings.language)
        settings.voice = 'auto'
      } catch (error) {
        console.error('Failed to load voices for language:', settings.language)
      }
    }

    // 生命周期
    onMounted(async () => {
      // 简洁模式：不加载声音列表，保持默认参数
      if (showSettings.value) {
        try { await loadVoices(settings.language) } catch (error) {
          console.error('Failed to load initial voices:', error)
        }
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    // 监听语言变化（仅在显示设置时）
    watch(() => settings.language, onLanguageChange)

    return {
      // 状态
      inputText,
      settings,
      isGenerating,
      isLoading,
      isPlaying,
      isAudioReady,
      canPlay,
      canGenerate,
      error,
      generatedUrl,
      currentText,
      voiceOptions,
      estimatedDuration,
      presets,
      useExternalText: computed(() => props.useExternalText),
      effectiveText,
      showSettings,

      // 方法
      generateAudio,
      playAudio,
      stopAudio,
      downloadAudio,
      applyPreset,
      regenerate,
      confirmUse,
      onLanguageChange
    }
  }
}
</script>
