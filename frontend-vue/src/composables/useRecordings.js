import { ref, computed } from 'vue'
import { fetchJSON, uploadFile } from '../services/api'

export function useRecordings() {
  const base = import.meta.env.VITE_API_BASE || ''
  const items = ref([])
  const detail = ref(null)
  const modalOpen = ref(false)

  const globalStatus = ref('')
  const createStatus = ref('')
  const createError = ref(false)
  const loadingList = ref(false)
  const loadingSubmit = ref(false)

  const audioSrc = computed(() => detail.value?.id ? `${base}/api/recordings/${detail.value.id}/audio` : '')

  function setGlobalStatus(msg, isError=false){
    globalStatus.value = msg || ''
    createError.value = !!isError
  }
  function setCreateStatus(msg, isError=false){
    createStatus.value = msg || ''
    createError.value = !!isError
  }

  async function loadList(){
    loadingList.value = true
    setGlobalStatus('Loading list...')
    try{
      const data = await fetchJSON('/api/recordings')
      items.value = data.data || []
      setGlobalStatus(`Loaded ${items.value.length} item(s).`)
    }catch(e){
      setGlobalStatus(e.message, true)
    }finally{
      loadingList.value = false
    }
  }

  async function openDetail(id){
    detail.value = null
    try{
      const data = await fetchJSON(`/api/recordings/${id}`)
      const d = data.data || {}
      detail.value = { id, ...d }
    }catch(e){
      setGlobalStatus('Failed to load: ' + e.message, true)
    }
  }

  async function deleteItem(id){
    if(!confirm('Delete this exercise?')) return
    try{
      await fetchJSON(`/api/recordings/${id}`, { method:'DELETE' })
      await loadList()
      if(detail.value?.id === id) detail.value = null
    }catch(e){
      alert('Delete failed: ' + e.message)
    }
  }

  async function submit({ title, text, file }){
    if(loadingSubmit.value) return
    if(!title || !text || !file){
      setCreateStatus('Please fill all fields and select an audio file.', true)
      return
    }
    try{
      loadingSubmit.value = true
      setCreateStatus('Uploading audio...')
      const key = await uploadFile(file)
      setCreateStatus('Saving record...')
      const payload = { title, text, audioKey: key }
      const created = await fetchJSON('/api/recordings', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      setCreateStatus('Saved!')
      await loadList()
      if(created?.data?.id){
        await openDetail(created.data.id)
        modalOpen.value = false
      }
    }catch(e){
      setCreateStatus(e.message, true)
    }finally{
      loadingSubmit.value = false
    }
  }

  return {
    base,
    items, detail, audioSrc,
    modalOpen,
    globalStatus, createStatus, createError,
    loadingList, loadingSubmit,
    loadList, openDetail, deleteItem, submit,
  }
}
