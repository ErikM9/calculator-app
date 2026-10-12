import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { initCalculator } from '../../../src/scripts.js';

const indexHtml = readFileSync(new URL('../../../src/index.html', import.meta.url), 'utf8');

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

    /* Clicks the keys for a sequence such as 12+3=, one key at a time */
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