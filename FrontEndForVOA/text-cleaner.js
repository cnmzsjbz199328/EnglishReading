// text-cleaner.js 文章文本抓取与清洗组件（无依赖）
(function(global){
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
      if(/^no media source currently available/i.test(t)) continue; // 跳过提示
      if(/^words in this story/i.test(t)) break; // 词汇表之前截断
      if(/wrote this story for voa learning english/i.test(t)) break;
      if(/reported on this story for the associated press/i.test(t)) break;
      if(/adapted it(?: for voa learning english)?\.?$/i.test(t)) break;
      out.push(t);
    }
    return out;
  }

  // 主清洗：去提示、去尾巴、去词汇表、去词性行
  function cleanArticleText(txt){
    if(!txt) return txt;
    txt = txt.replace(/\r/g,'').trim();

    // 头部提示
    txt = txt.replace(/^no media source currently available[.\s]*/i,'');
    txt = txt.replace(/\nno media source currently available[.\s]*/ig,'\n');

    // 词汇表及其后的全部删除
    txt = txt.replace(/\n+words in this story[\s\S]*$/i,'');

    // 统一 credit / adapted 句子截断（全文首次出现位置）
    const tailRe = /(wrote this story for voa learning english|reported on this story for the associated press|adapted it(?: for voa learning english)?)/i;
    const m = txt.match(tailRe);
    if(m && m.index!==undefined){
      txt = txt.slice(0,m.index).trim();
    }

    let lines = txt.split(/\n+/).map(l=>l.trim()).filter(Boolean);
    // 去词性词汇行 (" – n." 等)
    lines = lines.filter(l=> !/\s–\s*(n|v|adj|adv|pron|prep|conj|det|num)\b/i.test(l));

    // 再次清除可能嵌入行尾的 credit
    lines = lines.map(l=> l
      .replace(/(Nancy .* wrote this story for VOA Learning English.*)$/i,'')
      .replace(/(wrote this story for VOA Learning English.*)$/i,'')
      .replace(/(reported on this story for the Associated Press.*)$/i,'')
      .replace(/(adapted it(?: for VOA Learning English)?\.?).*$/i,'')
      .trim()
    ).filter(l=>l);

    lines = lines.map(l=> l.replace(/\s+/g,' ').trim());
    return lines.join('\n').trim();
  }

  global.TextCleaner = { cleanArticleText, fallbackExtractFromHtml };
})(window);
