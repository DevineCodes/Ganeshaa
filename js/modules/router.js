export class Router {
  constructor(root) {
    this.root = root;
    this.routes = new Map();
    this.current = null;
    window.addEventListener('hashchange', () => this._render(this._readPath()));
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-link]');
      if (!a) return;
      e.preventDefault();
      this.navigate(a.getAttribute('href'));
    });
  }

  register(path, Component) { this.routes.set(path, Component); }

  navigate(path) {
    const p = path.startsWith('#') ? path.slice(1) : path;
    if (this._readPath() !== p) location.hash = '#' + p;
    this._render(p);
  }

  start() { this._render(this._readPath()); }

  _render(path) {
    const Component = this.routes.get(path) || this.routes.get('/');
    if (!Component) return;
    if (this.current && this.current.unmount) this.current.unmount();
    this.root.innerHTML = '';
    this.current = new Component({ router: this });
    this.root.appendChild(this.current.el);
    if (this.current.mount) this.current.mount();
  }

  _readPath() {
    const hash = location.hash?.slice(1) || '/';
    return hash;
  }
}

