import { h, gameCard, button, linkButton, section } from '../ui.js';
import { Storage } from '../storage.js';

// A lightweight hidden-object style: move with arrows, pick up 3 items in a dark room; once collected, diya lights

export class StageMystery {
  constructor({ router }) {
    this.router = router;
    this.width = 900; this.height = 420;
    this.player = { x: 60, y: 60, r: 14 };
    this.items = [
      { id: 'bati', x: 180, y: 300, found: false },
      { id: 'diya', x: 620, y: 200, found: false },
      { id: 'match', x: 780, y: 340, found: false },
    ];
    this.light = 90;
    this.foundText = h('div', {}, 'Find: bati, diya, matchbox');

    const header = h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
      h('div', { class: 'title' }, 'Stage 4 — Mystery Room: Prepare Diya'),
      h('div', { class: 'toolbar' },
        linkButton('Back', '/stage3', 'ghost'),
        linkButton('Next Stage ▶', '/stage5', 'primary'),
      ),
    );

    this.canvas = h('canvas', { width: this.width, height: this.height, class: 'game' });
    this.ctx = this.canvas.getContext('2d');

    const bar = h('div', { class: 'gamebar' },
      h('div', {}, this.foundText),
      button('Restart', { onclick: () => this._restart() }),
    );

    this.el = gameCard([
      header,
      bar,
      section('Dark Room', this.canvas),
    ]);

    this._bind();
    this._draw();
  }

  _bind() {
    this.keys = new Set();
    this.keydown = (e) => { this.keys.add(e.key); };
    this.keyup = (e) => { this.keys.delete(e.key); };
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  _restart() {
    this.player = { x: 60, y: 60, r: 14 };
    for (const it of this.items) it.found = false;
    this._draw();
  }

  _loop() {
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(this._loop);
  }

  _update() {
    const speed = 3.2;
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) this.player.x -= speed;
    if (this.keys.has('ArrowRight') || this.keys.has('d')) this.player.x += speed;
    if (this.keys.has('ArrowUp') || this.keys.has('w')) this.player.y -= speed;
    if (this.keys.has('ArrowDown') || this.keys.has('s')) this.player.y += speed;
    this.player.x = Math.max(20, Math.min(this.width-20, this.player.x));
    this.player.y = Math.max(20, Math.min(this.height-20, this.player.y));

    for (const it of this.items) {
      if (!it.found) {
        const dx = it.x - this.player.x, dy = it.y - this.player.y;
        const d = Math.hypot(dx,dy);
        if (d < 22) it.found = true;
      }
    }

    if (this.items.every(i => i.found)) {
      this.light = 900;
      Storage.update(s => { s.progress.stage4 = true; return s; });
      this.foundText.textContent = 'All collected! The diya is lit.';
    } else {
      const needed = this.items.filter(i=>!i.found).map(i=>i.id).join(', ');
      this.foundText.textContent = `Find: ${needed}`;
    }
  }

  _draw() {
    const ctx = this.ctx; ctx.clearRect(0,0,this.width,this.height);
    // room background
    ctx.fillStyle = '#0d0d15'; ctx.fillRect(0,0,this.width,this.height);
    // faint furniture shapes
    ctx.fillStyle = '#141425'; ctx.fillRect(120,120,160,80); ctx.fillRect(600,80,120,60); ctx.fillRect(400,260,200,40);
    // items glow positions
    for (const it of this.items) {
      if (it.found) continue;
      const g = ctx.createRadialGradient(it.x,it.y,2,it.x,it.y,20);
      g.addColorStop(0,'rgba(233,196,106,.6)'); g.addColorStop(1,'rgba(233,196,106,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x,it.y,24,0,Math.PI*2); ctx.fill();
    }
    // player
    ctx.fillStyle = '#e76f51'; ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI*2); ctx.fill();

    // darkness mask with light circle
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.92)';
    ctx.fillRect(0,0,this.width,this.height);
    ctx.globalCompositeOperation = 'destination-out';
    const radius = Math.min(this.light, 140);
    const g = ctx.createRadialGradient(this.player.x,this.player.y,20,this.player.x,this.player.y,radius);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.player.x,this.player.y,radius,0,Math.PI*2); ctx.fill();
    ctx.restore();

    if (this.light>150) {
      ctx.fillStyle = '#ffd166'; ctx.font = 'bold 28px Nunito'; ctx.textAlign = 'center';
      ctx.fillText('The diya is lit!', this.width/2, 40);
    }
  }

  mount() {}
  unmount() { cancelAnimationFrame(this._raf); document.removeEventListener('keydown', this.keydown); document.removeEventListener('keyup', this.keyup); }
}

