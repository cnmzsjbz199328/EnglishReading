// ====== 主入口 (依赖 utils.js, api.js, text-cleaner.js, subtitles.js, player.js) ======
// (DEPLOY_URL / API_BASE 已在 api.js 中定义, 这里移除避免重复声明)

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
    const data = await Api.fetchFeeds();
    CATEGORIES = data || [];
    if(!Array.isArray(CATEGORIES) || !CATEGORIES.length) throw new Error('空分类');
    renderCategorySelect();
  } catch(e){ categorySelect.innerHTML='<option value="">加载失败</option>'; console.error(e); }
  finally { categorySelect.disabled=false; }
}

function renderCategorySelect(){
  categorySelect.innerHTML='<option value="">选择分类</option>' + CATEGORIES.map((c,i)=>`<option value="${i}">${Utils.escapeHtml(c.title)}</option>`).join('');
  if(CATEGORIES.length){ categorySelect.value='0'; selectCategory(0); }
}

async function selectCategory(index){
  if(index<0 || index>=CATEGORIES.length) return;
  CURRENT_CATEGORY_INDEX = index;
  const feed = CATEGORIES[index];
  // 不再显示当前分类前缀或标题
  const cf = document.getElementById('currentFeed');
  if(cf) cf.textContent = '';
  titleSelect.disabled = true;
  titleSelect.innerHTML = '<option value="">加载文章列表...</option>';
  detail.innerHTML = '<span class="loading">等待选择文章...</span>';
  await loadFeed(feed.url);
}

async function loadFeed(feedUrl){
  try { const feedData = await Api.fetchFeedItems(feedUrl); const raw=(feedData&&feedData.items)||[]; const seen=new Set(); const dedup=[]; for(const it of raw){ const norm=(it.link||'').replace(/[?#].*$/,'').toLowerCase(); const key= norm || ('t:'+ (it.title||'').toLowerCase()); if(!seen.has(key) && it.title){ seen.add(key); dedup.push(it);} } FEED_ITEMS=dedup; CURRENT_FEED_URL=feedData.feedUrl; renderTitleSelect(); }
  catch(e){ titleSelect.innerHTML='<option value="">文章列表加载失败</option>'; console.error(e); }
}

function renderTitleSelect(){
  if(!FEED_ITEMS.length){ titleSelect.innerHTML='<option value="">无文章</option>'; titleSelect.disabled=true; return; }
  titleSelect.disabled=false; titleSelect.innerHTML='<option value="">选择文章标题</option>' + FEED_ITEMS.map((it,i)=>`<option value="${i}">${Utils.escapeHtml(it.title)}</option>`).join(''); titleSelect.value='0'; const first=FEED_ITEMS[0]; if(first) loadArticle(first.link, first.title); }

// ===== 文章与高亮 =====
const MODE_TEXT_THRESHOLD = 120;

async function loadArticle(url, fallbackTitle){
  detail.innerHTML='<div class="loading">抓取文章...</div>';
  try{
    const data = await Api.fetchArticle(url);
    let { title, audio, text, html } = data;
    if(text) text = TextCleaner.cleanArticleText(text);
    if(!text || text.trim().length < MODE_TEXT_THRESHOLD){
      const extracted = TextCleaner.fallbackExtractFromHtml(html||'');
      if(extracted.length>2) text = extracted.join('\n');
    }
    if(text) text = TextCleaner.cleanArticleText(text);
    renderArticleShell(title||fallbackTitle, audio);
    if(text && text.trim().length >= MODE_TEXT_THRESHOLD){ buildSegmentDisplay(text, audio); }
    else if(text && text.trim().length){ buildSubtitleOnly(text, audio); }
    else { const reader = document.getElementById('reader'); reader.textContent='没有内容，嘿嘿，自己打开浏览器或者手机自带的字幕功能吧！'; document.getElementById('modeToggle').disabled=true; }
  }catch(e){ detail.innerHTML='<p class="error">文章加载失败: '+Utils.escapeHtml(e.message)+'</p>'; }
}

function renderArticleShell(title,audio){
  detail.innerHTML = `<h3 class="article-title">${Utils.escapeHtml(title||'')}</h3>` +
    (audio
      ? `<audio id="articleAudio" class="hidden-audio" src="${audio}"></audio>`
      : `<p class="error">未发现音频</p>`) +
    `<div id="reader"></div>`;
  if(audio) Player.initFloatingPlayer(); else { const fp=document.getElementById('floatingPlayer'); fp.hidden=false; document.getElementById('noMediaMsg').hidden=false; }
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
