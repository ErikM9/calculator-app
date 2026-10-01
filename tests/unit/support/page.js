import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { initCalculator } from '../../../src/scripts.js';

/* Node's own path helpers are used because the jsdom test environment swaps in a URL class that fs does not accept */
const here = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(resolve(here, '../../../src/index.html'), 'utf8');

const KEY_IDS = { '+': 'add-btn', '-': 'subtract-btn', '*': 'multiply-btn', '/': 'divide-btn', '.': 'decimal-btn', '=': 'equals-btn' };

/* Boots the real page markup in a jsdom of its own, so listeners from one test never reach the next */
export function loadPage() {
  const { window } = new JSDOM(indexHtml, { url: 'http://localhost:3000' });
  const { document } = window;
  initCalculator(document);

  const byId = (id) => document.getElementById(id);
  const click = (id) => byId(id).dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  return {
    window,
    document,
    byId,
    click,
    display: () => byId('current-number').textContent,
    history: () => byId('history-line').textContent,

    /* Clicks the keys for a sequence such as 12+3=, digit by digit */
    enter(sequence) {
      [...sequence].forEach((char) => click(/[0-9]/.test(char) ? `num-${char}` : KEY_IDS[char]));
    },

    keydown(key, { on = document.body, ...modifiers } = {}) {
      const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
      on.dispatchEvent(event);
      return event;
    }
  };
}