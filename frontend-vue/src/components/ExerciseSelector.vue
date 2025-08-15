<template>
  <div style="margin-bottom: 32px;">
    <div class="status" style="margin-bottom: 16px;">{{ globalStatus }}</div>
    
    <div v-if="!items.length" class="muted" style="text-align: center; padding: 40px 0;">
      <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📚</div>
      <div style="font-size: 16px;">No exercises yet. Create your first one!</div>
    </div>
    
    <div v-else class="exercise-selection" style="display: flex; gap: 12px; align-items: flex-start;">
      <div style="flex: 0 0 70%; min-width: 0;">
        <select 
          :value="selectedId" 
          @change="handleSelectChange" 
          aria-label="Select an exercise" 
          style="width: 100%;"
        >
          <option value="" disabled>🎯 Select an exercise to practice...</option>
          <option v-for="item in items" :key="item.id" :value="item.id">
            {{ item.title || '(Untitled Exercise)' }}
          </option>
        </select>
      </div>
      <button 
        class="btn danger" 
        :disabled="!selectedId" 
        @click="handleDelete"
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
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  selectedId: {
    type: String,
    default: ''
  },
  globalStatus: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'delete'])

function handleSelectChange(event) {
  const value = event.target.value
  if (value) {
    emit('select', value)
  }
}

function handleDelete() {
  if (props.selectedId) {
    emit('delete', props.selectedId)
  }
}
</script>
