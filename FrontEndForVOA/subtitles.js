// subtitles.js - 简易字幕组件
(function (global) {
    function pad2(n) { return String(n).padStart(2, '0') };
    function pad3(n) { return String(n).padStart(3, '0') };
    function format(ts) { const h = Math.floor(ts / 3600), m = Math.floor((ts % 3600) / 60), s = Math.floor(ts % 60); const ms = Math.floor((ts - Math.floor(ts)) * 1000); return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}` }
    function segment(text) { text = text.trim(); if (!text) return []; return text.split(/\n+/).flatMap(p => p.split(/(?<=[.!?。！？])\s+/)).map(s => s.trim()).filter(Boolean) }
    function computeTimings(duration, segments) { const lens = segments.map(s => s.replace(/\s+/g, ' ').length || 1); const total = lens.reduce((a, b) => a + b, 0); let acc = 0; return lens.map(len => { const start = acc / total * duration; acc += len; const end = acc / total * duration; return { start, end }; }) }
    function genVtt(segments, timings) { let v = 'WEBVTT\n\n'; for (let i = 0; i < segments.length; i++) { const { start, end } = timings[i]; v += `${i + 1}\n${format(start)} --> ${format(end)}\n${segments[i].replace(/\s+/g, ' ')}\n\n` } return v }
    function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c])) }
    function create(opts) {
        const { audioEl, text, readerEl, modeBtn, layerEl, curEl, nextEl, onScrollCenter } = opts;
        const segments = segment(text);
        readerEl.innerHTML = '';
        const spans = []; segments.forEach((seg, i) => { const sp = document.createElement('span'); sp.className = 'seg'; sp.dataset.i = i; sp.textContent = seg + ' '; readerEl.appendChild(sp); spans.push(sp); });
        let timings = [], current = -1, mode = 'full', raf, lastScroll = 0;
        function build() { if (!audioEl || !isFinite(audioEl.duration)) return; timings = computeTimings(audioEl.duration, segments); Array.from(audioEl.querySelectorAll('track[data-gen="1"]')).forEach(t => t.remove()); const blob = new Blob([genVtt(segments, timings)], { type: 'text/vtt' }); const track = document.createElement('track'); track.kind = 'captions'; track.label = 'Auto'; track.srclang = 'en'; track.default = true; track.dataset.gen = '1'; track.src = URL.createObjectURL(blob); audioEl.appendChild(track); }
        if (audioEl) { if (audioEl.readyState >= 1) build(); audioEl.addEventListener('loadedmetadata', build); }
        function updSubtitle(i) { curEl.innerHTML = `<span class="subtitle-highlight">${escapeHtml(segments[i] || '')}</span>`; nextEl.textContent = segments[i + 1] || ''; }
        function update(t) { if (!timings.length) return; if (current >= 0) { const c = timings[current]; if (t >= c.start && t < c.end) { if (mode === 'subtitle') updSubtitle(current); return; } } let lo = 0, hi = timings.length - 1, idx = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (t < timings[mid].start) hi = mid - 1; else if (t >= timings[mid].end) lo = mid + 1; else { idx = mid; break; } } if (idx < 0) return; if (idx !== current) { if (current >= 0) spans[current].classList.remove('active'); for (let i = current + 1; i < idx; i++) spans[i].classList.add('past'); spans[idx].classList.add('active'); current = idx; if (mode === 'full') { const now = performance.now(); if (now - lastScroll > 300) { lastScroll = now; if (onScrollCenter) onScrollCenter(spans[idx]); } } else updSubtitle(idx); } }
        function loop() { if (audioEl && !audioEl.paused) update(audioEl.currentTime); raf = requestAnimationFrame(loop); }
        if (audioEl) { audioEl.addEventListener('timeupdate', () => update(audioEl.currentTime)); loop(); audioEl.addEventListener('ended', () => cancelAnimationFrame(raf)); }
        readerEl.addEventListener('click', e => { const el = e.target; if (!el.classList.contains('seg')) return; const i = +el.dataset.i; if (!timings[i]) return; audioEl.currentTime = timings[i].start + .01; audioEl.play(); });
        function setMode(m) { mode = m; if (mode === 'subtitle') { layerEl.classList.remove('hidden'); readerEl.style.display = 'none'; updSubtitle(current >= 0 ? current : 0); modeBtn.textContent = '全文模式'; modeBtn.classList.add('active'); } else { layerEl.classList.add('hidden'); readerEl.style.display = ''; modeBtn.textContent = '字幕模式'; modeBtn.classList.remove('active'); } }
        modeBtn.disabled = false; modeBtn.onclick = () => setMode(mode === 'full' ? 'subtitle' : 'full');
        return { segments, timings, setMode };
    }
    global.SubtitleEngine = { create };
})(window);
