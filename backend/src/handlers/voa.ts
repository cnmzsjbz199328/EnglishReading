import type { Hono } from 'hono'

// 绑定环境类型（与 index.ts 保持一致）
type Env = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
}

// ===== VOA Feed Whitelist =====
const VOA_FEEDS: { title: string; url: string }[] = [
  { title: 'All About America', url: 'https://learningenglish.voanews.com/api/zbmroml-vomx-tpeqboo_' },
  { title: 'As It Is', url: 'https://learningenglish.voanews.com/api/zkm-ql-vomx-tpej-rqi' },
  { title: 'Arts & Culture', url: 'https://learningenglish.voanews.com/api/zpyp_l-vomx-tpe_rym' },
  { title: 'American Stories', url: 'https://learningenglish.voanews.com/api/zyg__l-vomx-tpetmty' },
  { title: 'Ask a Teacher', url: 'https://learningenglish.voanews.com/api/zti_qvl-vomx-tpekgvqr' },
  { title: 'Everyday Grammar', url: 'https://learningenglish.voanews.com/api/zoroqql-vomx-tpeptpqq' },
  { title: 'Education Tips', url: 'https://learningenglish.voanews.com/api/z_gjqyl-vomx-tpevmrov' },
  { title: 'Health & Lifestyle', url: 'https://learningenglish.voanews.com/api/zmmpql-vomx-tpey-_q' },
  { title: 'Science & Technology', url: 'https://learningenglish.voanews.com/api/zmg_pl-vomx-tpeymtm' },
  { title: 'Words and Their Stories', url: 'https://learningenglish.voanews.com/api/zmypyl-vomx-tpeyry_' },
  { title: "America's Presidents", url: 'https://learningenglish.voanews.com/api/zjypq_l-vomx-tpebryqy' },
  { title: "America's National Parks", url: 'https://learningenglish.voanews.com/api/zqmiqol-vomx-tpei-mqp' },
  { title: 'The Day in Photos', url: 'https://learningenglish.voanews.com/api/zoup_l-vomx-tpepiyy' },
  { title: 'Everyday Grammar Video', url: 'https://learningenglish.voanews.com/api/z_riqtl-vomx-tpevtmqr' },
  { title: 'English @ the Movies', url: 'https://learningenglish.voanews.com/api/zj-oqql-vomx-tpebymqi' },
  { title: 'English in a Minute', url: 'https://learningenglish.voanews.com/api/zjk-rl-vomx-tpebpqqo' },
  { title: 'News Words', url: 'https://learningenglish.voanews.com/api/z-k-ql-vomx-tpermqqi' },
  { title: 'How to Pronounce', url: 'https://learningenglish.voanews.com/api/zpivqol-vomx-tpe_guqi' },
  { title: "Let's Learn English with Anna", url: 'https://learningenglish.voanews.com/api/zyygqpl-vomx-tpetrbqm' },
  { title: "Let's Learn English with Anna in Amharic", url: 'https://learningenglish.voanews.com/api/zvygqml-vomx-tpeurbq_' },
  { title: "Let's Learn English with Anna in Vietnamese", url: 'https://learningenglish.voanews.com/api/ztygq_l-vomx-tpekrbqy' },
  { title: "Let's Learn English with Anna in Korean", url: 'https://learningenglish.voanews.com/api/zuygqvl-vomx-tpegrbqv' },
  { title: "Let's Learn English with Anna in Bambara", url: 'https://learningenglish.voanews.com/api/zrqjqml-vomx-tpeoubqm' },
  { title: "Let's Learn English with Anna in Lingala", url: 'https://learningenglish.voanews.com/api/zqqjq_l-vomx-tpeiubq_' },
  { title: "Let's Learn English with Anna in French", url: 'https://learningenglish.voanews.com/api/zoqjqyl-vomx-tpepubqt' },
  { title: "Let's Learn English with Anna in Uzbek", url: 'https://learningenglish.voanews.com/api/zykjqrl-vomx-tpetproq' },
  { title: "Let's Learn English with Anna in Indonesian", url: 'https://learningenglish.voanews.com/api/z_yrool-vomx-tpevrioq' },
  { title: "Let's Teach English", url: 'https://learningenglish.voanews.com/api/zj-pqrl-vomx-tpebyyqo' },
  { title: "Let's Learn English - Level 1", url: 'https://learningenglish.voanews.com/api/ziqiqil-vomx-tpemumqm' },
  { title: "Let's Learn English - Level 2", url: 'https://learningenglish.voanews.com/api/zt-pq_l-vomx-tpekyyqv' },
  { title: 'Early Literacy', url: 'https://learningenglish.voanews.com/api/zmgjq_l-vomx-tpeymro_' },
  { title: 'Education', url: 'https://learningenglish.voanews.com/api/ztmp_l-vomx-tpek-__' },
  { title: 'VOA60: Watch & Learn', url: 'https://learningenglish.voanews.com/api/zyk-il-vomx-tpetpqqm' },
  { title: 'Teach Us about Ukraine', url: 'https://learningenglish.voanews.com/api/zyb-qml-vomx-tpetvqo_' },
  { title: 'VOA Learning English Podcast', url: 'https://learningenglish.voanews.com/api/ziiy_l-vomx-tpemgtv' },
  { title: "What's Trending Today?", url: 'https://learningenglish.voanews.com/api/z_goqvl-vomx-tpevmmqt' },
  { title: 'What It Takes', url: 'https://learningenglish.voanews.com/api/zromqyl-vomx-tpeokyqv' },
  { title: 'People In America', url: 'https://learningenglish.voanews.com/api/z-viqql-vomx-tpero_qq' },
  { title: "Let's Teach English TV", url: 'https://learningenglish.voanews.com/api/zgptqil-vomx-tpe-jkqm' },
  { title: "America's Presidents TV", url: 'https://learningenglish.voanews.com/api/zjptqpl-vomx-tpebjkq_' },
  { title: "Let's Learn English - Level 1 TV", url: 'https://learningenglish.voanews.com/api/z-ptqml-vomx-tper-kqy' },
  { title: "Let's Learn English - Level 2 TV", url: 'https://learningenglish.voanews.com/api/zbptq_l-vomx-tpeq-kqv' },
  { title: 'English on the Job', url: 'https://learningenglish.voanews.com/api/z-qvqvl-vomx-tperkuqt' },
  { title: 'Talk2Us', url: 'https://learningenglish.voanews.com/api/zoovqol-vomx-tpepkuqi' },
  { title: 'Route 66', url: 'https://learningenglish.voanews.com/api/ztyoqol-vomx-tpekrmqi' },
  { title: 'U.S. History', url: 'https://learningenglish.voanews.com/api/zj_pvl-vomx-tpebb_v' }
]

export function registerVoaRoutes(app: Hono<{ Bindings: Env }>) {
  // 列出可用 Feed
  app.get('/api/voa/feeds', (c) => c.json({ success: true, data: VOA_FEEDS }))

  // Feed 列表（带白名单校验）
  app.get('/api/voa/feed', async (c) => {
    try {
      const feedParam = c.req.query('feed') || c.req.query('url') || ''
      const titleParam = c.req.query('title') || ''
      let feedUrl = ''
      if (feedParam) {
        const found = VOA_FEEDS.find(f => f.url === feedParam)
        if (found) feedUrl = found.url
      } else if (titleParam) {
        const found = VOA_FEEDS.find(f => f.title.toLowerCase() === titleParam.toLowerCase())
        if (found) feedUrl = found.url
      }
      if (!feedUrl) feedUrl = VOA_FEEDS[0].url

      const resp = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0 VOAFetcher/1.1' } })
      if (!resp.ok) return c.json({ success: false, error: 'Upstream feed fetch failed ' + resp.status }, 502)
      const xml = await resp.text()
      const items: { title: string; link: string }[] = []
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let m: RegExpExecArray | null
      while ((m = itemRegex.exec(xml))) {
        const block = m[1]
        const t = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/.exec(block)
        const l = /<link>(.*?)<\/link>/.exec(block)
        const title = (t && (t[1] || t[2]) || '').trim()
        const link = (l && l[1] || '').trim()
        if (title && link) items.push({ title, link })
      }
      return c.json({ success: true, data: { feedUrl, count: items.length, items } })
    } catch (err: any) {
      console.error('VOA feed error', err)
      return c.json({ success: false, error: 'Feed fetch error: ' + err.message }, 500)
    }
  })

  // 文章解析
  app.get('/api/voa/article', async (c) => {
    try {
      const url = c.req.query('url')
      if (!url || !/^https?:\/\//.test(url)) return c.json({ success: false, error: 'Valid url param required' }, 400)
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 VOAArticleFetcher/1.1' } })
      if (!resp.ok) return c.json({ success: false, error: 'Upstream article fetch failed ' + resp.status }, 502)
      const html = await resp.text()

      // 标题
      let title = ''
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
      if (titleMatch) title = titleMatch[1].replace(/\s+\|\s*Voice of America.*/i, '').trim()

      // 音频
      let audio = ''
      const dataSourcesMatch = html.match(/data-sources="([^"]+)"/i)
      if (dataSourcesMatch) {
        try {
          const jsonTxt = dataSourcesMatch[1].replace(/&quot;/g, '"')
          const arr = JSON.parse(jsonTxt)
          if (Array.isArray(arr) && arr.length) {
            const hq = arr.find((o: any) => /hq\.mp3/i.test(o.Src || o.AmpSrc || '')) || arr.find((o: any) => /128 kbps/i.test(o.DataInfo||'')) || arr[0]
            audio = (hq.Src || hq.AmpSrc || '').trim()
          }
        } catch {}
      }
      if (!audio) {
        const audioTag = html.match(/<audio[^>]+src="([^"']+\.mp3)"/i)
        if (audioTag) audio = audioTag[1]
      }
      if (!audio) {
        const mp3 = html.match(/https?:\/\/[^"'<>]+\.mp3/)
        if (mp3) audio = mp3[0]
      }

      // 正文
      const startIdx = html.indexOf('id="article-content"')
      let text = ''
      if (startIdx !== -1) {
        const tail = html.slice(startIdx)
        const endMarkers = [ 'id="comments"', 'class="comments', 'class="media-block-wrap', '</main>' ]
        let endPos = tail.length
        for (const mk of endMarkers) {
          const p = tail.indexOf(mk)
          if (p !== -1 && p < endPos) endPos = p
        }
        let section = tail.slice(0, endPos)
        section = section
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<div[^>]+class="[^"]*quiz[^"]*"[\s\S]*?<\/div>/gi, '')
          .replace(/<div[^>]+class="[^"]*(media-download|share|comments)[^"]*"[\s\S]*?<\/div>/gi, '')
        const paragraphs: string[] = []
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
        let pm: RegExpExecArray | null
        while ((pm = pRegex.exec(section))) {
          let raw = pm[1]
          if (/^\s*(__+|\*{3,})\s*$/i.test(raw)) continue
          raw = raw.replace(/<[^>]+>/g, ' ')
          raw = decodeHtml(raw)
            .replace(/\s+/g, ' ')
            .trim()
          if (raw) paragraphs.push(raw)
        }
        text = paragraphs.join('\n\n')
      }
      if (!text) text = '没有正文哦！你可以打开浏览器或者手机自带的字幕功能，因为我懒得搞。'
      return c.json({ success: true, data: { title, audio, text, source: url, wordCount: text === '没有正文哦！你可以打开浏览器或者手机自带的字幕功能，因为我懒得搞。' ? 0 : text.split(/\s+/).length } })
    } catch (err: any) {
      console.error('VOA article error', err)
      return c.json({ success: false, error: 'Article fetch error: ' + err.message }, 500)
    }
  })
}

// HTML 实体解码
function decodeHtml(str: string): string {
  const map: Record<string,string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return str.replace(/&(#x?[0-9a-f]+|[a-z]+);/ig, (m, g1) => {
    g1 = g1.toLowerCase()
    if (map[g1]) return map[g1]
    if (g1.startsWith('#x')) {
      const code = parseInt(g1.slice(2), 16)
      return code ? String.fromCharCode(code) : m
    }
    if (g1.startsWith('#')) {
      const code = parseInt(g1.slice(1), 10)
      return code ? String.fromCharCode(code) : m
    }
    return m
  })
}

export { VOA_FEEDS }
