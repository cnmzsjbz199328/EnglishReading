<template>
  <div>
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <button
        @click="generateAudio"
        :disabled="!text.trim() || isGenerating"
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
          opacity: (!text.trim() || isGenerating) ? 0.5 : 1,
          background: isGenerating ? '#6b7280' : '#3b82f6' 
        }"
        :title="isGenerating ? 'Generating audio...' : 'Generate audio'"
      >
        <span v-if="isGenerating" style="
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
        @click="showSettings = !showSettings"
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
        :title="showSettings ? 'Hide settings' : 'Show settings'"
      >
        <span style="font-size: 14px;">Settings</span>
      </button>
      
      <div style="font-size: 11px; color: #6b7280; font-style: italic;">
        {{ text.length }} characters · Est. ~{{ Math.ceil(text.split(/\s+/).length / 150 * 60) }}s
      </div>
    </div>
    
    <!-- TTS 高级设置（可折叠） -->
    <div v-if="showSettings" style="
      background: #f9fafb; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 16px 0;
    ">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">Language</label>
          <select v-model="settings.language" style="
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
          <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px;">Speed: {{ settings.rate }}x</label>
          <input 
            v-model.number="settings.rate" 
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
    <div v-if="generatedFile" style="
      padding: 16px; 
      background: #f0f9ff; 
      border: 2px solid #0ea5e9; 
      border-radius: 8px;
      margin: 16px 0;
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
    <div v-if="audioUrl" style="
      background: #f0f9ff; 
      border: 2px solid #bae6fd; 
      border-radius: 8px; 
      padding: 16px;
      margin: 16px 0;
    ">
      <div style="font-weight: 600; color: #0369a1; margin-bottom: 12px;">🎵 Audio Preview</div>
      <audio 
        :src="audioUrl" 
        controls 
        style="width: 100%; margin-bottom: 12px;"
        preload="metadata"
      ></audio>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button
          @click="confirmAudio"
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
          ✓ Use This Audio
        </button>
        <button
          @click="regenerateAudio"
          style="
            padding: 8px 16px; 
            background: white; 
            color: #6b7280; 
            border: 1px solid #d1d5db; 
            border-radius: 6px;
            cursor: pointer;
          "
        >
          🔄 Regenerate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['audio-generated'])

const showSettings = ref(false)
const isGenerating = ref(false)
const audioUrl = ref(null)
const generatedFile = ref(null)

const settings = reactive({
  language: 'en-US',
  rate: 1.0,
  voice: 'auto',
  pitch: 0
})

async function generateAudio() {
  if (!props.text.trim()) return
  
  isGenerating.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/tts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: props.text.trim(),
        language: settings.language,
        voice: settings.voice,
        rate: settings.rate,
        pitch: settings.pitch,
        encoding: 'MP3'
      })
    })
    
    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`)
    }
    
    const audioBlob = await response.blob()
    
    // Clean up previous URL
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    
    audioUrl.value = URL.createObjectURL(audioBlob)
    generatedFile.value = new File([audioBlob], 'tts-audio.mp3', {
      type: 'audio/mpeg'
    })
    
  } catch (error) {
    console.error('TTS generation failed:', error)
    alert('TTS generation failed: ' + error.message)
  } finally {
    isGenerating.value = false
  }
}

function confirmAudio() {
  if (generatedFile.value) {
    emit('audio-generated', generatedFile.value)
  }
}

function regenerateAudio() {
  generateAudio()
}
</script>
