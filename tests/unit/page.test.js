import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadPage } from './support/page.js';
import { initBackground } from '../../src/scripts.js';

describe('calculator page', () => {
  let page;

  beforeEach(() => {
    page = loadPage();
  });

  describe('keypad', () => {
    it('starts at 0 with an empty history line', () => {
      expect(page.display()).toBe('0');
      expect(page.history()).toBe('');
    });

    it('shows the expression so far above the number being typed', () => {
      page.enter('12+3');

      expect(page.history()).toBe('12+');
      expect(page.display()).toBe('3');
    });

    it('works out a sum from the on-screen keys', () => {
      page.enter('12+3=');

      expect(page.display()).toBe('15');
      expect(page.history()).toBe('');
    });

    it.each([
      ['x²', '5', 'power-two', '25'],
      ['√', '9', 'square-root', '3'],
      ['%', '50', 'percent-btn', '0.5'],
      ['±', '5', 'sign-toggle', '-5']
    ])('applies %s from its key', (_label, number, id, expected) => {
      page.enter(number);
      page.click(id);

      expect(page.display()).toBe(expected);
    });

    it('clears everything with AC', () => {
      page.enter('5+3');
      page.click('reset-all');

      expect(page.display()).toBe('0');
      expect(page.history()).toBe('');
    });

    it('removes the last digit with backspace', () => {
      page.enter('123');
      page.click('delete-last');

      expect(page.display()).toBe('12');
    });
  });

  describe('errors', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows Error for division by zero, then starts again on the next key', () => {
      page.enter('5/0=');
      expect(page.display()).toBe('Error');

      page.enter('7');
      expect(page.display()).toBe('7');
    });

    it('shows Error for the square root of a negative number', () => {
      page.enter('4');
      page.click('sign-toggle');
      page.click('square-root');

      expect(page.display()).toBe('Error');
      expect(page.history()).toBe('');
    });

    it('lets backspace clear an error', () => {
      page.enter('5/0=');
      page.click('delete-last');

      expect(page.display()).toBe('0');
    });

    it('warns about a sixteenth digit for two seconds', () => {
      vi.useFakeTimers();
      const warning = page.byId('error-msg');

      page.enter('1234567890123456');

      expect(page.display()).toBe('123456789012345');
      expect(warning.textContent).toBe('Max 15 digits');
      expect(warning.style.display).toBe('block');

      vi.advanceTimersByTime(1999);
      expect(warning.style.display).toBe('block');

      vi.advanceTimersByTime(1);
      expect(warning.style.display).toBe('none');
    });
  });

  describe('keyboard', () => {
    it('types a sum and works it out on Enter', () => {
      '12*3'.split('').forEach((key) => page.keydown(key));
      page.keydown('Enter');

      expect(page.display()).toBe('36');
    });

    it('clears on Escape and deletes on Backspace', () => {
      ['4', '5', 'Backspace'].forEach((key) => page.keydown(key));
      expect(page.display()).toBe('4');

      page.keydown('Escape');
      expect(page.display()).toBe('0');
    });

    it('ignores function keys, which contain digits of their own', () => {
      page.keydown('5');
      page.keydown('F2');

      expect(page.display()).toBe('5');
    });

    it('leaves browser shortcuts such as Ctrl+= to the browser', () => {
      page.enter('5+3');
      const zoom = page.keydown('=', { ctrlKey: true });

      expect(page.display()).toBe('3');
      expect(page.history()).toBe('5+');
      expect(zoom.defaultPrevented).toBe(false);
    });

    it('leaves Enter on a focused key to that key instead of working out the answer', () => {
      page.enter('7+');
      const two = page.byId('num-2');
      two.focus();

      page.keydown('Enter', { on: two });

      expect(page.history()).toBe('7+');
    });

    it('keeps the keys it uses from the browser, so Firefox does not open Quick Find on /', () => {
      expect(page.keydown('/').defaultPrevented).toBe(true);
    });

    it('lets keys it does not use through', () => {
      expect(page.keydown('Tab').defaultPrevented).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('announces the screen through a status region', () => {
      const screen = page.byId('screen-inner');

      expect(screen.getAttribute('role')).toBe('status');
      expect(screen.getAttribute('aria-live')).toBe('polite');
      expect(screen.getAttribute('aria-atomic')).toBe('true');
    });

    it('raises warnings as alerts', () => {
      expect(page.byId('error-msg').getAttribute('role')).toBe('alert');
    });

    it.each([
      ['divide-btn', 'Divide'],
      ['multiply-btn', 'Multiply'],
      ['subtract-btn', 'Subtract'],
      ['add-btn', 'Add'],
      ['equals-btn', 'Equals'],
      ['decimal-btn', 'Decimal point']
    ])('names the %s key %s', (id, name) => {
      expect(page.byId(id).getAttribute('aria-label')).toBe(name);
    });

    /* Voice control users say what they see, so the name starts with the text on the key */
    it.each([
      ['reset-all', 'AC', 'AC, all clear'],
      ['power-two', 'x', 'x squared']
    ])('names %s starting with what is printed on it', (id, printed, name) => {
      const key = page.byId(id);

      expect(key.getAttribute('aria-label')).toBe(name);
      expect(key.getAttribute('aria-label').startsWith(printed)).toBe(true);
    });

    it('needs no global functions or inline handlers', () => {
      expect(page.document.querySelector('[onclick]')).toBeNull();
      expect(page.window.handleInput).toBeUndefined();
    });
  });

  /* jsdom runs no animations, so the tests mark which equations are faded out and end a round by hand */
  describe('background equations', () => {
    const equations = () => [...page.document.querySelectorAll('.math-example')];
    const contents = () => equations().map((equation) => equation.innerHTML);
    const position = ({ style }) => ({ top: style.top, bottom: style.bottom, left: style.left, right: style.right });
    const endRound = (equation) => equation.dispatchEvent(new page.window.Event('animationiteration'));
    const fadedOut = (...hidden) => equations().forEach((equation) => {
      equation.style.opacity = hidden.includes(equation) ? '0' : '0.8';
    });

    beforeEach(() => {
      initBackground(page.document);
    });

    it('trades places with another faded-out equation when its round ends', () => {
      const [first, second] = equations();
      const [firstEquation, secondEquation] = [first.innerHTML, second.innerHTML];
      fadedOut(first, second);

      endRound(first);

      expect(first.innerHTML).toBe(secondEquation);
      expect(second.innerHTML).toBe(firstEquation);
    });

    it('never moves an equation that is on screen', () => {
      const [first] = equations();
      const before = contents();
      fadedOut(first);

      endRound(first);

      expect(contents()).toEqual(before);
    });

    it('keeps swapping round after round', () => {
      const [first, second] = equations();
      const firstEquation = first.innerHTML;
      fadedOut(first, second);

      endRound(first);
      endRound(second);

      expect(first.innerHTML).toBe(firstEquation);
    });

    it('starts every equation at the spot the markup gives it', () => {
      const [first, second] = equations();

      expect(first.dataset.spot).toBe('10% 5%');
      expect(position(first)).toEqual({ top: '10%', bottom: 'auto', left: '5%', right: 'auto' });
      expect(position(second)).toEqual({ top: '10%', bottom: 'auto', left: '90%', right: 'auto' });
    });

    /* A spot on the left crosses as a mirror image first, one on the right crosses turned upside down, then both
       are turned upside down where they are, then they cross back the other way, which is where they started */
    it.each([
      ['left', 0, ['10%', 'auto', '5%', 'auto'], ['10%', 'auto', 'auto', '5%'], ['auto', '10%', '5%', 'auto'], ['auto', '10%', 'auto', '5%']],
      ['right', 1, ['10%', 'auto', '90%', 'auto'], ['auto', '10%', 'auto', '90%'], ['auto', '10%', '90%', 'auto'], ['10%', 'auto', 'auto', '90%']]
    ])('sends a spot on the %s across the screen every round and home on the fourth', (_side, index, ...rounds) => {
      const equation = equations()[index];
      const seen = [position(equation)];

      for (let round = 1; round <= 4; round++) {
        endRound(equation);
        seen.push(position(equation));
      }

      const expected = rounds.map(([top, bottom, left, right]) => ({ top, bottom, left, right }));
      expect(seen).toEqual([...expected, expected[0]]);
    });

    it('moves a spot on even when every other equation is on screen', () => {
      const [first] = equations();
      fadedOut(first);

      endRound(first);

      expect(position(first).right).toBe('5%');
    });

    it('nudges an equation that lands past the right edge back on screen', () => {
      const [first, second] = equations();
      Object.defineProperty(page.document.documentElement, 'clientWidth', { value: 400 });
      second.getBoundingClientRect = () => ({ left: 350, right: 430 });
      fadedOut(first, second);

      endRound(first);

      expect(second.style.transform).toBe('translateX(-30px)');
      expect(first.style.transform).toBe('');
    });

    it('nudges an equation that lands past the left edge back on screen', () => {
      const [first] = equations();
      Object.defineProperty(page.document.documentElement, 'clientWidth', { value: 400 });
      first.getBoundingClientRect = () => ({ left: -12, right: 60 });
      fadedOut(first);

      endRound(first);

      expect(first.style.transform).toBe('translateX(12px)');
    });
  });
});