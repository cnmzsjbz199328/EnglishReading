// text-cleaner.js 文章文本抓取与清洗组件（无依赖）
(function(global){

  // 通用向前截断：在 idx 之前寻找最近的句末标点
  function truncateAtPrevSentenceEnd(text, matchIndex){
    if(matchIndex <= 0) return '';
    // 允许的句末标点
    const END_CHARS = '.!?。！？';
    for(let i = matchIndex - 1; i >= 0; i--){
      const ch = text[i];
      if(END_CHARS.includes(ch)){
        // 保留到这个标点（包含它）
        return text.slice(0, i + 1).trim();
      }
    }
    // 未找到句末标点则全部丢弃（也可选择保留到 matchIndex 之前）
    return '';
  }

  const CREDIT_RE = /(wrote this story for voa learning english|reported on this story for the associated press|adapted it(?: for voa learning english)?)/i;

  // 提取 <p> 段落作为备用（HTML 原文）
  function fallbackExtractFromHtml(html){
    if(!html) return [];
    const out=[]; const re=/<p[^>]*>([\s\S]*?)<\/p>/gi; let m;
    while((m=re.exec(html))){
      let t=m[1]
        .replace(/<script[\s\S]*?<\/script>/gi,'')
        .replace(/<style[\s\S]*?<\/style>/gi,'')
        .replace(/<[^>]+>/g,' ')
        .replace(/&nbsp;/g,' ')
        .replace(/&amp;/g,'&')
        .replace(/&#39;/g,"'")
        .replace(/&quot;/g,'"')
        .replace(/\s+/g,' ')
        .trim();
      if(!t) continue;
      if(/^no media source currently available/i.test(t)) continue;
      if(/^words in this story/i.test(t)) break;

      const creditMatch = t.match(CREDIT_RE);
      if(creditMatch){
        const kept = truncateAtPrevSentenceEnd(t, creditMatch.index);
        if(kept) out.push(kept);
        break;
      }
      out.push(t);
    }
    return out;
  }

  // 主清洗
  function cleanArticleText(txt){
    if(!txt) return txt;
    txt = txt.replace(/\r/g,'').trim();

    // 去头部提示
    txt = txt.replace(/^no media source currently available[.\s]*/i,'');
    txt = txt.replace(/\nno media source currently available[.\s]*/ig,'\n');

    // 删词汇表及其后
    txt = txt.replace(/\n+words in this story[\s\S]*$/i,'');

    // 首次 credit 短语截断（句级）
    const creditMatch = txt.match(CREDIT_RE);
    if(creditMatch && creditMatch.index !== undefined){
      const truncated = truncateAtPrevSentenceEnd(txt, creditMatch.index);
      txt = truncated;
    }

    // 行级拆分再做后续清理
    let lines = txt.split(/\n+/).map(l=>l.trim()).filter(Boolean);

    // 去词性行
    lines = lines.filter(l=> !/\s–\s*(n|v|adj|adv|pron|prep|conj|det|num)\b/i.test(l));

    // 再次移除可能残留的部分 credit 句尾（如果上面未能命中句号）
    lines = lines.map(l=>{
      const m = l.match(CREDIT_RE);
      if(m && m.index!==undefined){
        l = truncateAtPrevSentenceEnd(l, m.index);
      }
      return l.trim();
    }).filter(l=>l);

    // 多余空白
    lines = lines.map(l=> l.replace(/\s+/g,' ').trim());

    // 清掉末尾可能剩余的孤立作者姓名 (1~5 个首字母大写单词)
    if(lines.length){
      const last = lines[lines.length-1];
      if(/^[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,4}$/.test(last)){
        lines.pop();
      }
    }

    return lines.join('\n').trim();
  }

  global.TextCleaner = { cleanArticleText, fallbackExtractFromHtml };
})(window);
