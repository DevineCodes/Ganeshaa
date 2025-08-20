import { h, gameCard, button, linkButton, section } from '../ui.js';
import { Storage } from '../storage.js';

export class StagePuja {
  constructor({ router }) {
    this.router = router;
    const s = Storage.read();
    this.idol = s.idol;

    const header = h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
      h('div', { class: 'title' }, 'Stage 5 — Let’s Do Puja'),
      h('div', { class: 'toolbar' },
        linkButton('Back', '/stage4', 'ghost'),
        linkButton('Home', '/', 'secondary'),
      ),
    );

    // center idol view
    this.canvas = h('div', { class: 'canvas-area', style: 'min-height: 460px; overflow:hidden; position:relative;' },
      this.layerBg = h('div', { class: 'idol-layer' }),
      this.layerBody = h('div', { class: 'idol-layer' }),
      this.layerHead = h('div', { class: 'idol-layer' }),
      this.layerMouse = h('div', { class: 'idol-layer' }),
      this.fxLayer = h('div', { class: 'idol-layer', style: 'pointer-events:none' }),
      h('div', { class: 'username' }, `Player: ${s.username}`),
    );

    const left = h('div', { class: 'col', style: 'flex:1' },
      section('Puja Controls', h('div', { class: 'puja-controls' },
        button('Play Bell & Drum', { onclick: () => this.playBellDrum() }),
        button('Rotate Diya', { onclick: () => this.rotateDiya() }),
        button('Drop Flowers', { onclick: () => this.dropFlowers() }),
        button('DJ Lights effect', { onclick: () => this.djLights() }),
      )),
    );

    const right = h('div', { class: 'col', style: 'flex:1' },
      section('Share', h('div', { class: 'share-area' },
        button('Share Puja (WhatsApp)', { onclick: () => this.share('whatsapp') }),
        button('Share Puja (Facebook)', { onclick: () => this.share('facebook') }),
      )),
    );

    const message = h('div', { class: 'message' }, 'Ganpati Bappa is Happy with Your Puja!');

    this.el = gameCard([
      header,
      h('div', { class: 'row' },
        left,
        h('div', { class: 'col', style: 'flex:2' }, section('Idol', this.canvas), message),
        right,
      ),
    ]);

    this._renderIdol();
    Storage.update(s0 => { s0.progress.stage5 = true; return s0; });
  }

  _renderIdol() {
    const bgColor = ['#0b132b','#1c2541','#3a506b','#5bc0be','#ffd166'][this.idol.bg];
    const bodyColor = ['#e76f51','#2a9d8f','#e9c46a','#f4a261','#264653','#8ecae6','#219ebc','#023047','#ffb703','#fb8500'][this.idol.body];
    const headText = ['H1','H2','H3','H4','H5'][this.idol.head];
    this.layerBg.style.background = bgColor;
    this.layerBody.style.display = 'grid'; this.layerBody.style.placeItems = 'center'; this.layerBody.innerHTML = `<div style="width: 46%; aspect-ratio: 1/1.2; background:${bodyColor}; border-radius: 20%/25%; opacity:.9; box-shadow:0 10px 40px rgba(0,0,0,.35);"></div>`;
    this.layerHead.style.display = 'grid'; this.layerHead.style.placeItems = 'center'; this.layerHead.innerHTML = `<div style="width: 26%; aspect-ratio: 1; background:linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.7)); color:#111; border-radius: 50%; display:grid; place-items:center; font-weight:900;">${headText}</div>`;
    this.layerMouse.style.display = 'grid'; this.layerMouse.style.alignItems = 'end'; this.layerMouse.style.justifyItems = 'end'; this.layerMouse.innerHTML = `<div style="margin: 12px; padding:6px 10px; background:rgba(0,0,0,.35); border-radius: 10px;">Mushak</div>`;
  }

  playBellDrum() {
    // WebAudio: short bell then drum using oscillators and noise
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Bell tone
    const bell = ctx.createOscillator(); bell.type = 'sine'; bell.frequency.setValueAtTime(880, now);
    const bellGain = ctx.createGain(); bellGain.gain.setValueAtTime(0.0001, now); bellGain.gain.exponentialRampToValueAtTime(0.6, now+0.01); bellGain.gain.exponentialRampToValueAtTime(0.001, now+0.4);
    bell.connect(bellGain).connect(ctx.destination); bell.start(now); bell.stop(now+0.45);
    // Drum (noise burst)
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate); const data = buffer.getChannelData(0); for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
    const noise = ctx.createBufferSource(); noise.buffer = buffer;
    const drumGain = ctx.createGain(); drumGain.gain.setValueAtTime(0.0001, now+0.15); drumGain.gain.exponentialRampToValueAtTime(0.7, now+0.16); drumGain.gain.exponentialRampToValueAtTime(0.001, now+0.5);
    noise.connect(drumGain).connect(ctx.destination); noise.start(now+0.15); noise.stop(now+0.55);
  }

  rotateDiya() {
    const el = document.createElement('div');
    el.style.position='absolute'; el.style.width='80px'; el.style.height='80px'; el.style.borderRadius='50%'; el.style.border='3px solid #ffd166'; el.style.left='calc(50% - 40px)'; el.style.top='calc(70% - 40px)';
    el.style.animation='spin 2s linear infinite';
    this.fxLayer.appendChild(el);
    setTimeout(()=>el.remove(), 2500);
  }

  dropFlowers() {
    for (let i=0;i<40;i++) {
      const f = document.createElement('div');
      f.style.position='absolute'; f.style.left=(Math.random()*100)+'%'; f.style.top='-20px'; f.style.width='12px'; f.style.height='12px'; f.style.borderRadius='50%'; f.style.background='#ffd166'; f.style.boxShadow='0 0 0 2px #e76f51 inset';
      f.style.transition='transform 2.6s linear, opacity 2.6s linear';
      this.fxLayer.appendChild(f);
      const tx = (Math.random()*2-1)*60; const ty = 420 + Math.random()*40;
      requestAnimationFrame(()=>{ f.style.transform=`translate(${tx}px, ${ty}px)`; f.style.opacity='0.1'; });
      setTimeout(()=>f.remove(), 2800);
    }
  }

  djLights() {
    const el = document.createElement('div');
    el.style.position='absolute'; el.style.inset='0'; el.style.pointerEvents='none';
    el.style.background='repeating-linear-gradient(90deg, rgba(233,196,106,.25) 0 40px, rgba(42,157,143,.25) 40px 80px, rgba(231,111,81,.25) 80px 120px)';
    el.style.animation='blink 0.2s linear infinite';
    this.fxLayer.appendChild(el);
    setTimeout(()=>el.remove(), 1800);
  }

  share(platform) {
    const url = location.href;
    const text = encodeURIComponent('I just completed a festive Puja in the Ganeshaa game!');
    if (platform==='whatsapp') window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
    if (platform==='facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${text}`, '_blank');
  }
}

// keyframes
const style = document.createElement('style');
style.textContent = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:.4}50%{opacity:.8}}`;
document.head.appendChild(style);

