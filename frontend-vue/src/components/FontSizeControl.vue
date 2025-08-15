<template>
  <div class="font-size-control">
    <button 
      @click="$emit('decrease')"
      :disabled="fontSize <= minFontSize"
      title="Decrease font size"
    >
      A-
    </button>
    <span class="font-size-display">
      {{ fontSize }}px
    </span>
    <button 
      @click="$emit('increase')"
      :disabled="fontSize >= maxFontSize"
      title="Increase font size"
    >
      A+
    </button>
    <button 
      @click="$emit('reset')"
      title="Reset font size to default (16px)"
      style="font-size: 12px;"
    >
      ⟲
    </button>
  </div>
</template>

<script setup>
defineProps({
  fontSize: {
    type: Number,
    required: true
  },
  minFontSize: {
    type: Number,
    default: 12
  },
  maxFontSize: {
    type: Number,
    default: 24
  }
})

defineEmits(['increase', 'decrease', 'reset'])
</script>
