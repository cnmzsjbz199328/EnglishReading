// 工具模块: HTML 转义
window.Utils = {
  escapeHtml(str){
    if(str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, ch => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    })[ch]);
  }
};
