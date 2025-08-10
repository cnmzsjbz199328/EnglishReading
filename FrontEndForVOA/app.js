// ====== API 基础地址 ======
const DEPLOY_URL = 'https://english-reading-app.tj15982183241.workers.dev';
const API_BASE = DEPLOY_URL; // 固定后端地址

// HTML 转义工具 (防止 XSS / 破坏 HTML)
function escapeHtml(str){
  if(str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, ch => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  })[ch]);
}

// ===== DOM =====
const categorySelect = document.getElementById('categorySelect');
const titleSelect = document.getElementById('titleSelect');
const detail = document.getElementById('detail');

// ===== 状态 =====
let CATEGORIES=[]; let FEED_ITEMS=[]; let CURRENT_FEED_URL=''; let CURRENT_CATEGORY_INDEX=-1;

categorySelect.addEventListener('change', () => { const idx=parseInt(categorySelect.value,10); if(!isNaN(idx)) selectCategory(idx); });

titleSelect.addEventListener('change', () => { const idx=parseInt(titleSelect.value,10); if(!isNaN(idx)){ const item=FEED_ITEMS[idx]; if(item) loadArticle(item.link,item.title); } });

// ===== 分类加载 =====
async function loadCategories(force=false){
  if(CATEGORIES.length && !force){ renderCategorySelect(); return; }
  categorySelect.innerHTML='<option value="">加载分类...</option>'; categorySelect.disabled=true;
  try {
    const res = await fetch(API_BASE + '/api/voa/feeds');
    const json = await res.json();
    if(!json.success) throw new Error(json.error||'分类获取失败');
    CATEGORIES = json.data || [];
    if(!Array.isArray(CATEGORIES) || !CATEGORIES.length) throw new Error('空分类');
    renderCategorySelect();
  } catch(e){ categorySelect.innerHTML='<option value="">加载失败</option>'; console.error(e); }
  finally { categorySelect.disabled=false; }
}

function renderCategorySelect(){
  categorySelect.innerHTML='<option value="">选择分类</option>' + CATEGORIES.map((c,i)=>`<option value="${i}">${escapeHtml(c.title)}</option>`).join('');
  if(CATEGORIES.length){ categorySelect.value='0'; selectCategory(0); }
}

async function selectCategory(index){
  if(index<0 || index>=CATEGORIES.length) return; CURRENT_CATEGORY_INDEX=index; const feed=CATEGORIES[index];
  document.getElementById('currentFeed').textContent='当前分类: '+feed.title; titleSelect.disabled=true; titleSelect.innerHTML='<option value="">加载文章列表...</option>'; detail.innerHTML='<span class="loading">等待选择文章...</span>'; await loadFeed(feed.url); }

async function loadFeed(feedUrl){
  try { const qs=feedUrl? ('?feed='+encodeURIComponent(feedUrl)) : ''; const res=await fetch(API_BASE + '/api/voa/feed'+qs); const json=await res.json(); if(!json.success) throw new Error(json.error||'Feed 获取失败'); const raw=(json.data&&json.data.items)||[]; const seen=new Set(); const dedup=[]; for(const it of raw){ const norm=(it.link||'').replace(/[?#].*$/,'').toLowerCase(); const key= norm || ('t:'+ (it.title||'').toLowerCase()); if(!seen.has(key) && it.title){ seen.add(key); dedup.push(it);} } FEED_ITEMS=dedup; CURRENT_FEED_URL=json.data.feedUrl; renderTitleSelect(); }
  catch(e){ titleSelect.innerHTML='<option value="">文章列表加载失败</option>'; console.error(e); }
}

function renderTitleSelect(){
  if(!FEED_ITEMS.length){ titleSelect.innerHTML='<option value="">无文章</option>'; titleSelect.disabled=true; return; }
  titleSelect.disabled=false; titleSelect.innerHTML='<option value="">选择文章标题</option>' + FEED_ITEMS.map((it,i)=>`<option value="${i}">${escapeHtml(it.title)}</option>`).join(''); titleSelect.value='0'; const first=FEED_ITEMS[0]; if(first) loadArticle(first.link, first.title); }

// ===== 文章与高亮 =====
const MODE_TEXT_THRESHOLD = 120;

async function loadArticle(url, fallbackTitle){
  detail.innerHTML='<div class="loading">抓取文章...</div>';
  try{
    const res=await fetch(API_BASE + '/api/voa/article?url='+encodeURIComponent(url));
    const json=await res.json();
    if(!json.success) throw new Error(json.error||'文章获取失败');
    let { title, audio, text, html } = json.data;

    if(text) text = TextCleaner.cleanArticleText(text);

    if(!text || text.trim().length < MODE_TEXT_THRESHOLD){
      const extracted = TextCleaner.fallbackExtractFromHtml(html||'');
      if(extracted.length>2) text = extracted.join('\n');
    }

    if(text) text = TextCleaner.cleanArticleText(text);

    renderArticleShell(title||fallbackTitle, audio);
    if(text && text.trim().length >= MODE_TEXT_THRESHOLD){
      buildSegmentDisplay(text, audio);
    } else if(text && text.trim().length){
      buildSubtitleOnly(text, audio);
    } else {
      const reader = document.getElementById('reader');
      reader.textContent='没有内容，嘿嘿，自己打开浏览器或者手机自带的字幕功能吧！';
      document.getElementById('modeToggle').disabled=true;
    }
  }catch(e){
    detail.innerHTML='<p class="error">文章加载失败: '+escapeHtml(e.message)+'</p>';
  }
}

function renderArticleShell(title,audio){
  detail.innerHTML = `<h3 class="article-title">${escapeHtml(title||'')}</h3>` +
    (audio
      ? `<audio id="articleAudio" class="hidden-audio" src="${audio}"></audio>`
      : `<p class="error">未发现音频</p>`) +
    `<div id="reader"></div>`;
  if(audio) initFloatingPlayer(); else {
    const fp=document.getElementById('floatingPlayer');
    fp.hidden=false;
    document.getElementById('noMediaMsg').hidden=false;
  }
}

// 自定义浮动播放器 (每次文章切换重新绑定)
function initFloatingPlayer(){
  const audio = document.getElementById('articleAudio');
  if(!audio) return;
  const fp = document.getElementById('floatingPlayer');
  const playBtn = document.getElementById('playBtn');
  const curEl = document.getElementById('currentTime');
  const totalEl = document.getElementById('totalTime');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const speedUp = document.getElementById('speedUp');
  const speedDown = document.getElementById('speedDown');
  const speedDisplay = document.getElementById('speedDisplay');
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeFill = document.getElementById('volumeFill');
  document.getElementById('noMediaMsg').hidden = true;
  fp.hidden = false;

  // 清理旧监听(通过克隆元素最简方式)
  function reset(el){ const newEl=el.cloneNode(true); el.parentNode.replaceChild(newEl, el); return newEl; }
  // (可选) 若多次重复绑定造成累积, 可用上面 reset 技巧; 当前首次接管可忽略

  function fmt(sec){
    sec = Math.max(0, sec||0);
    const m=Math.floor(sec/60), s=Math.floor(sec%60);
    return m+':'+String(s).padStart(2,'0');
  }

  function update(){
    if(isFinite(audio.duration)){
      totalEl.textContent = fmt(audio.duration);
      progressFill.style.width = (audio.currentTime/audio.duration*100)+'%';
    }
    curEl.textContent = fmt(audio.currentTime);
  }

  // 初始速度/音量
  let rate = audio.playbackRate || 1.0;
  function applyRate(){ audio.playbackRate = rate; speedDisplay.textContent = rate.toFixed(2)+'×'; }
  applyRate();

  let vol = audio.volume ?? 0.7;
  audio.volume = vol;
  volumeFill.style.width = (vol*100)+'%';
  volumeBtn.textContent = vol===0?'🔇':(vol<0.5?'🔉':'🔊');

  // 事件
  playBtn.onclick = ()=>{
    if(audio.paused){ audio.play(); playBtn.textContent='⏸'; }
    else { audio.pause(); playBtn.textContent='▶'; }
  };
  audio.addEventListener('play', ()=> playBtn.textContent='⏸');
  audio.addEventListener('pause', ()=> playBtn.textContent='▶');
  audio.addEventListener('timeupdate', update);
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('ended', ()=> playBtn.textContent='▶');

  progressBar.onclick = (e)=>{
    if(!isFinite(audio.duration)) return;
    const rect=progressBar.getBoundingClientRect();
    const ratio=(e.clientX-rect.left)/rect.width;
    audio.currentTime = ratio*audio.duration;
    update();
  };

  speedUp.onclick = ()=>{ if(rate<2){ rate+=0.25; applyRate(); } };
  speedDown.onclick = ()=>{ if(rate>0.5){ rate-=0.25; applyRate(); } };

  volumeSlider.onclick = (e)=>{
    const rect=volumeSlider.getBoundingClientRect();
    vol = (e.clientX-rect.left)/rect.width;
    vol = Math.min(1, Math.max(0, vol));
    audio.volume = vol;
    volumeFill.style.width = (vol*100)+'%';
    volumeBtn.textContent = vol===0?'🔇':(vol<0.5?'🔉':'🔊');
  };
  volumeBtn.onclick = ()=>{
    if(vol>0){ vol=0; } else { vol=0.7; }
    audio.volume = vol;
    volumeFill.style.width = (vol*100)+'%';
    volumeBtn.textContent = vol===0?'🔇':(vol<0.5?'🔉':'🔊');
  };

  update();
}

// === 补回: 分段显示(全文模式) 与 仅字幕模式 ===
function buildSegmentDisplay(text,audio){
  const reader=document.getElementById('reader');
  const audioEl=document.getElementById('articleAudio');
  SubtitleEngine.create({
    audioEl,
    text,
    readerEl: reader,
    modeBtn: document.getElementById('modeToggle'),
    layerEl: document.getElementById('subtitleLayer'),
    curEl: document.getElementById('subtitleCurrent'),
    nextEl: document.getElementById('subtitleNext'),
    onScrollCenter: (el)=>{
      const rRect=reader.getBoundingClientRect();
      const sRect=el.getBoundingClientRect();
      const offset=(sRect.top-rRect.top)-(rRect.height/2 - sRect.height/2);
      reader.scrollBy({top:offset, behavior:'smooth'});
    }
  });
}
function buildSubtitleOnly(text,audio){
  const reader=document.getElementById('reader');
  reader.style.display='none';
  const engine = SubtitleEngine.create({
    audioEl: document.getElementById('articleAudio'),
    text,
    readerEl: reader,
    modeBtn: document.getElementById('modeToggle'),
    layerEl: document.getElementById('subtitleLayer'),
    curEl: document.getElementById('subtitleCurrent'),
    nextEl: document.getElementById('subtitleNext'),
    onScrollCenter: ()=>{}
  });
  engine.setMode('subtitle');
  document.getElementById('modeToggle').disabled=true;
}

// ===== 启动 =====
loadCategories();
