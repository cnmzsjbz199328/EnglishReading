import { ref, computed } from 'vue'

export function useTextSync() {
  const currentTime = ref(0)
  const audioDuration = ref(0)
  const textSegments = ref([])
  const timings = ref([])
  const currentSegmentIndex = ref(-1)

  // 智能分段：优先按句子，其次按短语，最后按单词
  function segmentText(text) {
    if (!text) return []
    
    // 1. 先按段落分割
    const paragraphs = text.split(/\n+/).filter(Boolean)
    
    let segments = []
    for (const para of paragraphs) {
      // 2. 按句子分割 (改进的正则表达式)
      const sentences = para.split(/(?<=[.!?。！？])\s+/)
        .filter(s => s.trim().length > 0)
      
      for (const sentence of sentences) {
        // 3. 如果句子太长(>100字符)，按短语分割
        if (sentence.length > 100) {
          const phrases = sentence.split(/(?<=[,;，；])\s+/)
            .filter(p => p.trim().length > 0)
          segments.push(...phrases)
        } else {
          segments.push(sentence)
        }
      }
    }
    
    return segments.map(s => s.trim()).filter(Boolean)
  }

  // 智能时间分配：考虑标点停顿和阅读难度
  function computeTimings(duration, segments) {
    const timings = []
    let totalWeight = 0
    
    // 计算每段的权重
    const weights = segments.map(segment => {
      let weight = segment.replace(/\s+/g, ' ').length
      
      // 句末标点增加停顿权重
      if (/[.!?。！？]$/.test(segment)) weight += 10
      if (/[,;，；]$/.test(segment)) weight += 5
      
      // 复杂单词增加权重
      const complexWords = segment.match(/\b\w{7,}\b/g) || []
      weight += complexWords.length * 3
      
      return Math.max(weight, 1)
    })
    
    totalWeight = weights.reduce((sum, w) => sum + w, 0)
    
    let accumulatedWeight = 0
    for (let i = 0; i < segments.length; i++) {
      const start = accumulatedWeight / totalWeight * duration
      accumulatedWeight += weights[i]
      const end = accumulatedWeight / totalWeight * duration
      
      timings.push({ start, end, weight: weights[i] })
    }
    
    return timings
  }

  // 高效的时间匹配（二分查找）
  function findCurrentSegment(time) {
    if (!timings.value.length) return -1
    
    // 简单的线性查找更可靠
    for (let i = 0; i < timings.value.length; i++) {
      const timing = timings.value[i]
      if (time >= timing.start && time < timing.end) {
        return i
      }
    }
    
    // 如果时间超过了最后一个段落，返回最后一个段落
    if (time >= timings.value[timings.value.length - 1].end) {
      return timings.value.length - 1
    }
    
    return -1
  }

  // 初始化文本同步
  function initTextSync(text, duration) {
    console.log('🎯 初始化文字同步:', { text: text?.length, duration })
    textSegments.value = segmentText(text)
    audioDuration.value = duration
    timings.value = computeTimings(duration, textSegments.value)
    currentSegmentIndex.value = -1
    
    console.log('✅ 文字同步初始化完成:', {
      segments: textSegments.value.length,
      timings: timings.value.length,
      firstTiming: timings.value[0]
    })
  }

  // 更新当前播放时间
  function updateTime(time) {
    currentTime.value = time
    const newIndex = findCurrentSegment(time)
    
    if (newIndex !== currentSegmentIndex.value) {
      console.log('🔄 段落切换:', { 
        time, 
        oldIndex: currentSegmentIndex.value, 
        newIndex,
        segment: textSegments.value[newIndex]?.substring(0, 30) + '...',
        timing: timings.value[newIndex]
      })
      currentSegmentIndex.value = newIndex
    }
  }

  // 获取段落状态
  function getSegmentStatus(index) {
    if (currentSegmentIndex.value === -1) return 'inactive'
    if (index === currentSegmentIndex.value) return 'current'
    if (index < currentSegmentIndex.value) return 'past'
    return 'future'
  }

  // 跳转到指定段落
  function seekToSegment(index) {
    if (timings.value[index]) {
      return timings.value[index].start + 0.01 // 稍微偏移避免边界问题
    }
    return 0
  }

  // 计算进度百分比
  const progressPercent = computed(() => {
    if (!audioDuration.value) return 0
    return Math.min((currentTime.value / audioDuration.value) * 100, 100)
  })

  // 智能滚动到当前段落（类似VOA的onScrollCenter）
  function scrollToCurrentSegment(containerEl) {
    if (currentSegmentIndex.value === -1) return
    
    const currentSegment = containerEl.querySelector(`[data-segment-index="${currentSegmentIndex.value}"]`)
    if (!currentSegment) return
    
    const containerRect = containerEl.getBoundingClientRect()
    const segmentRect = currentSegment.getBoundingClientRect()
    
    // 计算需要滚动的距离，让当前段落位于容器中央
    const offset = (segmentRect.top - containerRect.top) - (containerRect.height / 2 - segmentRect.height / 2)
    
    containerEl.scrollBy({
      top: offset,
      behavior: 'smooth'
    })
  }

  return {
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
  }
}
