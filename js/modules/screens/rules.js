import { h, gameCard, linkButton, section } from '../ui.js';

export class Rules {
  constructor({ router }) {
    this.router = router;
    const list = h('ul', { style: 'line-height:1.8' },
      h('li', {}, 'Stage 1: Assemble the Ganesh idol by choosing head, body, mouse and background. Click Save Idol.'),
      h('li', {}, 'Stage 2: Move the bucket with mouse or arrow keys to collect flowers. Avoid coconuts and leaves. 60s timer.'),
      h('li', {}, 'Stage 3: Match 3 modaks. 3 small -> 1 big, 3 big -> 1 mega (added to basket). 2 minutes timer.'),
      h('li', {}, 'Stage 4: In a dark room, move and collect Bati, Diya, Matchbox. When all collected, diya lights.'),
      h('li', {}, 'Stage 5: Perform Puja with effects and share your video link. Username is shown below idol.'),
    );

    this.el = gameCard([
      h('div', { class: 'row', style: 'justify-content: space-between; align-items: center;' },
        h('div', { class: 'title' }, 'Rules to Play'),
        linkButton('Back', '/', 'ghost')
      ),
      section('How to Play', list),
    ]);
  }
}

