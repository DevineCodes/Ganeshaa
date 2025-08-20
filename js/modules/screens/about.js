import { h, gameCard, linkButton, section } from '../ui.js';

export class About {
  constructor({ router }) {
    this.router = router;
    const content = h('div', { class: 'col' },
      h('p', {}, 'Ganeshaa is a modular, browser-based festive game built with vanilla HTML, CSS, and JavaScript. It is designed for easy editing and future expansion.'),
      h('p', {}, 'Stages include idol creation, flower collection, modak match-3, mystery diya room, and a final puja with share options.'),
      h('p', {}, 'Made with love for the spirit of Ganesh Chaturthi. Jai Shri Ganesh!'),
    );

    this.el = gameCard([
      h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
        h('div', { class: 'title' }, 'About Us'),
        linkButton('Back', '/', 'ghost')
      ),
      section('About', content),
    ]);
  }
}

