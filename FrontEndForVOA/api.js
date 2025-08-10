// 负责与后端交互的 API 模块
const DEPLOY_URL = 'https://englishreadingapp.badtom.dpdns.org';
const API_BASE = DEPLOY_URL;

window.Api = {
  async fetchFeeds(){
    const res = await fetch(API_BASE + '/api/voa/feeds');
    const json = await res.json();
    if(!json.success) throw new Error(json.error||'分类获取失败');
    return json.data || [];
  },
  async fetchFeedItems(feedUrl){
    const qs = feedUrl? ('?feed='+encodeURIComponent(feedUrl)) : '';
    const res = await fetch(API_BASE + '/api/voa/feed'+qs);
    const json = await res.json();
    if(!json.success) throw new Error(json.error||'Feed 获取失败');
    return json.data;
  },
  async fetchArticle(url){
    const res = await fetch(API_BASE + '/api/voa/article?url='+encodeURIComponent(url));
    const json = await res.json();
    if(!json.success) throw new Error(json.error||'文章获取失败');
    return json.data;
  }
};
