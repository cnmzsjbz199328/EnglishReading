<template>
  <div v-if="visible && audioSrc" class="floating-player">
    <div v-if="!audioSrc" class="no-media">
      无可用音频
    </div>
    
    <div v-else class="player-row">
      <!-- 播放按钮 -->
      <button class="play-btn" @click="togglePlay" :aria-label="isPlaying ? '暂停' : '播放'">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      
      <!-- 进度控制 -->
      <div class="progress-container">
        <div class="time-bar">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        <div class="progress-bar" @click="seekTo" ref="progressBar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      
      <!-- 速度控制 -->
      <div class="speed-control">
        <button class="speed-btn" @click="changeSpeed(-0.1)" aria-label="减速">−</button>
        <div class="speed-display">{{ playbackRate.toFixed(1) }}×</div>
        <button class="speed-btn" @click="changeSpeed(0.1)" aria-label="加速">+</button>
      </div>
      
      <!-- 音量控制 -->
      <div class="volume-control">
        <button class="volume-btn" @click="toggleMute" :aria-label="isMuted ? '取消静音' : '静音'">
          {{ isMuted ? '🔇' : '🔊' }}
        </button>
        <div class="volume-slider" @click="setVolume" ref="volumeSlider">
          <div class="volume-fill" :style="{ width: (volume * 100) + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- 隐藏的音频元素 -->
    <audio 
      ref="audioElement"
      :src="audioSrc"
      class="hidden-audio"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @play="onPlay"
      @pause="onPause"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  audioSrc: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['timeUpdate'])

// 音频元素引用
const audioElement = ref(null)
const progressBar = ref(null)
const volumeSlider = ref(null)

// 播放状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1.0)
const volume = ref(0.7)
const isMuted = ref(false)

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 监听音频源变化
watch(() => props.audioSrc, (newSrc) => {
  if (newSrc && audioElement.value) {
    audioElement.value.load()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }
}, { immediate: true })

// 播放控制
const togglePlay = () => {
  if (!audioElement.value) return
  
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

// 速度控制
const changeSpeed = (delta) => {
  const newRate = Math.max(0.5, Math.min(2.0, playbackRate.value + delta))
  playbackRate.value = Math.round(newRate * 10) / 10
  if (audioElement.value) {
    audioElement.value.playbackRate = playbackRate.value
  }
}

// 进度控制
const seekTo = (event) => {
  if (!audioElement.value || !progressBar.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percent = clickX / rect.width
  const seekTime = percent * duration.value
  
  audioElement.value.currentTime = seekTime
}

// 音量控制
const setVolume = (event) => {
  if (!audioElement.value || !volumeSlider.value) return
  
  const rect = volumeSlider.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percent = Math.max(0, Math.min(1, clickX / rect.width))
  
  volume.value = percent
  audioElement.value.volume = volume.value
  
  if (volume.value > 0) {
    isMuted.value = false
  }
}

const toggleMute = () => {
  if (!audioElement.value) return
  
  isMuted.value = !isMuted.value
  audioElement.value.muted = isMuted.value
}

// 时间格式化
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 音频事件处理
const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration || 0
    audioElement.value.volume = volume.value
    audioElement.value.playbackRate = playbackRate.value
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime || 0
    // 触发时间更新事件，用于文字同步
    emit('timeUpdate', currentTime.value)
  }
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

// 暴露给父组件的方法
defineExpose({
  play: () => audioElement.value?.play(),
  pause: () => audioElement.value?.pause(),
  seek: (time) => {
    if (audioElement.value) audioElement.value.currentTime = time
  },
  setPlaybackRate: (rate) => {
    playbackRate.value = rate
    if (audioElement.value) audioElement.value.playbackRate = rate
  }
})
</script>

<style scoped>
/* 组件专用样式已在 player.css 中定义 */
</style>
