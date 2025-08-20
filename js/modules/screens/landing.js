import { h, gameCard, linkButton, button } from '../ui.js';
import { Storage } from '../storage.js';

export class Landing {
  constructor({ router }) {
    this.router = router;
    this.el = gameCard([
      h('div', { class: 'col' },
        h('div', { class: 'title' }, 'Ganeshaa'),
        h('div', { class: 'subtitle' }, 'A festive browser game — Make Idol, Collect Flowers, Match Modaks, Light the Diya, and Perform Puja'),
        h('div', { class: 'menu' },
          linkButton('Start New Game', '/stage1', 'primary'),
          linkButton('Continue Game', this._continueHref(), 'secondary'),
          linkButton('Rules to Play', '/rules', 'ghost'),
          linkButton('About Us', '/about', 'ghost'),
          linkButton('Settings', '/settings', 'ghost'),
        ),
        h('div', { class: 'toolbar' },
          button('Reset Save', { class: 'btn warn', onclick: () => { Storage.reset(); this.router.navigate('/'); } }),
        ),
      )
    ]);
  }

  _continueHref() {
    const s = Storage.read();
    if (!s.progress.stage1) return '/stage1';
    if (!s.progress.stage2) return '/stage2';
    if (!s.progress.stage3) return '/stage3';
    if (!s.progress.stage4) return '/stage4';
    return '/stage5';
  }
}

