import { describe, it, expect } from 'vitest';
import { shortenIfTooLong, removeLeadingZeros, formatResult, toggleSign } from '../../src/scripts.js';

describe('shortenIfTooLong', () => {
  it('keeps a string of exactly 20 characters whole', () => {
    expect(shortenIfTooLong('1'.repeat(20))).toBe('1'.repeat(20));
  });

  it('cuts a 21-character string back to 20 and adds an ellipsis', () => {
    expect(shortenIfTooLong('1'.repeat(21))).toBe(`${'1'.repeat(20)}...`);
  });

  it('respects a custom limit', () => {
    expect(shortenIfTooLong('12345', 3)).toBe('123...');
  });

  it('leaves an empty string alone', () => {
    expect(shortenIfTooLong('')).toBe('');
  });
});

describe('removeLeadingZeros', () => {
  it.each([
    ['007', '7'],
    ['000123', '123'],
    ['0', '0'],
    ['000', '0'],
    ['0.5', '0.5'],
    ['00.123', '0.123'],
    ['-007', '-7'],
    ['-.5', '-0.5'],
    ['-.', '-0.'],
    ['', '0'],
    [null, '0'],
    [undefined, '0']
  ])('turns %j into %s', (input, expected) => {
    expect(removeLeadingZeros(input)).toBe(expected);
  });
});

describe('formatResult', () => {
  it.each([
    [42, '42'],
    [0.5, '0.5'],
    [3.14159, '3.14159'],
    [-42, '-42'],
    [-3.14, '-3.14'],
    [5.0, '5'],
    [3.1, '3.1'],
    [0.1 + 0.2, '0.3'],
    [1 / 3, '0.333333333333'],
    [-0, '0']
  ])('shows %s as %s', (value, expected) => {
    expect(formatResult(value)).toBe(expected);
  });

  /* toPrecision(15) prints a fifteen-digit whole number with no decimal point, which is where zeros used to be stripped from the number itself */
  it.each([
    [99999000000000, '99999000000000'],
    [100000000000000, '100000000000000'],
    [123450000000000, '123450000000000'],
    [999999999999999, '999999999999999'],
    [-100000000000000, '-100000000000000']
  ])('keeps every zero of the large whole number %s', (value, expected) => {
    expect(formatResult(value)).toBe(expected);
  });

  it.each([
    [1e-7, '1e-7'],
    [1e21, '1e+21']
  ])('writes the extreme value %s in short exponent form', (value, expected) => {
    expect(formatResult(value)).toBe(expected);
  });

  it('shows 0 for a value that is not a number', () => {
    expect(formatResult(NaN)).toBe('0');
  });
});

describe('toggleSign', () => {
  it.each([
    ['5', '-5'],
    ['42', '-42'],
    ['-5', '5'],
    ['.5', '-0.5'],
    ['0.5', '-0.5'],
    ['0', '0'],
    ['', '']
  ])('turns %j into %j', (input, expected) => {
    expect(toggleSign(input)).toBe(expected);
  });
});