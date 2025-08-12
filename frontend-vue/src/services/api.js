// Simple API helper matching the prototype behavior
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchJSON(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, options);
  let text = '';
  try { text = await res.text(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

export async function uploadFile(file) {
  // Try direct upload first
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json?.success && json?.data?.key) return json.data.key;
    }
  } catch { /* ignore and fallback */ }
  // Fallback presigned
  const qsName = encodeURIComponent(file.name);
  const pre = await fetchJSON(`/api/presigned-url?filename=${qsName}`);
  const data = pre.data || pre;
  const uploadUrl = data.uploadUrl || data.url;
  const key = data.key || data.r2ObjectKey || data.objectKey || '';
  if (!uploadUrl || !key) throw new Error('Invalid presigned response');
  const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
  if (!(putRes.ok || putRes.status === 204)) throw new Error('PUT upload failed: ' + putRes.status);
  return key;
}
