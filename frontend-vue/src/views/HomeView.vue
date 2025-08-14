<script setup>
import { ref, onMounted } from 'vue'
import { useRecordings } from '../composables/useRecordings'
import FloatingPlayer from '../components/FloatingPlayer.vue'
import TTSAudioGenerator from '../components/TTSAudioGenerator.vue'

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
  const el = document.getElementById('file')
  if (el) el.value = ''
}

// TTS相关函数
function switchToTTS() {
  audioSource.value = 'tts'
  showTTSGenerator.value = true
  file.value = null
  const el = document.getElementById('file')
  if (el) el.value = ''
}

function switchToFileUpload() {
  audioSource.value = 'file'
  showTTSGenerator.value = false
  file.value = null
}

function onTTSAudioGenerated(audioData) {
  // 将TTS生成的音频设置为文件
  file.value = audioData.file
  showTTSGenerator.value = false
  // 可以添加一些用户反馈
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
                line-height: 1.7; 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 12px; 
                border-left: 4px solid #667eea;
                color: #2c3e50;
                font-size: 15px;
              ">{{ detail.text || detail.originalText }}</div>
            </div>
            
            <div>
              <h4 style="color: #374151; margin-bottom: 12px; font-weight: 600;">🎵 Audio Practice:</h4>
              <div style="
                padding: 20px; 
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                border-radius: 12px; 
                border-left: 4px solid #0ea5e9;
                color: #0c4a6e;
                font-size: 15px;
                text-align: center;
              ">
                <div style="font-size: 48px; margin-bottom: 12px;">🎧</div>
                <div style="font-weight: 600; margin-bottom: 8px;">现代化音频播放器已准备就绪</div>
                <div style="font-size: 14px; opacity: 0.8;">
                  页面底部的浮动播放器提供了专业的音频控制功能，包括速度调节、音量控制和进度跳转。
                </div>
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
              <div style="display: flex; gap: 16px; margin-bottom: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal;">
                  <input 
                    type="radio" 
                    :value="'file'" 
                    v-model="audioSource"
                    @change="switchToFileUpload"
                    style="margin: 0;"
                  />
                  <span>📁 Upload Audio File</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal;">
                  <input 
                    type="radio" 
                    :value="'tts'" 
                    v-model="audioSource"
                    @change="switchToTTS"
                    style="margin: 0;"
                  />
                  <span>🎤 Generate with Text-to-Speech</span>
                </label>
              </div>
            </div>
            
            <!-- 文件上传选项 -->
            <div v-if="audioSource === 'file'">
              <input 
                id="file" 
                type="file" 
                accept="audio/*" 
                @change="onFileChange"
                style="padding: 16px; border: 2px dashed #d1d5db; background: #f9fafb; width: 100%;"
              />
              <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                Upload an audio file (MP3/WAV) that corresponds to your reading text for pronunciation practice.
              </div>
            </div>
            
            <!-- TTS生成选项 -->
            <div v-else-if="audioSource === 'tts'">
              <div v-if="!showTTSGenerator" style="
                padding: 20px; 
                background: linear-gradient(135deg, #fef3e2 0%, #fef9e7 100%); 
                border: 2px dashed #f59e0b; 
                border-radius: 12px;
                text-align: center;
                cursor: pointer;
              " @click="showTTSGenerator = true">
                <div style="font-size: 48px; margin-bottom: 12px;">🎤</div>
                <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">Generate Audio with AI</div>
                <div style="font-size: 14px; color: #a16207;">
                  Click here to use Text-to-Speech technology to automatically generate audio from your reading text.
                </div>
              </div>
              
              <div v-if="file && audioSource === 'tts'" style="
                padding: 16px; 
                background: #f0f9ff; 
                border: 2px solid #0ea5e9; 
                border-radius: 8px;
                margin-top: 12px;
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
        
        <!-- TTS Audio Generator -->
        <div v-if="showTTSGenerator && audioSource === 'tts'" style="margin-top: 20px;">
          <TTSAudioGenerator 
            @audioGenerated="onTTSAudioGenerated"
            @close="showTTSGenerator = false"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 浮动播放器 -->
  <FloatingPlayer 
    ref="floatingPlayer"
    :audio-src="audioSrc" 
    :visible="!!detail && !!audioSrc"
  />
</template>

<style scoped>
/* 组件级响应式优化 */
@media (max-width: 640px) {
  .btn-text {
    display: none;
  }
  
  .header-actions .btn {
    padding: 10px 12px;
  }
  
  .header-actions .btn span:first-child {
    margin-right: 0 !important;
  }
}

@media (max-width: 480px) {
  .header {
    gap: 12px;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .header h1 {
    font-size: 1.4rem !important;
  }
  
  /* 练习选择区域在小屏幕上的优化 */
  .exercise-selection {
    flex-direction: column;
    align-items: stretch !important;
    gap: 8px;
  }
  
  .exercise-selection > div:first-child {
    min-width: unset;
  }
  
  .exercise-selection .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .header h1 {
    font-size: 1.2rem !important;
    line-height: 1.3;
  }
  
  .badge {
    font-size: 10px !important;
    padding: 3px 6px !important;
  }
  
  /* 模态框按钮在超小屏幕的优化 */
  .modal .btn {
    font-size: 12px;
    padding: 8px 10px;
  }
}

/* 音频元素的额外样式 */
.audio {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.audio:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* 详情区域的优化 */
#detail {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

#detail h3 {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* 文本内容区域的优化 */
.reading-content {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

@media (max-width: 640px) {
  .reading-content {
    max-height: 250px;
    font-size: 14px;
  }
}

/* 空状态图标的动画 */
.empty-state-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state-icon {
    animation: none;
  }
}
</style>
