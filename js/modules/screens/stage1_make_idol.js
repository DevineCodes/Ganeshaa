import { h, gameCard, button, section, toolbar, linkButton } from '../ui.js';
import { Storage } from '../storage.js';

const HEADS = Array.from({ length: 5 }, (_, i) => `H${i+1}`);
const BODIES = Array.from({ length: 10 }, (_, i) => `B${i+1}`);
const MICE = ['M1'];
const BGS = Array.from({ length: 5 }, (_, i) => `BG${i+1}`);

function spriteBox(label) { return h('div', { class: 'thumb' }, label); }

export class StageMakeIdol {
  constructor({ router }) {
    this.router = router;
    const s = Storage.read();
    this.state = { ...s.idol };

    const header = h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
      h('div', { class: 'title' }, 'Stage 1 — Make Idol'),
      h('div', { class: 'toolbar' },
        linkButton('Back', '/', 'ghost'),
        button('Save Idol', { class: 'btn success', onclick: () => this.save() }),
        linkButton('Next Stage ▶', '/stage2', 'primary'),
      ),
    );

    this.canvas = h('div', { class: 'canvas-area', style: 'min-height: 460px' },
      this.layerBg = h('div', { class: 'idol-layer', style: '' }),
      this.layerBody = h('div', { class: 'idol-layer', style: '' }),
      this.layerHead = h('div', { class: 'idol-layer', style: '' }),
      this.layerMouse = h('div', { class: 'idol-layer', style: '' }),
      h('div', { class: 'username' }, `Player: ${Storage.read().username}`),
    );

    const headGrid = h('div', { class: 'grid cols-5' }, ...HEADS.map((label, idx) => {
      const el = spriteBox(label);
      if (idx === this.state.head) el.classList.add('active');
      el.addEventListener('click', () => { this.state.head = idx; this._updateActive(headGrid, idx); this.renderIdol(); });
      return el;
    }));

    const bodyGrid = h('div', { class: 'grid cols-10' }, ...BODIES.map((label, idx) => {
      const el = spriteBox(label);
      if (idx === this.state.body) el.classList.add('active');
      el.addEventListener('click', () => { this.state.body = idx; this._updateActive(bodyGrid, idx); this.renderIdol(); });
      return el;
    }));

    const mouseGrid = h('div', { class: 'grid cols-5' }, ...MICE.map((label, idx) => {
      const el = spriteBox(label);
      if (idx === this.state.mouse) el.classList.add('active');
      el.addEventListener('click', () => { this.state.mouse = idx; this._updateActive(mouseGrid, idx); this.renderIdol(); });
      return el;
    }));

    const bgGrid = h('div', { class: 'grid cols-5' }, ...BGS.map((label, idx) => {
      const el = spriteBox(label);
      if (idx === this.state.bg) el.classList.add('active');
      el.addEventListener('click', () => { this.state.bg = idx; this._updateActive(bgGrid, idx); this.renderIdol(); });
      return el;
    }));

    const grids = h('div', { class: 'row' },
      h('div', { class: 'col', style: 'flex:2' },
        section('Preview', this.canvas),
      ),
      h('div', { class: 'col', style: 'flex:1' },
        section('Head', headGrid),
        section('Body', bodyGrid),
        section('Mouse (Mushak)', mouseGrid),
        section('Background', bgGrid),
      ),
    );

    this.el = gameCard([
      header,
      grids,
    ]);

    this.renderIdol();
  }

  _updateActive(grid, idx) {
    Array.from(grid.children).forEach((c, i) => c.classList.toggle('active', i === idx));
  }

  renderIdol() {
    // Placeholder colored layers instead of external images to keep repo lightweight and editable
    const bgColor = ['#0b132b','#1c2541','#3a506b','#5bc0be','#ffd166'][this.state.bg];
    const bodyColor = ['#e76f51','#2a9d8f','#e9c46a','#f4a261','#264653','#8ecae6','#219ebc','#023047','#ffb703','#fb8500'][this.state.body];
    const headText = HEADS[this.state.head];
    const mouseText = 'Mushak';

    this.layerBg.style.background = bgColor;
    this.layerBody.style.display = 'grid';
    this.layerBody.style.placeItems = 'center';
    this.layerBody.style.background = 'transparent';
    this.layerBody.innerHTML = `<div style="width: 46%; aspect-ratio: 1/1.2; background:${bodyColor}; border-radius: 20%/25%; opacity:.9; box-shadow:0 10px 40px rgba(0,0,0,.35);"></div>`;
    this.layerHead.style.display = 'grid';
    this.layerHead.style.placeItems = 'center';
    this.layerHead.innerHTML = `<div style="width: 26%; aspect-ratio: 1; background:linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.7)); color:#111; border-radius: 50%; display:grid; place-items:center; font-weight:900;">${headText}</div>`;
    this.layerMouse.style.display = 'grid';
    this.layerMouse.style.alignItems = 'end';
    this.layerMouse.style.justifyItems = 'end';
    this.layerMouse.innerHTML = `<div style="margin: 12px; padding:6px 10px; background:rgba(0,0,0,.35); border-radius: 10px;">${mouseText}</div>`;
  }

  save() {
    Storage.update(s => {
      s.idol = { ...this.state };
      s.progress.stage1 = true;
      return s;
    });
  }

  mount() {}
  unmount() {}
}

