const KEY = 'ganeshaa.save.v1';

const defaultState = () => ({
  username: 'JP DASH',
  idol: {
    head: 0,
    body: 0,
    mouse: 0,
    bg: 0,
  },
  progress: {
    stage1: false,
    stage2: false,
    stage3: false,
    stage4: false,
    stage5: false,
  },
  scores: {
    flowers: 0,
    modak: 0,
  },
});

export class Storage {
  static init() {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, JSON.stringify(defaultState()));
    }
  }

  static read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaultState(); } catch { return defaultState(); } }
  static write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  static reset() { localStorage.setItem(KEY, JSON.stringify(defaultState())); }

  static update(fn) {
    const state = Storage.read();
    const next = fn(structuredClone(state));
    Storage.write(next);
    return next;
  }
}

