import { h, gameCard, section, button, linkButton } from '../ui.js';
import { Storage } from '../storage.js';

export class Settings {
  constructor({ router }) {
    this.router = router;
    const s = Storage.read();

    const input = h('input', { type: 'text', value: s.username, placeholder: 'Enter username', style: 'width:100%; height:42px; border-radius:10px; border:1px solid rgba(255,255,255,.2); background:#121223; color:#fff; padding:0 12px;' });
    const saveBtn = button('Save', { class: 'btn success', onclick: () => { Storage.update(st => { st.username = input.value || 'Player'; return st; }); alert('Saved!'); } });

    this.el = gameCard([
      h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
        h('div', { class: 'title' }, 'Settings'),
        linkButton('Back', '/', 'ghost')
      ),
      section('Profile', h('div', { class: 'col' }, input, saveBtn)),
    ]);
  }
}

