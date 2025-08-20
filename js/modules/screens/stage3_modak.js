import { h, gameCard, button, linkButton, section } from '../ui.js';
import { Storage } from '../storage.js';

// Simple match-3 on a 8x8 grid with two sizes: small(S), big(B). 3 S -> 1 B; 3 B -> 1 mega (score + add to basket)

export class StageModak {
  constructor({ router }) {
    this.router = router;
    this.size = 8;
    this.timer = 120; // seconds
    this.timeLeft = this.timer;
    this.score = 0;
    this.basket = 0; // mega modaks
    this.cellPx = 48;
    this.grid = this._generateGrid();
    this.selected = null;

    const header = h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
      h('div', { class: 'title' }, 'Stage 3 — Modak Candy Crush'),
      h('div', { class: 'toolbar' },
        linkButton('Back', '/stage2', 'ghost'),
        button('Shuffle', { onclick: () => this._shuffle() }),
        linkButton('Next Stage ▶', '/stage4', 'primary'),
      ),
    );

    const bar = h('div', { class: 'gamebar' },
      h('div', { class: 'score' }, 'Score: ', this.scoreEl = h('span', {}, '0')),
      h('div', { class: 'timer' }, '⏱ ', this.timerEl = h('span', {}, `${this.timeLeft}s`)),
      h('div', {}, 'Basket: ', this.basketEl = h('strong', {}, '0')),
      h('div', { class: 'toolbar' },
        button('Start', { class: 'btn success', onclick: () => this.start() }),
        button('Stop', { class: 'btn warn', onclick: () => this.stop(true) }),
      )
    );

    this.canvas = h('canvas', { width: this.size * this.cellPx, height: this.size * this.cellPx, class: 'game' });
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('click', (e) => this._onClick(e));

    this.el = gameCard([
      header,
      bar,
      section('Match-3 Grid', this.canvas),
    ]);

    this._draw();
  }

  start() {
    if (this._timerId) return;
    this.timeLeft = this.timer; this.timerEl.textContent = `${this.timeLeft}s`;
    this.score = 0; this.scoreEl.textContent = '0'; this.basket = 0; this.basketEl.textContent = '0';
    this._timerId = setInterval(() => {
      this.timeLeft -= 1; this.timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.stop(true);
    }, 1000);
  }

  stop(markProgress) {
    if (this._timerId) { clearInterval(this._timerId); this._timerId = null; }
    if (markProgress) Storage.update(s => { s.scores.modak = Math.max(s.scores.modak, this.score); s.progress.stage3 = true; return s; });
  }

  _generateGrid() {
    const types = ['S1','S2','S3','S4'];
    const grid = [];
    for (let y = 0; y < this.size; y++) {
      const row = [];
      for (let x = 0; x < this.size; x++) {
        row.push({ t: types[Math.floor(Math.random()*types.length)], s: 'S' });
      }
      grid.push(row);
    }
    return grid;
  }

  _shuffle() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const jx = Math.floor(Math.random()*this.size);
        const jy = Math.floor(Math.random()*this.size);
        [this.grid[y][x], this.grid[jy][jx]] = [this.grid[jy][jx], this.grid[y][x]];
      }
    }
    this._draw();
  }

  _onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / this.size));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / this.size));
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    if (!this.selected) { this.selected = { x, y }; this._draw(); return; }
    const dx = Math.abs(this.selected.x - x), dy = Math.abs(this.selected.y - y);
    if (dx + dy === 1) {
      [this.grid[y][x], this.grid[this.selected.y][this.selected.x]] = [this.grid[this.selected.y][this.selected.x], this.grid[y][x]];
      this._resolveMatches();
    }
    this.selected = null; this._draw();
  }

  _resolveMatches() {
    // find runs >= 3 of same "t" and same size indicator (S or B)
    const toClear = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    const rows = this.size, cols = this.size;
    const get = (x,y) => this.grid[y]?.[x];

    // mark horizontal
    for (let y=0;y<rows;y++) {
      let run=1; for (let x=1;x<cols;x++) {
        const eq = get(x,y).t === get(x-1,y).t && get(x,y).s === get(x-1,y).s;
        run = eq ? run+1 : 1;
        if (!eq || x===cols-1) {
          const end = eq && x===cols-1 ? x : x-1;
          const start = end - (run-1);
          if (run>=3) for (let k=start;k<=end;k++) toClear[y][k] = true;
          run=1;
        }
      }
    }
    // mark vertical
    for (let x=0;x<cols;x++) {
      let run=1; for (let y=1;y<rows;y++) {
        const eq = get(x,y).t === get(x,y-1).t && get(x,y).s === get(x,y-1).s;
        run = eq ? run+1 : 1;
        if (!eq || y===rows-1) {
          const end = eq && y===rows-1 ? y : y-1;
          const start = end - (run-1);
          if (run>=3) for (let k=start;k<=end;k++) toClear[k][x] = true;
          run=1;
        }
      }
    }

    // compress and transform
    let cleared = 0;
    // find groups and transform according to S->B or B->mega
    // Simple approach: when any cell cleared for a symbol type, place transformed at the lowest y among cleared cells in that group
    // We'll process by scanning symbols; this is simplified but works for gameplay.
    const transformedDrops = [];

    // map to group by connected cleared cells of same t and s
    const visited = Array.from({length: this.size}, () => Array(this.size).fill(false));
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const inb = (x,y)=>x>=0&&y>=0&&x<this.size&&y<this.size;
    for (let y=0;y<rows;y++) for (let x=0;x<cols;x++) if (toClear[y][x] && !visited[y][x]) {
      const t = this.grid[y][x].t, s = this.grid[y][x].s;
      const q=[[x,y]]; visited[y][x]=true; const cells=[[x,y]];
      while(q.length){const [cx,cy]=q.pop(); for(const[dX,dY] of dirs){const nx=cx+dX,ny=cy+dY; if(inb(nx,ny)&&toClear[ny][nx]&&!visited[ny][nx]&&this.grid[ny][nx].t===t&&this.grid[ny][nx].s===s){visited[ny][nx]=true;q.push([nx,ny]);cells.push([nx,ny]);}}}
      const minY = Math.max(...cells.map(c=>c[1])); const destX = cells.find(c=>c[1]===minY)[0];
      if (cells.length>=3) {
        if (s==='S') transformedDrops.push({ x: destX, y: 0, t, s: 'B' });
        else if (s==='B') { this.basket += 1; this.score += 50; this.basketEl.textContent = String(this.basket); }
        this.score += 10 * cells.length;
        cleared += cells.length;
      }
    }

    // remove cleared and apply gravity
    for (let x=0;x<cols;x++) {
      const col=[]; for (let y=0;y<rows;y++) if (!toClear[y][x]) col.push(this.grid[y][x]);
      while (col.length<rows) col.unshift({ t: `S${1+Math.floor(Math.random()*4)}`, s: 'S' });
      for (let y=0;y<rows;y++) this.grid[y][x]=col[y];
    }

    // drop transformed items to the bottom-most cleared position in their columns
    for (const drop of transformedDrops) {
      // place at top and let gravity overlay by replacing bottom cell
      const x = drop.x; let y = rows-1;
      this.grid[y][x] = { t: drop.t, s: drop.s };
    }

    if (cleared>0) { this.scoreEl.textContent = String(this.score); this._draw(); this._resolveMatches(); }
  }

  _draw() {
    const ctx = this.ctx; const s = this.cellPx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle = '#1b1b30'; ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    for (let y=0;y<this.size;y++) for (let x=0;x<this.size;x++) {
      const cell = this.grid[y][x];
      const px = x*s, py = y*s;
      ctx.fillStyle = cell.s==='S' ? '#ffb703' : '#fb8500';
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      // draw modak as rounded triangle
      ctx.beginPath();
      ctx.moveTo(px+s/2, py+8);
      ctx.lineTo(px+8, py+s-8);
      ctx.lineTo(px+s-8, py+s-8);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // decorate by type shades
      ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(px+8, py+8, s-16, 8);
      // selected border
      if (this.selected && this.selected.x===x && this.selected.y===y) {
        ctx.lineWidth = 3; ctx.strokeStyle = '#e76f51';
        ctx.strokeRect(px+2, py+2, s-4, s-4);
        ctx.lineWidth = 1;
      }
    }
  }

  mount() {}
  unmount() { if (this._timerId) clearInterval(this._timerId); Storage.update(s=>s); }
}

