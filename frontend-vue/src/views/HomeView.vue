<script setup>
import { ref, onMounted } from 'vue'
import { useRecordings } from '../composables/useRecordings'

const {
  items, detail, audioSrc,
  modalOpen,
  globalStatus, createStatus, createError,
  loadingList, loadingSubmit,
  loadList, openDetail, deleteItem, submit,
} = useRecordings()

// form refs
const title = ref('')
const text = ref('')
const file = ref(null)

function onFileChange(e){ file.value = e.target.files?.[0] || null }
function openModal(){ modalOpen.value = true }
function closeModal(){ modalOpen.value = false }
function clearForm(){ title.value = ''; text.value = ''; file.value = null; const el = document.getElementById('file'); if(el) el.value = '' }

onMounted(() => { loadList() })
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>English Reading - Prototype</h1>
        <span class="badge">MVP Tester</span>
      </div>
      <div class="header-actions">
        <button class="btn" @click="openModal">New Exercise</button>
      </div>
    </div>

    <div class="row">
      <div class="card">
        <h2>Practice View</h2>
        <div id="detail">
          <template v-if="detail">
            <div style="display:flex; flex-direction: column; gap: 8px;">
              <div><strong>Title:</strong> {{ detail.title }}</div>
              <div><strong>Text:</strong><br/><div style="white-space: pre-wrap;">{{ detail.text || detail.originalText }}</div></div>
              <audio class="audio" controls preload="none" :src="audioSrc"></audio>
            </div>
          </template>
          <template v-else>
            <div class="muted">Select an item from the list to view details and play audio.</div>
          </template>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <h2>Your Exercises</h2>
      <div class="status">{{ globalStatus }}</div>
      <div id="list" class="list">
        <div v-if="!items.length" class="muted">No data yet.</div>
        <div v-for="it in items" :key="it.id" class="item">
          <div>
            <h4>{{ it.title || '(no title)' }}</h4>
            <div class="muted">{{ it.createdAt }} · id: {{ it.id }}</div>
          </div>
          <div class="actions">
            <button class="btn secondary" @click="openDetail(it.id)">Open</button>
            <button class="btn danger" @click="deleteItem(it.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create Exercise -->
    <div id="exerciseModal" class="modal-backdrop" :style="{display: modalOpen ? 'flex': 'none'}" aria-hidden="true" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <h2 id="modalTitle" style="margin:0;">Create Exercise</h2>
          <button class="btn secondary" @click="closeModal" aria-label="Close">Close</button>
        </div>
        <div>
          <label>Title</label>
          <input id="title" type="text" placeholder="A short title" v-model.trim="title" />
        </div>
        <div>
          <label>Text</label>
          <textarea id="text" rows="6" placeholder="Paste your reading text here..." v-model.trim="text"></textarea>
        </div>
        <div>
          <label>Audio File (mp3/wav)</label>
          <input id="file" type="file" accept="audio/*" @change="onFileChange" />
        </div>
        <div style="margin-top: 10px; display:flex; gap:10px;">
          <button class="btn" :disabled="loadingSubmit" @click="submit({ title, text, file: file })">{{ loadingSubmit ? 'Uploading...' : 'Upload & Save' }}</button>
          <button class="btn secondary" :disabled="loadingSubmit" @click="clearForm">Clear</button>
        </div>
        <div id="createStatus" class="status" :style="{ color: createError ? '#c62828' : '#667eea' }">{{ createStatus }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/***** page-level adjustments if needed *****/
</style>
