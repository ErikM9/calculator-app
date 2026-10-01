import { describe, it, expect } from 'vitest';
import { OPERATORS, hasHigherOrEqualPriority, convertToPostfix, doMath, calculatePostfix } from '../../src/scripts.js';

describe('OPERATORS', () => {
  it.each([
    ['add', '+', '+'],
    ['subtract', '-', '-'],
    ['multiply', '×', '*'],
    ['divide', '÷', '/']
  ])('shows %s as %s and evaluates it as %s', (name, symbol, code) => {
    expect(OPERATORS[name]).toEqual({ symbol, code });
  });
});

describe('hasHigherOrEqualPriority', () => {
  it.each([
    ['*', '+', true],
    ['/', '-', true],
    ['+', '*', false],
    ['-', '/', false],
    ['+', '-', true],
    ['-', '+', true],
    ['*', '/', true],
    ['/', '*', true]
  ])('ranks %s against %s as %s', (a, b, expected) => {
    expect(hasHigherOrEqualPriority(a, b)).toBe(expected);
  });
});

describe('convertToPostfix', () => {
  it.each([
    ['a single number', ['42'], ['42']],
    ['a simple sum', ['2', '+', '3'], ['2', '3', '+']],
    ['multiplication ahead of addition', ['2', '+', '3', '*', '4'], ['2', '3', '4', '*', '+']],
    ['equal precedence from left to right', ['6', '-', '3', '+', '2'], ['6', '3', '-', '2', '+']],
    ['a chain of divisions from left to right', ['8', '/', '4', '/', '2'], ['8', '4', '/', '2', '/']],
    ['two products added together', ['2', '*', '3', '+', '4', '*', '5'], ['2', '3', '*', '4', '5', '*', '+']]
  ])('orders %s', (_label, infix, postfix) => {
    expect(convertToPostfix(infix)).toEqual(postfix);
  });
});

describe('doMath', () => {
  it.each([
    [2, 3, '+', 5],
    [5, 3, '-', 2],
    [4, 5, '*', 20],
    [10, 2, '/', 5],
    [-2, 3, '+', 1],
    [3, 5, '-', -2],
    [-3, 4, '*', -12],
    [7, 2, '/', 3.5],
    ['2', '3', '+', 5]
  ])('works out %j %s %j as %s', (a, b, op, expected) => {
    expect(doMath(a, b, op)).toBe(expected);
  });

  it('gives Infinity for division by zero', () => {
    expect(doMath(5, 0, '/')).toBe(Infinity);
  });

  it('gives NaN for an operator it does not know', () => {
    expect(doMath(2, 3, '%')).toBeNaN();
  });
});

describe('calculatePostfix', () => {
  it.each([
    [['2', '3', '+'], 5],
    [['4', '5', '*'], 20],
    [['2', '3', '4', '*', '+'], 14],
    [['8', '4', '/', '2', '/'], 1],
    [['-5', '3', '+'], -2],
    [['2.5', '2', '*'], 5]
  ])('evaluates %j as %s', (postfix, expected) => {
    expect(calculatePostfix(postfix)).toBe(expected);
  });
});