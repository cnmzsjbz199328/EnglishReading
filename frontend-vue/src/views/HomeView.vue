<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRecordings } from '../composables/useRecordings'
import { useTextSync } from '../composables/useTextSync'
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

// 智能文字同步
const {
  currentTime,
  audioDuration,
  textSegments,
  timings,
  currentSegmentIndex,
  progressPercent,
  initTextSync,
  updateTime,
  getSegmentStatus,
  seekToSegment,
  scrollToCurrentSegment
} = useTextSync()

// 浮动播放器引用
const floatingPlayer = ref(null)
const readingContentRef = ref(null)

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
  const oldIndex = currentSegmentIndex.value
  updateTime(currentTime)
  
  // 如果段落变化，自动滚动到当前位置
  if (currentSegmentIndex.value !== oldIndex && currentSegmentIndex.value !== -1) {
    setTimeout(() => {
      if (readingContentRef.value) {
        scrollToCurrentSegment(readingContentRef.value)
      }
    }, 100) // 小延迟确保DOM更新完成
  }
}

// 点击段落跳转
function onSegmentClick(index) {
  const seekTime = seekToSegment(index)
  if (floatingPlayer.value && floatingPlayer.value.seekTo) {
    floatingPlayer.value.seekTo(seekTime)
  }
}

// 监听详情变化，初始化文字同步
watch(detail, (newDetail) => {
  // 尝试多个可能的文本字段
  const textContent = newDetail?.text || newDetail?.originalText || newDetail?.content
  
  if (textContent && audioDuration.value > 0) {
    initTextSync(textContent, audioDuration.value)
  }
})

// 监听音频时长变化
watch(audioDuration, (newDuration) => {
  // 尝试多个可能的文本字段
  const textContent = detail.value?.text || detail.value?.originalText || detail.value?.content
  
  if (textContent && newDuration > 0) {
    initTextSync(textContent, newDuration)
  }
})

// 监听音频加载完成
function onAudioLoaded(duration) {
  // 尝试多个可能的文本字段
  const textContent = detail.value?.text || detail.value?.originalText || detail.value?.content
  
  if (textContent && duration > 0) {
    initTextSync(textContent, duration)
  }
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
    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 顶部操作区域 -->
      <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="margin: 0; color: #2d3748;">English Reading</h1>
        <button @click="openModal" style="
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          min-width: 40px;
          justify-content: center;
        ">
          <span>📝</span>
        </button>
      </div>
      
      <!-- 练习选择区域 -->
      <div style="margin-bottom: 32px;">
        <div class="status" style="margin-bottom: 16px;">{{ globalStatus }}</div>
        
        <div v-if="!items.length" class="muted" style="text-align: center; padding: 40px 0;">
          <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📚</div>
          <div style="font-size: 16px;">No exercises yet. Create your first one!</div>
        </div>
        
        <div v-else class="exercise-selection" style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="flex: 0 0 70%; min-width: 0;">
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
            style="
              flex: 0 0 calc(30% - 12px); 
              min-width: 0; 
              padding: 8px 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-width: 40px;
            "
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>

      <!-- 练习详情显示 -->
      <div id="detail">
        <template v-if="detail">
          <div>
            <div>
              <div style="margin-bottom: 12px;">
                <h4 style="color: #374151; margin: 0; font-weight: 600;">📚 Reading Content</h4>
              </div>
              <div class="reading-content" ref="readingContentRef">
                <!-- 智能文字同步显示 -->
                <template v-if="(detail.text || detail.originalText || detail.content) && textSegments.length">
                  <template v-for="(segment, index) in textSegments" :key="index">
                    <!-- 段落开始时添加换行 -->
                    <br v-if="segment.isNewParagraph && index > 0" />
                    <span
                      :data-segment-index="index"
                      :class="[
                        'text-segment',
                        `segment-${getSegmentStatus(index)}`,
                        { 'paragraph-start': segment.isNewParagraph }
                      ]"
                      @click="onSegmentClick(index)"
                      :title="`Segment ${index + 1} - Click to jump`"
                      style="cursor: pointer;"
                    >{{ segment.text }}</span>
                    <!-- 句子间加空格，段落间不加 -->
                    <span v-if="index < textSegments.length - 1 && !textSegments[index + 1]?.isNewParagraph"> </span>
                  </template>
                </template>
                <!-- 简单显示模式 -->
                <template v-else-if="detail.text || detail.originalText || detail.content">
                  {{ detail.text || detail.originalText || detail.content }}
                </template>
                <template v-else>
                  <div style="color: #6b7280; font-style: italic;">No text content available</div>
                </template>
              </div>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="empty-state">
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
    @loaded="onAudioLoaded"
  />
</template>