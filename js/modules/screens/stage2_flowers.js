import { h, gameCard, button, linkButton, section } from '../ui.js';
import { Storage } from '../storage.js';

export class StageFlowers {
  constructor({ router }) {
    this.router = router;
    this.width = 900;
    this.height = 420;
    this.duration = 60; // seconds
    this.score = 0;
    this.timeLeft = this.duration;
    this.items = [];
    this.running = false;

    const header = h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
      h('div', { class: 'title' }, 'Stage 2 — Collect Flowers'),
      h('div', { class: 'toolbar' },
        linkButton('Back', '/stage1', 'ghost'),
        button('Restart', { onclick: () => this.restart() }),
        linkButton('Next Stage ▶', '/stage3', 'primary'),
      ),
    );

    this.canvas = h('canvas', { class: 'game', width: this.width, height: this.height });
    this.ctx = this.canvas.getContext('2d');
    this.bucket = { x: this.width/2 - 50, y: this.height - 30, w: 100, h: 16 };

    const bar = h('div', { class: 'gamebar' },
      h('div', { class: 'score' }, 'Score: ', this.scoreEl = h('span', {}, '0')),
      h('div', { class: 'timer' }, '⏱ ', this.timerEl = h('span', {}, `${this.timeLeft}s`)),
      h('div', { class: 'toolbar' },
        button('Start', { class: 'btn success', onclick: () => this.start() }),
        button('Stop', { class: 'btn warn', onclick: () => this.stop() }),
      )
    );

    this.el = gameCard([
      header,
      bar,
      section('Play Area', this.canvas),
    ]);

    this._bindControls();
    this._draw();
  }

  _bindControls() {
    this.keyHandler = (e) => {
      const speed = 14;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.bucket.x = Math.max(0, this.bucket.x - speed);
      if (e.key === 'ArrowRight' || e.key === 'd') this.bucket.x = Math.min(this.width - this.bucket.w, this.bucket.x + speed);
    };
    document.addEventListener('keydown', this.keyHandler);

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.width / rect.width);
      this.bucket.x = Math.min(this.width - this.bucket.w, Math.max(0, x - this.bucket.w/2));
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.score = 0; this.timeLeft = this.duration; this.items = []; this._spawnCooldown = 0;
    this._lastTime = performance.now();
    this._timerId = setInterval(() => {
      this.timeLeft -= 1; this.timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.stop(true);
    }, 1000);
    this._loop();
  }

  restart() { this.stop(false); this.start(); }

  stop(markProgress) {
    if (!this.running) return;
    this.running = false;
    clearInterval(this._timerId);
    if (markProgress) {
      Storage.update(s => { s.scores.flowers = Math.max(s.scores.flowers, this.score); s.progress.stage2 = true; return s; });
    }
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(32, now - this._lastTime);
    this._lastTime = now;
    this._update(dt / 16.67);
    this._draw();
    requestAnimationFrame(() => this._loop());
  }

  _spawn() {
    const types = [ 'flower', 'flower', 'flower', 'coconut', 'leaf' ];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (this.width - 20) + 10;
    const speed = 2 + Math.random() * 2.5;
    const size = 14 + Math.random() * 10;
    this.items.push({ type, x, y: -20, vy: speed, size });
  }

  _update(step) {
    this._spawnCooldown -= step;
    if (this._spawnCooldown <= 0) { this._spawn(); this._spawnCooldown = 0.6 + Math.random() * 0.6; }

    for (const it of this.items) {
      it.y += it.vy * step * 3;
    }
    this.items = this.items.filter(it => it.y < this.height + 40);

    // collision
    for (const it of this.items) {
      const withinX = it.x > this.bucket.x && it.x < this.bucket.x + this.bucket.w;
      const withinY = it.y + it.size > this.bucket.y && it.y < this.bucket.y + this.bucket.h;
      if (withinX && withinY) {
        if (it.type === 'flower') this.score += 5;
        if (it.type === 'coconut') this.score -= 7;
        if (it.type === 'leaf') this.score -= 3;
        it.y = this.height + 100; // remove
      }
    }
    this.scoreEl.textContent = String(this.score);
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    // background
    const grad = ctx.createLinearGradient(0,0,0,this.height);
    grad.addColorStop(0,'#264653'); grad.addColorStop(1,'#2a9d8f');
    ctx.fillStyle = grad; ctx.fillRect(0,0,this.width,this.height);

    // bucket
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(this.bucket.x, this.bucket.y, this.bucket.w, this.bucket.h);
    ctx.fillRect(this.bucket.x + 10, this.bucket.y - 10, this.bucket.w - 20, 10);

    // items
    for (const it of this.items) {
      if (it.type === 'flower') {
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(it.x, it.y, it.size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e76f51'; ctx.beginPath(); ctx.arc(it.x, it.y, it.size/6, 0, Math.PI*2); ctx.fill();
      } else if (it.type === 'coconut') {
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath(); ctx.ellipse(it.x, it.y, it.size*0.6, it.size*0.8, 0, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = '#8bc34a';
        ctx.beginPath(); ctx.ellipse(it.x, it.y, it.size*0.8, it.size*0.3, 0.5, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  mount() {}
  unmount() { document.removeEventListener('keydown', this.keyHandler); this.stop(false); }
}

