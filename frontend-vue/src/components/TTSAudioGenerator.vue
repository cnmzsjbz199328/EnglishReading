<template>
  <div class="tts-audio-generator">
    <!-- 标题栏 -->
    <div class="tts-header">
      <h3 class="tts-title">
        <span class="icon">🎤</span>
        Text-to-Speech 音频生成
      </h3>
      <button 
        v-if="isAudioReady" 
        @click="$emit('close')"
        class="close-btn"
        aria-label="关闭"
      >
        ×
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-alert">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- 文本输入区域 -->
    <div class="text-input-section">
      <label for="tts-text" class="input-label">
        要转换的文本 <span class="required">*</span>
      </label>
      <textarea
        id="tts-text"
        v-model="inputText"
        placeholder="请输入要转换为语音的文本..."
        class="text-input"
        :disabled="isGenerating"
        rows="4"
        maxlength="5000"
      ></textarea>
      <div class="text-info">
        <span class="char-count" :class="{ 'over-limit': inputText.length > 5000 }">
          {{ inputText.length }}/5000 字符
        </span>
        <span v-if="inputText.trim()" class="duration-estimate">
          预计时长: ~{{ estimatedDuration }}秒
        </span>
      </div>
    </div>

    <!-- 语音设置 -->
    <div class="voice-settings">
      <h4 class="settings-title">语音设置</h4>
      
      <div class="settings-grid">
        <!-- 语言选择 -->
        <div class="setting-item">
          <label for="language-select">语言</label>
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
            <option value="cmn-CN">中文 (普通话)</option>
            <option value="ja-JP">日本語</option>
            <option value="ko-KR">한국어</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
          </select>
        </div>

        <!-- 声音选择 -->
        <div class="setting-item">
          <label for="voice-select">声音</label>
          <select 
            id="voice-select" 
            v-model="settings.voice"
            :disabled="isGenerating || voiceOptions.length === 0"
            class="setting-select"
          >
            <option value="auto">自动选择</option>
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
            <span>慢</span>
            <span>正常</span>
            <span>快</span>
          </div>
        </div>

        <!-- 音调 -->
        <div class="setting-item">
          <label for="pitch-slider">
            音调: {{ settings.pitch > 0 ? '+' : '' }}{{ settings.pitch }}
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
            <span>低</span>
            <span>标准</span>
            <span>高</span>
          </div>
        </div>
      </div>

      <!-- 预设配置 -->
      <div class="presets">
        <span class="presets-label">快速设置:</span>
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

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button
        @click="generateAudio"
        :disabled="!canGenerate || isGenerating"
        class="btn btn-primary generate-btn"
      >
        <span v-if="isGenerating" class="loading-spinner"></span>
        {{ isGenerating ? '生成中...' : '生成语音' }}
      </button>

      <button
        v-if="isAudioReady"
        @click="playAudio"
        :disabled="!canPlay"
        class="btn btn-secondary play-btn"
      >
        {{ isPlaying ? '播放中...' : '预览播放' }}
      </button>

      <button
        v-if="isAudioReady"
        @click="stopAudio"
        :disabled="!isPlaying"
        class="btn btn-secondary stop-btn"
      >
        停止
      </button>

      <button
        v-if="isAudioReady"
        @click="downloadAudio"
        class="btn btn-secondary download-btn"
      >
        下载音频
      </button>
    </div>

    <!-- 音频预览区域 -->
    <div v-if="isAudioReady" class="audio-preview">
      <div class="preview-header">
        <span class="preview-title">🎵 音频预览</span>
        <span class="preview-text">{{ currentText.substring(0, 100) }}{{ currentText.length > 100 ? '...' : '' }}</span>
      </div>
      
      <audio 
        v-if="generatedUrl" 
        :src="generatedUrl" 
        controls 
        class="audio-player"
        preload="metadata"
      ></audio>

      <!-- 确认使用按钮 -->
      <div class="confirm-actions">
        <button
          @click="confirmUse"
          class="btn btn-success confirm-btn"
        >
          ✓ 使用此音频
        </button>
        <button
          @click="regenerate"
          class="btn btn-outline regenerate-btn"
        >
          🔄 重新生成
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTTS, ttsUtils } from '../composables/useTTS.js'

export default {
  name: 'TTSAudioGenerator',
  emits: ['audioGenerated', 'close'],
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

    // 本地状态
    const inputText = ref('')

    // 计算属性
    const canGenerate = computed(() => {
      const text = inputText.value.trim()
      return text.length > 0 && text.length <= 5000 && !isGenerating.value
    })

    const estimatedDuration = computed(() => {
      if (!inputText.value.trim()) return 0
      return ttsUtils.estimateDuration(inputText.value, settings.rate)
    })

    const voiceOptions = computed(() => {
      return availableVoices.value.slice(0, 10) // 限制显示数量
    })

    // 预设配置
    const presets = [
      { name: '慢速', key: 'slow', description: '适合学习' },
      { name: '正常', key: 'normal', description: '标准语速' },
      { name: '快速', key: 'fast', description: '快速阅读' }
    ]

    // 方法
    async function generateAudio() {
      if (!canGenerate.value) return

      try {
        const text = ttsUtils.preprocessText(inputText.value)
        await ttsGenerateAudio(text)
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
      if (inputText.value.trim()) {
        generateAudio()
      }
    }

    function confirmUse() {
      if (generatedBlob.value) {
        // 创建一个File对象以便上传
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
      // 当语言改变时，重新加载声音列表
      try {
        await loadVoices(settings.language)
        // 重置为自动选择
        settings.voice = 'auto'
      } catch (error) {
        console.error('Failed to load voices for language:', settings.language)
      }
    }

    // 生命周期
    onMounted(async () => {
      // 初始加载默认语言的声音列表
      try {
        await loadVoices(settings.language)
      } catch (error) {
        console.error('Failed to load initial voices:', error)
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    // 监听语言变化
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

<style scoped>
.tts-audio-generator {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.tts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.tts-title {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 1.1rem;
}

.text-input-section {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input:disabled {
  background: #f9fafb;
  color: #6b7280;
}

.text-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.char-count.over-limit {
  color: #dc2626;
  font-weight: 500;
}

.voice-settings {
  margin-bottom: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.settings-title {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-item label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.setting-select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.setting-select:disabled {
  background: #f3f4f6;
  color: #6b7280;
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.loading-voices {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}

.presets {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.presets-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.preset-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.preset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-outline {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.audio-preview {
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 8px;
  padding: 20px;
}

.preview-header {
  margin-bottom: 16px;
}

.preview-title {
  display: block;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 8px;
}

.preview-text {
  display: block;
  font-size: 13px;
  color: #0369a1;
  font-style: italic;
}

.audio-player {
  width: 100%;
  margin-bottom: 16px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 640px) {
  .tts-audio-generator {
    padding: 16px;
    margin: 16px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons,
  .confirm-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>
