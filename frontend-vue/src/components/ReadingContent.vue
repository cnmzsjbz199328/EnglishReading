<template>
  <div>
    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;flex-direction: row;">
      <h4 style="color: #374151; margin: 0; font-weight: 600;">📚 Reading Content</h4>
      <FontSizeControl 
        :font-size="fontSize"
        :min-font-size="minFontSize"
        :max-font-size="maxFontSize"
        @increase="handleIncrease"
        @decrease="handleDecrease"
        @reset="handleReset"
      />
    </div>
    
    <div 
      class="reading-content" 
      ref="readingContentRef" 
      :style="{ fontSize: fontSize + 'px' }"
    >
      <!-- 智能文字同步显示 -->
      <template v-if="hasContent && textSegments.length">
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
            @click="handleSegmentClick(index)"
            :title="`Segment ${index + 1} - Click to jump`"
            style="cursor: pointer;"
          >{{ segment.text }}</span>
          <!-- 句子间加空格，段落间不加 -->
          <span v-if="index < textSegments.length - 1 && !textSegments[index + 1]?.isNewParagraph"> </span>
        </template>
      </template>
      
      <!-- 简单显示模式 -->
      <template v-else-if="hasContent">
        {{ textContent }}
      </template>
      
      <template v-else>
        <div style="color: #6b7280; font-style: italic;">No text content available</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FontSizeControl from './FontSizeControl.vue'

const props = defineProps({
  detail: {
    type: Object,
    default: () => ({})
  },
  textSegments: {
    type: Array,
    default: () => []
  },
  getSegmentStatus: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['segment-click'])

const readingContentRef = ref(null)
const fontSize = ref(16)
const minFontSize = 12
const maxFontSize = 24

const hasContent = computed(() => {
  return textContent.value?.trim()
})

const textContent = computed(() => {
  return props.detail?.text || props.detail?.originalText || props.detail?.content
})

function handleIncrease() {
  if (fontSize.value < maxFontSize) {
    fontSize.value += 1
  }
}

function handleDecrease() {
  if (fontSize.value > minFontSize) {
    fontSize.value -= 1
  }
}

function handleReset() {
  fontSize.value = 16
}

function handleSegmentClick(index) {
  emit('segment-click', index)
}

defineExpose({
  readingContentRef
})
</script>
