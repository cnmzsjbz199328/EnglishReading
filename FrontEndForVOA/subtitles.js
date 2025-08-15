// subtitles.js - 简易字幕组件
(function (global) {
    function pad2(n) { return String(n).padStart(2, '0') };
    function pad3(n) { return String(n).padStart(3, '0') };
    function format(ts) { const h = Math.floor(ts / 3600), m = Math.floor((ts % 3600) / 60), s = Math.floor(ts % 60); const ms = Math.floor((ts - Math.floor(ts)) * 1000); return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}` }
    function segment(text) { 
        text = text.trim(); 
        if (!text) return []; 
        
        let segments = [];
        // 按段落分割，保持段落结构
        const paragraphs = text.split(/\n+/);
        
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            if (!para) continue;
            
            // 按句子分割段落内容
            const sentences = para.split(/(?<=[.!?。！？])\s+/)
                .filter(s => s.trim().length > 0);
            
            for (let j = 0; j < sentences.length; j++) {
                const sentence = sentences[j].trim();
                if (!sentence) continue;
                
                // 如果句子太长(>150字符)，按短语分割
                if (sentence.length > 150) {
                    const phrases = sentence.split(/(?<=[,;，；])\s+/)
                        .filter(p => p.trim().length > 0);
                    
                    phrases.forEach(phrase => {
                        segments.push(phrase.trim());
                    });
                } else {
                    segments.push(sentence);
                }
            }
        }
        
        return segments;
    }
    function computeTimings(duration, segments) { 
        const timings = [];
        let totalWeight = 0;
        
        // 计算每段的权重
        const weights = segments.map(segment => {
            let weight = segment.replace(/\s+/g, ' ').length;
            
            // 句末标点增加停顿权重
            if (/[.!?。！？]$/.test(segment)) weight += 10;
            if (/[,;，；]$/.test(segment)) weight += 5;
            
            // 复杂单词增加权重
            const complexWords = segment.match(/\b\w{7,}\b/g) || [];
            weight += complexWords.length * 3;
            
            return Math.max(weight, 1);
        });
        
        totalWeight = weights.reduce((sum, w) => sum + w, 0);
        
        let accumulatedWeight = 0;
        for (let i = 0; i < segments.length; i++) {
            const start = accumulatedWeight / totalWeight * duration;
            accumulatedWeight += weights[i];
            const end = accumulatedWeight / totalWeight * duration;
            
            timings.push({ start, end, weight: weights[i] });
        }
        
        return timings;
    }
    function genVtt(segments, timings) { let v = 'WEBVTT\n\n'; for (let i = 0; i < segments.length; i++) { const { start, end } = timings[i]; v += `${i + 1}\n${format(start)} --> ${format(end)}\n${segments[i].replace(/\s+/g, ' ')}\n\n` } return v }
    function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c])) }
    function create(opts) {
        const { audioEl, text, readerEl, modeBtn, layerEl, curEl, nextEl, onScrollCenter } = opts;
        // 确保初始状态为全文模式: 隐藏字幕层, 显示阅读器
        layerEl.classList.add('hidden');
        readerEl.style.display = '';
        modeBtn.classList.remove('active');
        modeBtn.textContent = '字幕模式';
        const segments = segment(text);
        readerEl.innerHTML = '';
        const spans = []; 
        segments.forEach((seg, i) => { 
            const sp = document.createElement('span'); 
            sp.className = 'seg future'; // 初始状态为future
            sp.dataset.i = i; 
            sp.textContent = seg + ' '; 
            sp.title = `Segment ${i + 1} - Click to jump`; // 添加提示
            readerEl.appendChild(sp); 
            spans.push(sp); 
        });
        let timings = [], current = -1, mode = 'full', raf, lastScroll = 0;
        function build() { if (!audioEl || !isFinite(audioEl.duration)) return; timings = computeTimings(audioEl.duration, segments); Array.from(audioEl.querySelectorAll('track[data-gen="1"]')).forEach(t => t.remove()); const blob = new Blob([genVtt(segments, timings)], { type: 'text/vtt' }); const track = document.createElement('track'); track.kind = 'captions'; track.label = 'Auto'; track.srclang = 'en'; track.default = true; track.dataset.gen = '1'; track.src = URL.createObjectURL(blob); audioEl.appendChild(track); }
        if (audioEl) { if (audioEl.readyState >= 1) build(); audioEl.addEventListener('loadedmetadata', build); }
        function updSubtitle(i) { curEl.innerHTML = `<span class="subtitle-highlight">${escapeHtml(segments[i] || '')}</span>`; nextEl.textContent = segments[i + 1] || ''; }
        function updateSegmentStates() {
            // 清除所有状态
            spans.forEach(span => {
                span.classList.remove('past', 'active', 'future');
            });
            
            // 设置新状态
            spans.forEach((span, i) => {
                if (current === -1) {
                    span.classList.add('future');
                } else if (i === current) {
                    span.classList.add('active');
                } else if (i < current) {
                    span.classList.add('past');
                } else {
                    span.classList.add('future');
                }
            });
        }
        
        function update(t) { 
            if (!timings.length) return; 
            
            if (current >= 0) { 
                const c = timings[current]; 
                if (t >= c.start && t < c.end) { 
                    if (mode === 'subtitle') updSubtitle(current); 
                    return; 
                } 
            } 
            
            let lo = 0, hi = timings.length - 1, idx = -1; 
            while (lo <= hi) { 
                const mid = (lo + hi) >> 1; 
                if (t < timings[mid].start) hi = mid - 1; 
                else if (t >= timings[mid].end) lo = mid + 1; 
                else { idx = mid; break; } 
            } 
            
            if (idx !== current) { 
                current = idx;
                updateSegmentStates();
                
                if (mode === 'full' && current >= 0) { 
                    const now = performance.now(); 
                    if (now - lastScroll > 300) { 
                        lastScroll = now; 
                        if (onScrollCenter) onScrollCenter(spans[current]); 
                    } 
                } else if (mode === 'subtitle' && current >= 0) {
                    updSubtitle(current); 
                }
            } 
        }
        function loop() { if (audioEl && !audioEl.paused) update(audioEl.currentTime); raf = requestAnimationFrame(loop); }
        if (audioEl) { audioEl.addEventListener('timeupdate', () => update(audioEl.currentTime)); loop(); audioEl.addEventListener('ended', () => cancelAnimationFrame(raf)); }
        readerEl.addEventListener('click', e => { const el = e.target; if (!el.classList.contains('seg')) return; const i = +el.dataset.i; if (!timings[i]) return; audioEl.currentTime = timings[i].start + .01; audioEl.play(); });
        function setMode(m) { mode = m; if (mode === 'subtitle') { layerEl.classList.remove('hidden'); readerEl.style.display = 'none'; updSubtitle(current >= 0 ? current : 0); modeBtn.textContent = '全文模式'; modeBtn.classList.add('active'); } else { layerEl.classList.add('hidden'); readerEl.style.display = ''; modeBtn.textContent = '字幕模式'; modeBtn.classList.remove('active'); } }
        // 强制同步一次 DOM 状态为全文模式
        setMode('full');
        modeBtn.disabled = false; modeBtn.onclick = () => setMode(mode === 'full' ? 'subtitle' : 'full');
        return { segments, timings, setMode };
    }
    global.SubtitleEngine = { create };
})(window);
