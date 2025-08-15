<script setup>
import { ref, onMounted } from 'vue'
import { useRecordings } from '../composables/useRecordings'
import FloatingPlayer from '../components/FloatingPlayer.vue'
// 引入组件专用样式
import '../assets/styles/home-view.css'

const {
  items,
  detail,
  audioSrc,
  modalOpen,
  globalStatus,
  createStatus,
  createError,
  loadingList,
  loadingSubmit,
  loadList,
  openDetail,
  deleteItem,
  submit,
} = useRecordings()

// form refs
const title = ref('')
const text = ref('')
const file = ref(null)
const showTTSGenerator = ref(false)
const audioSource = ref('file') // 'file' 或 'tts'

// TTS 相关状态
const showTTSSettings = ref(false)
const isGeneratingTTS = ref(false)
const generatedAudioUrl = ref(null)
const generatedAudioBlob = ref(null)
const ttsSettings = ref({
  language: 'en-US',
  rate: 1.0,
  voice: 'auto',
  pitch: 0
})

// 文字同步状态
const currentPlayTime = ref(0)
const highlightedWordIndex = ref(-1)

// 浮动播放器引用
const floatingPlayer = ref(null)

function onFileChange(e) {
  file.value = e.target.files?.[0] || null
}
function openModal() {
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
function clearForm() {
  title.value = ''
  text.value = ''
  file.value = null
  audioSource.value = 'file'
  showTTSGenerator.value = false
  showTTSSettings.value = false
  generatedAudioUrl.value = null
  generatedAudioBlob.value = null
  const el = document.getElementById('file')
  if (el) el.value = ''
}

// TTS相关函数
async function generateTTSAudio() {
  if (!text.value.trim()) return
  
  isGeneratingTTS.value = true
  try {
    // 这里调用 TTS API
    const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/tts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.value.trim(),
        language: ttsSettings.value.language,
        voice: ttsSettings.value.voice,
        rate: ttsSettings.value.rate,
        pitch: ttsSettings.value.pitch,
        encoding: 'MP3'
      })
    })
    
    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`)
    }
    
    const audioBlob = await response.blob()
    generatedAudioBlob.value = audioBlob
    
    // 清理之前的 URL
    if (generatedAudioUrl.value) {
      URL.revokeObjectURL(generatedAudioUrl.value)
    }
    
    generatedAudioUrl.value = URL.createObjectURL(audioBlob)
    
  } catch (error) {
    console.error('TTS generation failed:', error)
    alert('语音生成失败: ' + error.message)
  } finally {
    isGeneratingTTS.value = false
  }
}

function confirmTTSAudio() {
  if (generatedAudioBlob.value) {
    // 创建 File 对象
    file.value = new File([generatedAudioBlob.value], 'tts-audio.mp3', {
      type: 'audio/mpeg'
    })
  }
}

function regenerateTTSAudio() {
  generateTTSAudio()
}

// 文字同步相关
function onAudioTimeUpdate(currentTime) {
  currentPlayTime.value = currentTime
  // 简单的单词高亮逻辑 - 根据时间估算当前单词位置
  if (detail.value?.text) {
    const totalWords = detail.value.text.split(/\s+/).length
    const estimatedDuration = Math.ceil(totalWords / 150 * 60) // 假设150词/分钟
    const wordProgress = (currentTime / estimatedDuration) * totalWords
    highlightedWordIndex.value = Math.floor(wordProgress)
  }
}

function getWordClass(wordIndex) {
  if (highlightedWordIndex.value === -1) return ''
  if (wordIndex === highlightedWordIndex.value) return 'word-current'
  if (wordIndex < highlightedWordIndex.value) return 'word-past'
  return ''
}

// dropdown selection for exercises

// TTS相关函数
function switchToTTS() {
  audioSource.value = 'tts'
  showTTSGenerator.value = false
  file.value = null
  const el = document.getElementById('file')
  if (el) el.value = ''
}

function switchToFileUpload() {
  audioSource.value = 'file'
  showTTSGenerator.value = false
  file.value = null
  // 清理 TTS 相关状态
  if (generatedAudioUrl.value) {
    URL.revokeObjectURL(generatedAudioUrl.value)
    generatedAudioUrl.value = null
  }
  generatedAudioBlob.value = null
}

// dropdown selection for exercises
const selectedId = ref('')
function onSelectChange() {
  if (selectedId.value) openDetail(selectedId.value)
}
function deleteSelected() {
  if (selectedId.value) {
    deleteItem(selectedId.value)
    selectedId.value = ''
  }
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="container">
    <!-- 现代化头部 -->
    <div class="header">
      <div class="header-left">
        <h1>English Reading</h1>
      </div>
      <div class="header-actions">
        <button class="btn" @click="openModal">
          <span>📝</span> New Exercise
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 练习选择区域 -->
      <div style="margin-bottom: 32px;">
        <div class="status" style="margin-bottom: 16px;">{{ globalStatus }}</div>
        
        <div v-if="!items.length" class="muted" style="text-align: center; padding: 40px 0;">
          <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📚</div>
          <div style="font-size: 16px;">No exercises yet. Create your first one!</div>
        </div>
        
        <div v-else class="exercise-selection" style="display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <select v-model="selectedId" @change="onSelectChange" aria-label="Select an exercise" style="width: 100%;">
              <option value="" disabled>🎯 Select an exercise to practice...</option>
              <option v-for="it in items" :key="it.id" :value="it.id">
                {{ it.title || '(Untitled Exercise)' }}
              </option>
            </select>
          </div>
          <button 
            class="btn danger" 
            :disabled="!selectedId" 
            @click="deleteSelected"
            style="flex-shrink: 0; white-space: nowrap;"
          >
            <span style="display: inline-block; margin-right: 4px;">🗑️</span>
            <span class="btn-text">Delete</span>
          </button>
        </div>
      </div>

      <!-- 练习详情显示 -->
      <div id="detail" style="background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e3e8ef;">
        <template v-if="detail">
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <h4 style="color: #374151; margin-bottom: 12px; font-weight: 600;">📚 Reading Content:</h4>
              <div class="reading-content" style="
                white-space: pre-wrap; 
                line-height: 1.75; 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 12px; 
                border-left: 4px solid #667eea;
                color: #2c3e50;
                font-size: 15px;
                max-height: 50vh;
                overflow-y: auto;
              ">
                <template v-if="detail.text">
                  <span
                    v-for="(word, index) in detail.text.split(/(\s+)/)"
                    :key="index"
                    :class="getWordClass(Math.floor(index / 2))"
                    class="word-segment"
                  >{{ word }}</span>
                </template>
                <template v-else>{{ detail.originalText }}</template>
              </div>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
            <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🎯</div>
            <div style="font-size: 18px; margin-bottom: 8px;">Ready to Practice?</div>
            <div style="font-size: 14px;">Select an exercise from the dropdown above to begin your reading practice.</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 现代化模态框 -->
    <div
      id="exerciseModal"
      class="modal-backdrop"
      :style="{ display: modalOpen ? 'flex' : 'none' }"
      aria-hidden="true"
      @click.self="closeModal"
    >
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h2 id="modalTitle">✨ Create New Exercise</h2>
          <button class="btn secondary" @click="closeModal" aria-label="Close">✕</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label>📝 Exercise Title</label>
            <input 
              id="title" 
              type="text" 
              placeholder="Give your exercise a memorable title..." 
              v-model.trim="title" 
            />
          </div>
          
          <div>
            <label>📚 Reading Text</label>
            <textarea
              id="text"
              rows="8"
              placeholder="Paste your reading material here. This could be an article, story, or any text you'd like to practice reading..."
              v-model.trim="text"
            ></textarea>
          </div>
          
          <div>
            <label>🎵 Audio Source</label>
            <div style="margin-bottom: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
              <!-- 文件上传选项 -->
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal; min-width: fit-content;">
                  <input 
                    type="radio" 
                    :value="'file'" 
                    v-model="audioSource"
                    @change="switchToFile"
                    style="margin: 0;"
                  />
                  <span>📁 Upload Audio File</span>
                </label>
                
                <!-- 文件输入框 - 仅在选择文件时显示 -->
                <template v-if="audioSource === 'file'">
                  <input 
                    id="file" 
                    type="file" 
                    accept="audio/*" 
                    @change="onFileChange"
                    style="
                      flex: 1;
                      min-width: 200px;
                      padding: 8px 12px; 
                      border: 2px dashed #d1d5db; 
                      background: #f9fafb; 
                      border-radius: 6px;
                      font-size: 13px;
                    "
                  />
                </template>
              </div>
              
              <!-- TTS生成选项 -->
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal; min-width: fit-content;">
                  <input 
                    type="radio" 
                    :value="'tts'" 
                    v-model="audioSource"
                    @change="switchToTTS"
                    style="margin: 0;"
                  />
                  <span>🎤 Generate Voice</span>
                </label>
                
                <!-- TTS 控制按钮 - 仅在选择TTS时显示 -->
                <template v-if="audioSource === 'tts'">
                  <button
                    @click="generateTTSAudio"
                    :disabled="!text.trim() || isGeneratingTTS"
                    style="
                      padding: 8px 12px; 
                      background: #3b82f6; 
                      color: white; 
                      border: none; 
                      border-radius: 6px; 
                      font-weight: 500;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      transition: all 0.2s;
                      font-size: 16px;
                      min-width: 40px;
                      justify-content: center;
                    "
                    :style="{ 
                      opacity: (!text.trim() || isGeneratingTTS) ? 0.5 : 1,
                      background: isGeneratingTTS ? '#6b7280' : '#3b82f6' 
                    }"
                    :title="isGeneratingTTS ? 'Generating audio...' : 'Generate audio'"
                  >
                    <span v-if="isGeneratingTTS" style="
                      width: 12px; 
                      height: 12px; 
                      border: 2px solid transparent; 
                      border-top: 2px solid currentColor; 
                      border-radius: 50%; 
                      animation: spin 1s linear infinite;
                    "></span>
                    <span v-else>Start</span>
                  </button>
                  
                  <button
                    @click="showTTSSettings = !showTTSSettings"
                    style="
                      padding: 8px 12px; 
                      background: white; 
                      color: #6b7280; 
                      border: 1px solid #d1d5db; 
                      border-radius: 6px; 
                      font-size: 16px;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      min-width: 40px;
                      justify-content: center;
                    "
                    :title="showTTSSettings ? 'Hide settings' : 'Show settings'"
                  >
                    <span style="font-size: 14px;">Settings</span>
                  </button>
                  
                  <div style="font-size: 11px; color: #6b7280; font-style: italic;">
                    {{ text.length }} 字符 · 预计 ~{{ Math.ceil(text.split(/\s+/).length / 150 * 60) }}秒
                  </div>
                </template>
              </div>
            </div>
            
            <!-- 文件上传提示 -->
            <div v-if="audioSource === 'file'" style="margin-top: 8px; font-size: 12px; color: #6b7280;">
              Upload an audio file (MP3/WAV) that corresponds to your reading text for pronunciation practice.
            </div>
            
            <!-- TTS生成选项 -->
            <div v-else-if="audioSource === 'tts'">              
              <!-- TTS 高级设置（可折叠） -->
              <div v-if="showTTSSettings" style="
                background: #f9fafb; 
                border: 1px solid #e5e7eb; 
                border-radius: 8px; 
                padding: 16px; 
                margin-bottom: 16px;
              ">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">语言</label>
                    <select v-model="ttsSettings.language" style="
                      width: 100%; 
                      padding: 6px 8px; 
                      border: 1px solid #d1d5db; 
                      border-radius: 6px; 
                      font-size: 13px;
                    ">
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="en-AU">English (AU)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">语速: {{ ttsSettings.rate }}x</label>
                    <input 
                      v-model.number="ttsSettings.rate" 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1"
                      style="width: 100%; height: 6px; border-radius: 3px; background: #e5e7eb;"
                    />
                  </div>
                </div>
              </div>
              
              <!-- 生成成功提示 -->
              <div v-if="file && audioSource === 'tts'" style="
                padding: 16px; 
                background: #f0f9ff; 
                border: 2px solid #0ea5e9; 
                border-radius: 8px;
                margin-bottom: 16px;
              ">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 24px;">✅</span>
                  <div>
                    <div style="font-weight: 600; color: #0c4a6e;">TTS Audio Generated Successfully</div>
                    <div style="font-size: 14px; color: #0369a1;">
                      Audio has been generated and is ready to use with your exercise.
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 音频预览 -->
              <div v-if="generatedAudioUrl" style="
                background: #f0f9ff; 
                border: 2px solid #bae6fd; 
                border-radius: 8px; 
                padding: 16px;
                margin-bottom: 16px;
              ">
                <div style="font-weight: 600; color: #0369a1; margin-bottom: 12px;">🎵 音频预览</div>
                <audio 
                  :src="generatedAudioUrl" 
                  controls 
                  style="width: 100%; margin-bottom: 12px;"
                  preload="metadata"
                ></audio>
                <div style="display: flex; gap: 8px; justify-content: center;">
                  <button
                    @click="confirmTTSAudio"
                    style="
                      padding: 8px 16px; 
                      background: #10b981; 
                      color: white; 
                      border: none; 
                      border-radius: 6px; 
                      font-weight: 500;
                      cursor: pointer;
                    "
                  >
                    ✓ 使用此音频
                  </button>
                  <button
                    @click="regenerateTTSAudio"
                    style="
                      padding: 8px 16px; 
                      background: white; 
                      color: #6b7280; 
                      border: 1px solid #d1d5db; 
                      border-radius: 6px;
                      cursor: pointer;
                    "
                  >
                    🔄 重新生成
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 8px; display: flex; gap: 12px; flex-wrap: wrap;">
            <button
              class="btn"
              :disabled="loadingSubmit"
              @click="submit({ title, text, file: file })"
              style="flex: 1; min-width: 150px;"
            >
              {{ loadingSubmit ? '⏳ Uploading...' : '🚀 Create Exercise' }}
            </button>
            <button class="btn secondary" :disabled="loadingSubmit" @click="clearForm">
              🔄 Clear Form
            </button>
          </div>
          
          <div
            id="createStatus"
            class="status"
            :style="{ 
              color: createError ? '#dc2626' : '#667eea',
              fontSize: '14px',
              textAlign: 'center',
              minHeight: '20px'
            }"
          >
            {{ createStatus }}
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 浮动播放器 -->
  <FloatingPlayer 
    ref="floatingPlayer"
    :audio-src="audioSrc" 
    :visible="!!detail && !!audioSrc"
    @time-update="onAudioTimeUpdate"
  />
</template>