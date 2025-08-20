import { Router } from './modules/router.js';
import { Landing } from './modules/screens/landing.js';
import { StageMakeIdol } from './modules/screens/stage1_make_idol.js';
import { StageFlowers } from './modules/screens/stage2_flowers.js';
import { StageModak } from './modules/screens/stage3_modak.js';
import { StageMystery } from './modules/screens/stage4_mystery.js';
import { StagePuja } from './modules/screens/stage5_puja.js';
import { Settings } from './modules/screens/settings.js';
import { Rules } from './modules/screens/rules.js';
import { About } from './modules/screens/about.js';
import { Storage } from './modules/storage.js';

const appRoot = document.getElementById('app-root');

const router = new Router(appRoot);

router.register('/', Landing);
router.register('/stage1', StageMakeIdol);
router.register('/stage2', StageFlowers);
router.register('/stage3', StageModak);
router.register('/stage4', StageMystery);
router.register('/stage5', StagePuja);
router.register('/settings', Settings);
router.register('/rules', Rules);
router.register('/about', About);

// Initialize default state
Storage.init();

router.start();

// Expose for debugging
window.__ganeshaa__ = { router };

