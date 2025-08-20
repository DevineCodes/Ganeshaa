export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
  return el;
}

export function section(title, contentEl) {
  return h('div', { class: 'panel' }, h('h3', {}, title), contentEl);
}

export function button(label, opts = {}) {
  return h('button', { class: `btn ${opts.variant || ''}`.trim(), ...opts }, label);
}

export function toolbar(...buttons) {
  return h('div', { class: 'toolbar' }, buttons);
}

export function gameCard(children) {
  const wrapper = h('div', { class: 'card' }, ...children);
  return wrapper;
}

export function linkButton(label, href, variant = '') {
  return h('a', { class: `btn ${variant}`.trim(), href, 'data-link': '' }, label);
}

