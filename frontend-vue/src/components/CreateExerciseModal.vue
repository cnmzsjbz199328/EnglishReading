<template>
  <div
    class="modal-backdrop"
    :style="{ 
      display: isOpen ? 'flex' : 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.5)',
      'align-items': 'center',
      'justify-content': 'center',
      'z-index': '1000',
      padding: '20px',
      'box-sizing': 'border-box'
    }"
    aria-hidden="true"
    @click.self="$emit('close')"
  >
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" style="
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    ">
      <div class="modal-header">
        <h2 id="modalTitle">✨ Create New Exercise</h2>
        <button class="btn secondary" @click="$emit('close')" aria-label="Close">✕</button>
      </div>
      
      <ExerciseForm 
        @submit="handleSubmit"
        @clear="handleClear"
        :loading="loadingSubmit"
        :status="createStatus"
        :error="createError"
      />
    </div>
  </div>
</template>

<script setup>
import ExerciseForm from './ExerciseForm.vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  loadingSubmit: {
    type: Boolean,
    default: false
  },
  createStatus: {
    type: String,
    default: ''
  },
  createError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit', 'clear'])

function handleSubmit(formData) {
  emit('submit', formData)
}

function handleClear() {
  emit('clear')
}
</script>
