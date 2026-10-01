import { describe, it, expect } from 'vitest';
import { actionForKey } from '../../src/scripts.js';

describe('actionForKey', () => {
  it.each([
    ['0', 0],
    ['7', 7],
    ['+', 'add'],
    ['-', 'subtract'],
    ['*', 'multiply'],
    ['x', 'multiply'],
    ['X', 'multiply'],
    ['/', 'divide'],
    ['%', 'percent'],
    ['.', 'decimal'],
    ['=', 'equals'],
    ['Enter', 'equals'],
    ['Escape', 'clear'],
    ['Backspace', 'backspace']
  ])('maps %s to %j', (key, action) => {
    expect(actionForKey({ key })).toBe(action);
  });

  /* Function keys contain digits, which a loose digit check mistook for numbers */
  it.each(['F1', 'F2', 'F10', 'F12', 'Tab', 'Shift', 'ArrowUp', 'a', 'xx', '10'])('ignores %s', (key) => {
    expect(actionForKey({ key })).toBeNull();
  });

  it.each([
    ['Ctrl+= for zooming in', { key: '=', ctrlKey: true }],
    ['Ctrl+- for zooming out', { key: '-', ctrlKey: true }],
    ['Cmd+1 for switching tabs', { key: '1', metaKey: true }],
    ['Alt+x for a menu', { key: 'x', altKey: true }]
  ])('leaves %s to the browser', (_label, press) => {
    expect(actionForKey(press)).toBeNull();
  });

  it('leaves Enter on a focused key to that key', () => {
    expect(actionForKey({ key: 'Enter', onButton: true })).toBeNull();
  });

  it('still maps other keys while a key has focus', () => {
    expect(actionForKey({ key: '5', onButton: true })).toBe(5);
  });
});