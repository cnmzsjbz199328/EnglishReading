<script setup>
import { ref, watch } from 'vue'
import { useRecordings } from '../composables/useRecordings'
import { useTextSync } from '../composables/useTextSync'

// 导入拆分后的组件
import ExerciseSelector from '../components/ExerciseSelector.vue'
import ReadingContent from '../components/ReadingContent.vue'
import CreateExerciseModal from '../components/CreateExerciseModal.vue'
import FloatingPlayer from '../components/FloatingPlayer.vue'

// Import component-specific styles
import '../assets/styles/home-view.css'

// 使用 composables
const {
  items,
  detail,
  audioSrc,
  modalOpen,
  globalStatus,
  createStatus,
  createError,
  loadingSubmit,
  loadList,
  openDetail,
  deleteItem,
  submit,
} = useRecordings()

const {
  audioDuration,
  textSegments,
  currentSegmentIndex,
  initTextSync,
  updateTime,
  getSegmentStatus,
  seekToSegment,
  scrollToCurrentSegment
} = useTextSync()

// 本地状态
const selectedId = ref('')
const floatingPlayer = ref(null)
const readingContentRef = ref(null)

// 事件处理函数
function handleExerciseSelect(id) {
  selectedId.value = id
  openDetail(id)
}

function handleExerciseDelete(id) {
  deleteItem(id)
  selectedId.value = ''
}

function handleModalClose() {
  modalOpen.value = false
}

function handleModalSubmit(formData) {
  submit(formData)
}

function handleSegmentClick(index) {
  const seekTime = seekToSegment(index)
  if (floatingPlayer.value && floatingPlayer.value.seekTo) {
    floatingPlayer.value.seekTo(seekTime)
  }
}

function onAudioTimeUpdate(currentTime) {
  const oldIndex = currentSegmentIndex.value
  updateTime(currentTime)
  
  // If paragraph changes, auto-scroll to current position
  if (currentSegmentIndex.value !== oldIndex && currentSegmentIndex.value !== -1) {
    setTimeout(() => {
      if (readingContentRef.value && readingContentRef.value.readingContentRef) {
        scrollToCurrentSegment(readingContentRef.value.readingContentRef)
      }
    }, 100)
  }
}

function onAudioLoaded(duration) {
  const textContent = detail.value?.text || detail.value?.originalText || detail.value?.content
  
  if (textContent && duration > 0) {
    initTextSync(textContent, duration)
  }
}

// 监听器
watch(detail, (newDetail) => {
  const textContent = newDetail?.text || newDetail?.originalText || newDetail?.content
  
  if (textContent && audioDuration.value > 0) {
    initTextSync(textContent, audioDuration.value)
  }
})

watch(audioDuration, (newDuration) => {
  const textContent = detail.value?.text || detail.value?.originalText || detail.value?.content
  
  if (textContent && newDuration > 0) {
    initTextSync(textContent, newDuration)
  }
})

// 初始化
loadList()
</script>

<template>
  <div class="container">
    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 顶部操作区域 -->
      <div style="margin-bottom: 0px; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="margin: 0; color: #2d3748;">English Reading</h1>
        <button 
          @click="modalOpen = true" 
          style="
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
          "
        >
          <span>new records</span>
        </button>
      </div>
      
      <!-- 练习选择区域 -->
      <ExerciseSelector 
        :items="items"
        :selected-id="selectedId"
        :global-status="globalStatus"
        @select="handleExerciseSelect"
        @delete="handleExerciseDelete"
      />

      <!-- 练习详情显示 -->
      <div id="detail">
        <template v-if="detail">
          <ReadingContent 
            ref="readingContentRef"
            :detail="detail"
            :text-segments="textSegments"
            :get-segment-status="getSegmentStatus"
            @segment-click="handleSegmentClick"
          />
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

    <!-- 创建练习模态框 -->
    <CreateExerciseModal 
      :is-open="modalOpen"
      :loading-submit="loadingSubmit"
      :create-status="createStatus"
      :create-error="createError"
      @close="handleModalClose"
      @submit="handleModalSubmit"
      @clear="() => {}"
    />

    <!-- 浮动播放器 -->
    <FloatingPlayer 
      ref="floatingPlayer"
      :audio-src="audioSrc" 
      :visible="!!detail && !!audioSrc"
      @time-update="onAudioTimeUpdate"
      @loaded="onAudioLoaded"
    />
  </div>
</template>
