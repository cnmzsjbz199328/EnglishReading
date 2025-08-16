<template>
  <div class="tts-settings">
    <div class="settings-grid">
      <!-- 语言选择 -->
      <div class="setting-item">
        <label for="language-select" class="setting-label">
          Language
        </label>
        <select 
          id="language-select" 
          v-model="localSettings.language"
          @change="onLanguageChange"
          class="setting-select"
        >
          <option 
            v-for="lang in supportedLanguages" 
            :key="lang.code" 
            :value="lang.code"
          >
            {{ lang.flag }} {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- 语音选择 -->
      <div class="setting-item">
        <label for="voice-select" class="setting-label">
          Voice
        </label>
        <select 
          id="voice-select" 
          v-model="localSettings.voice"
          class="setting-select"
        >
          <option value="auto">🤖 Auto Select (Recommended)</option>
          
          <!-- Premium Quality (Chirp3-HD) -->
          <optgroup v-if="premiumVoices.length > 0" label="✨ Premium Quality (Chirp3-HD) - Latest AI">
            <option 
              v-for="voice in premiumVoices.slice(0, 8)" 
              :key="voice.name" 
              :value="voice.name"
            >
              {{ getVoiceIcon(voice.gender) }} {{ voice.displayName }}
            </option>
            <option v-if="premiumVoices.length > 8" disabled>
              ... and {{ premiumVoices.length - 8 }} more premium voices
            </option>
          </optgroup>
          
          <!-- High Quality Voices -->
          <optgroup v-if="highQualityVoices.length > 0" label="🔥 High Quality (Neural2, Studio, News)">
            <option 
              v-for="voice in highQualityVoices.slice(0, 6)" 
              :key="voice.name" 
              :value="voice.name"
            >
              {{ getVoiceIcon(voice.gender) }} {{ voice.displayName }}
            </option>
            <option v-if="highQualityVoices.length > 6" disabled>
              ... and {{ highQualityVoices.length - 6 }} more high quality voices
            </option>
          </optgroup>
          
          <!-- Medium Quality Voices -->
          <optgroup v-if="mediumQualityVoices.length > 0" label="⚡ Standard Quality (Wavenet, Others)">
            <option 
              v-for="voice in mediumQualityVoices.slice(0, 4)" 
              :key="voice.name" 
              :value="voice.name"
            >
              {{ getVoiceIcon(voice.gender) }} {{ voice.displayName }}
            </option>
            <option v-if="mediumQualityVoices.length > 4" disabled>
              ... and {{ mediumQualityVoices.length - 4 }} more standard voices
            </option>
          </optgroup>
          
          <!-- Show All Voices Option -->
          <option v-if="availableVoices.length > 18" disabled>
            ──── Total: {{ availableVoices.length }} voices available ────
          </option>
        </select>
        
        <!-- Voice Info -->
        <div v-if="selectedVoiceInfo" class="voice-info">
          <span class="voice-series">{{ selectedVoiceInfo.series }}</span> • 
          <span class="voice-quality">{{ getQualityDescription(selectedVoiceInfo.quality) }}</span>
        </div>
      </div>

      <!-- 语速控制 -->
      <div class="setting-item">
        <label for="rate-slider" class="setting-label">
          Speed: {{ localSettings.rate }}x
          <span class="setting-hint">{{ getRateDescription(localSettings.rate) }}</span>
        </label>
        <input
          id="rate-slider"
          v-model.number="localSettings.rate"
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          class="setting-slider"
        />
        <div class="slider-labels">
          <span>0.5x</span>
          <span>1.0x</span>
          <span>2.0x</span>
        </div>
      </div>

      <!-- 音调控制 -->
      <div class="setting-item">
        <label for="pitch-slider" class="setting-label">
          Pitch: {{ localSettings.pitch > 0 ? '+' : '' }}{{ localSettings.pitch }}
          <span class="setting-hint">{{ getPitchDescription(localSettings.pitch) }}</span>
        </label>
        <input
          id="pitch-slider"
          v-model.number="localSettings.pitch"
          type="range"
          min="-10"
          max="10"
          step="1"
          class="setting-slider"
        />
        <div class="slider-labels">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>
    </div>

    <!-- 快速预设 -->
    <div class="presets-section">
      <span class="presets-label">Quick Presets:</span>
      <div class="preset-buttons">
        <button 
          v-for="(preset, key) in presets" 
          :key="key"
          @click="applyPreset(key)"
          class="preset-btn"
          :class="{ active: isCurrentPreset(key) }"
          :title="preset.description"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>

    <!-- 设置信息 -->
    <div class="settings-info">
      <div class="info-item">
        <span class="info-label">Selected Voice:</span>
        <span class="info-value">{{ getSelectedVoiceDisplay() }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Quality Level:</span>
        <span class="info-value">{{ getQualityLevel() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { 
  SUPPORTED_LANGUAGES, 
  TTS_PRESETS, 
  DEFAULT_TTS_SETTINGS,
  getVoicesForLanguage,
  getRecommendedVoice,
  getVoicesByQuality,
  getSeriesDescription,
  getQualityDescription
} from '../config/tts-voices.js'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({ ...DEFAULT_TTS_SETTINGS })
  }
})

const emit = defineEmits(['update:settings', 'change'])

// 本地设置状态
const localSettings = reactive({ ...props.settings })

// 支持的语言
const supportedLanguages = SUPPORTED_LANGUAGES

// 预设配置
const presets = TTS_PRESETS

// 计算属性：当前语言的语音列表
const availableVoices = computed(() => {
  return getVoicesForLanguage(localSettings.language)
})

// 计算属性：顶级质量语音 (Chirp3-HD)
const premiumVoices = computed(() => {
  return getVoicesByQuality(localSettings.language, 'premium')
})

// 计算属性：高质量语音 (Neural2, Studio, News, Chirp-HD)
const highQualityVoices = computed(() => {
  return getVoicesByQuality(localSettings.language, 'high')
})

// 计算属性：中等质量语音 (Wavenet, Casual, Polyglot)
const mediumQualityVoices = computed(() => {
  return getVoicesByQuality(localSettings.language, 'medium')
})

// 计算属性：当前选中语音的信息
const selectedVoiceInfo = computed(() => {
  if (localSettings.voice === 'auto') return null
  return availableVoices.value.find(v => v.name === localSettings.voice)
})

// 方法：获取语音图标
function getVoiceIcon(gender) {
  switch (gender) {
    case 'FEMALE': return '👩'
    case 'MALE': return '👨'
    default: return '🤖'
  }
}

// 方法：获取语速描述
function getRateDescription(rate) {
  if (rate <= 0.7) return 'Very Slow'
  if (rate <= 0.9) return 'Slow'
  if (rate <= 1.1) return 'Normal'
  if (rate <= 1.4) return 'Fast'
  return 'Very Fast'
}

// 方法：获取音调描述
function getPitchDescription(pitch) {
  if (pitch <= -5) return 'Very Low'
  if (pitch <= -2) return 'Low'
  if (pitch <= 2) return 'Normal'
  if (pitch <= 5) return 'High'
  return 'Very High'
}

// 方法：语言改变处理
function onLanguageChange() {
  // 当语言改变时，推荐一个合适的语音
  const recommended = getRecommendedVoice(localSettings.language)
  if (recommended) {
    localSettings.voice = recommended.name
  } else {
    localSettings.voice = 'auto'
  }
}

// 方法：应用预设
function applyPreset(presetKey) {
  const preset = presets[presetKey]
  if (preset) {
    localSettings.rate = preset.rate
    localSettings.pitch = preset.pitch
  }
}

// 方法：检查是否为当前预设
function isCurrentPreset(presetKey) {
  const preset = presets[presetKey]
  return preset && 
         Math.abs(localSettings.rate - preset.rate) < 0.1 &&
         localSettings.pitch === preset.pitch
}

// 方法：获取选中语音的显示名称
function getSelectedVoiceDisplay() {
  if (localSettings.voice === 'auto') {
    return 'Auto (Smart Selection)'
  }
  
  const voice = availableVoices.value.find(v => v.name === localSettings.voice)
  return voice ? voice.displayName : localSettings.voice
}

// 方法：获取质量等级
function getQualityLevel() {
  if (localSettings.voice === 'auto') {
    return 'Premium (Auto-selected best quality)'
  }
  
  const voice = availableVoices.value.find(v => v.name === localSettings.voice)
  if (voice) {
    return `${getQualityDescription(voice.quality)} - ${getSeriesDescription(voice.series)}`
  }
  return 'Unknown'
}

// 监听本地设置变化，同步到父组件
watch(localSettings, (newSettings) => {
  emit('update:settings', { ...newSettings })
  emit('change', { ...newSettings })
}, { deep: true })

// 监听父组件设置变化，同步到本地
watch(() => props.settings, (newSettings) => {
  Object.assign(localSettings, newSettings)
}, { deep: true })

// 组件挂载时确保有合适的默认语音
onMounted(() => {
  if (localSettings.voice === 'auto' || !availableVoices.value.find(v => v.name === localSettings.voice)) {
    const recommended = getRecommendedVoice(localSettings.language)
    if (recommended) {
      localSettings.voice = recommended.name
    }
  }
})
</script>

<style scoped>
.tts-settings {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.setting-hint {
  font-size: 11px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 8px;
}

.setting-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.voice-info {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
}

.voice-series {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.voice-quality {
  color: #374151;
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  margin-bottom: 4px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
}

.presets-section {
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.presets-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 6px 12px;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.preset-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.settings-info {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  color: #374151;
  font-weight: 500;
}
</style>
