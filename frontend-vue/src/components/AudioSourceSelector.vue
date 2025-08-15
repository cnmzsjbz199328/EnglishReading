<template>
  <div>
    <label>🎵 Audio Source</label>
    <div style="margin-bottom: 16px;">
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <!-- 文件上传选项 -->
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal; min-width: fit-content;">
            <input 
              type="radio" 
              value="file" 
              :checked="source === 'file'"
              @change="handleSourceChange"
              style="margin: 0;"
            />
            <span>📁 Upload Audio File</span>
          </label>
          
          <!-- 文件输入框 - 仅在选择文件时显示 -->
          <template v-if="source === 'file'">
            <input 
              type="file" 
              accept="audio/*" 
              @change="handleFileChange"
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
              value="tts" 
              :checked="source === 'tts'"
              @change="handleSourceChange"
              style="margin: 0;"
            />
            <span>🎤 Generate Voice</span>
          </label>
          
          <!-- TTS 控制按钮 - 仅在选择TTS时显示 -->
          <TTSGenerator 
            v-if="source === 'tts'"
            :text="text"
            @audio-generated="handleTTSGenerated"
          />
        </div>
      </div>
      
      <!-- 文件上传提示 -->
      <div v-if="source === 'file'" style="margin-top: 8px; font-size: 12px; color: #6b7280;">
        Upload an audio file (MP3/WAV) that corresponds to your reading text for pronunciation practice.
      </div>
    </div>
  </div>
</template>

<script setup>
import TTSGenerator from './TTSGenerator.vue'

const props = defineProps({
  source: {
    type: String,
    required: true
  },
  file: {
    type: File,
    default: null
  },
  text: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:source', 'update:file', 'tts-generated'])

function handleSourceChange(event) {
  const newSource = event.target.value
  emit('update:source', newSource)
  
  // 清理文件状态
  if (newSource === 'tts') {
    emit('update:file', null)
  }
}

function handleFileChange(event) {
  const selectedFile = event.target.files?.[0] || null
  emit('update:file', selectedFile)
}

function handleTTSGenerated(audioFile) {
  emit('update:file', audioFile)
  emit('tts-generated', audioFile)
}
</script>
