// ====== API 基础地址 ======
const DEPLOY_URL = 'https://english-reading-app.tj15982183241.workers.dev';
const API_BASE = DEPLOY_URL; // 固定后端地址

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
    if(!text || text.trim().length < MODE_TEXT_THRESHOLD){
      const extracted = fallbackExtractFromHtml(html||'');
      if(extracted.length>2) text = extracted.join('\n');
    }
    renderArticleShell(title||fallbackTitle, audio);
    if(text && text.trim().length >= MODE_TEXT_THRESHOLD){
      buildSegmentDisplay(text, audio); // 全文 + 可切换
    } else {
      if(text && text.trim().length){
        buildSubtitleOnly(text, audio); // 仅字幕
      } else {
        const reader = document.getElementById('reader');
        reader.textContent='没有内容，嘿嘿，自己打开浏览器或者手机自带的字幕功能吧！';
        document.getElementById('modeToggle').disabled=true;
      }
    }
  }catch(e){
    detail.innerHTML='<p class="error">文章加载失败: '+escapeHtml(e.message)+'</p>';
  }
}

function renderArticleShell(title,audio){
  detail.innerHTML = `<h3>${escapeHtml(title||'')}</h3>` +
    (audio?`<audio id="articleAudio" controls src="${audio}"></audio>`:'<p class="error">未发现音频</p>')+
    `<div id="reader"></div>`;
}

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
  document.getElementById('modeToggle').disabled=true; // 仅字幕不可切回
}

function fallbackExtractFromHtml(html){
  if(!html) return [];
  const out=[]; const re=/<p[^>]*>([\s\S]*?)<\/p>/gi; let m;
  while((m=re.exec(html))){
    let t=m[1]
      .replace(/<script[\s\S]*?<\/script>/gi,'')
      .replace(/<[^>]+>/g,'')
      .replace(/&nbsp;/g,' ')
      .replace(/&amp;/g,'&')
      .replace(/&#39;/g,"'")
      .replace(/&quot;/g,'"')
      .trim();
    if(!t) continue;
    if(/wrote this story for voa learning english/i.test(t)) break;
    if(/reported on this story for the associated press/i.test(t)) break;
    if(/^words in this story/i.test(t)) break;
    if(/^no media source currently available/i.test(t)) continue;
    out.push(t);
  }
  return out;
}

// ===== 文本处理 =====
function segmentText(txt){ txt=txt.trim(); if(!txt) return []; let parts=txt.split(/\n+/).flatMap(p=> p.split(/(?<=[.!?。！？])\s+/)); return parts.map(s=>s.trim()).filter(Boolean); }
function cleanArticleText(txt){ if(!txt) return txt; let lines=txt.split(/\n+/).map(l=>l.trim()).filter(l=>l); while(lines.length && /^no media source currently available/i.test(lines[0])) lines.shift(); const vocabIdx=lines.findIndex(l=> /^words in this story/i.test(l) || /^_{5,}$/.test(l)); if(vocabIdx!==-1) lines=lines.slice(0,vocabIdx); lines=lines.filter(l=> !/\s–\s*(n|v|adj|adv|pron|prep|conj|det|num)\./i.test(l)); const tailPatterns=[ /wrote this story for voa learning english/i, /reported on this story for the associated press/i, /adapted it for voa learning english/i, /adapted it\.?$/i ]; let cutIndex=-1; for(let i=0;i<lines.length;i++){ if(tailPatterns.some(p=>p.test(lines[i]))){ cutIndex=i; break; } } if(cutIndex!==-1) lines=lines.slice(0,cutIndex); return lines.join('\n'); }
function escapeHtml(str){ return str.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

// ===== 启动 =====
loadCategories();
