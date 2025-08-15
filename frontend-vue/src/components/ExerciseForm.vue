<template>
  <div style="display: flex; flex-direction: column; gap: 20px; padding: 0 24px 24px 24px;">
    <div>
      <label>📝 Exercise Title</label>
      <input 
        id="title" 
        type="text" 
        placeholder="Give your exercise a memorable title..." 
        v-model.trim="formData.title" 
      />
    </div>
    
    <div>
      <label>📚 Reading Text</label>
      <textarea
        id="text"
        rows="8"
        placeholder="Paste your reading material here. This could be an article, story, or any text you'd like to practice reading..."
        v-model.trim="formData.text"
      ></textarea>
    </div>
    
    <AudioSourceSelector 
      v-model:source="formData.audioSource"
      v-model:file="formData.file"
      :text="formData.text"
      @tts-generated="handleTTSGenerated"
    />
    
    <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: nowrap;">
      <button
        class="btn"
        :disabled="loading"
        @click="handleSubmit"
        style="flex: 2; min-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
      >
        {{ loading ? '⏳ Uploading...' : '🚀 Create Exercise' }}
      </button>
      <button 
        class="btn secondary" 
        :disabled="loading" 
        @click="handleClear"
        style="flex: 1; min-width: 70px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
      >
        🔄 Clear
      </button>
    </div>
    
    <div
      class="status"
      :style="{ 
        color: error ? '#dc2626' : '#667eea',
        fontSize: '14px',
        textAlign: 'center',
        minHeight: '20px'
      }"
    >
      {{ status }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AudioSourceSelector from './AudioSourceSelector.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: ''
  },
  error: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'clear'])

const formData = reactive({
  title: '',
  text: '',
  file: null,
  audioSource: 'file'
})

function handleSubmit() {
  emit('submit', {
    title: formData.title,
    text: formData.text,
    file: formData.file
  })
}

function handleClear() {
  formData.title = ''
  formData.text = ''
  formData.file = null
  formData.audioSource = 'file'
  emit('clear')
}

function handleTTSGenerated(audioFile) {
  formData.file = audioFile
}
</script>
