// 自定义浮动播放器模块
window.Player = {
  initFloatingPlayer(){
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

    let rate = audio.playbackRate || 1.0;
    function applyRate(){ audio.playbackRate = rate; speedDisplay.textContent = rate.toFixed(2)+'×'; }
    applyRate();
    let vol = audio.volume ?? 0.7;
    audio.volume = vol;
    volumeFill.style.width = (vol*100)+'%';
    volumeBtn.textContent = vol===0?'🔇':(vol<0.5?'🔉':'🔊');

    playBtn.onclick = ()=>{ if(audio.paused){ audio.play(); playBtn.textContent='⏸'; } else { audio.pause(); playBtn.textContent='▶'; } };
    audio.addEventListener('play', ()=> playBtn.textContent='⏸');
    audio.addEventListener('pause', ()=> playBtn.textContent='▶');
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', update);
    audio.addEventListener('ended', ()=> playBtn.textContent='▶');

    progressBar.onclick = (e)=>{
      if(!isFinite(audio.duration)) return;
      const rect=progressBar.getBoundingClientRect();
      const ratio=(e.clientX-rect.left)/rect.width;
      audio.currentTime = ratio*audio.duration; update(); };

    speedUp.onclick = ()=>{ if(rate<2){ rate+=0.25; applyRate(); } };
    speedDown.onclick = ()=>{ if(rate>0.5){ rate-=0.25; applyRate(); } };

    volumeSlider.onclick = (e)=>{ const rect=volumeSlider.getBoundingClientRect(); vol = (e.clientX-rect.left)/rect.width; vol=Math.min(1,Math.max(0,vol)); audio.volume=vol; volumeFill.style.width=(vol*100)+'%'; volumeBtn.textContent= vol===0?'🔇':(vol<0.5?'🔉':'🔊'); };
    volumeBtn.onclick = ()=>{ if(vol>0){ vol=0; } else { vol=0.7; } audio.volume=vol; volumeFill.style.width=(vol*100)+'%'; volumeBtn.textContent= vol===0?'🔇':(vol<0.5?'🔉':'🔊'); };

    update();
  }
};
