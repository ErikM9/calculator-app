import { describe, it, expect, beforeEach } from 'vitest';
import { Calculator } from '../../src/scripts.js';

/* Presses a sequence of actions through the same dispatcher the page uses */
const press = (calc, ...actions) => actions.map((action) => calc.handleInput(action)).at(-1);

describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  it('starts at zero with nothing in the formula', () => {
    expect(calc.getState()).toMatchObject({ inputValue: '0', formula: [], shownFormula: '', replaceNext: true });
  });

  it('hands out a copy of the formula rather than the formula itself', () => {
    press(calc, 5, 'add');

    calc.getState().formula.push('9');

    expect(calc.formula).toEqual(['5', '+']);
  });

  describe('number entry', () => {
    it('builds up a multi-digit number', () => {
      press(calc, 1, 2, 3);
      expect(calc.inputValue).toBe('123');
    });

    it('replaces the starting zero with the first digit', () => {
      press(calc, 7);
      expect(calc.inputValue).toBe('7');
    });

    it('takes a fifteenth digit but refuses a sixteenth', () => {
      press(calc, ...'12345678901234'.split('').map(Number));
      expect(press(calc, 5)).toEqual({ value: '123456789012345' });

      expect(press(calc, 6).error).toBe('Max 15 digits');
      expect(calc.inputValue).toBe('123456789012345');
    });

    it('counts only digits towards the cap, not the sign or the point', () => {
      press(calc, 1, 'decimal', ...'2345678901234'.split('').map(Number), 'toggle-sign');

      expect(press(calc, 5)).toEqual({ value: '-1.23456789012345' });
    });

    it('starts a fresh number after a result', () => {
      press(calc, 2, 'add', 3, 'equals', 7);
      expect(calc.inputValue).toBe('7');
    });
  });

  describe('decimal entry', () => {
    it('adds a point to the number', () => {
      press(calc, 5, 'decimal');
      expect(calc.inputValue).toBe('5.');
    });

    it('starts with 0. when nothing has been entered', () => {
      press(calc, 'decimal');
      expect(calc.inputValue).toBe('0.');
    });

    it('ignores a second point', () => {
      press(calc, 3, 'decimal', 1, 'decimal', 4);
      expect(calc.inputValue).toBe('3.14');
    });

    it('starts 0. after a result', () => {
      press(calc, 2, 'add', 3, 'equals', 'decimal', 5);
      expect(calc.inputValue).toBe('0.5');
    });
  });

  describe('operators', () => {
    it('writes the number and operator to the history line', () => {
      press(calc, 5, 'add');
      expect(calc.shownFormula).toBe('5+');
    });

    it('chains operators across several numbers', () => {
      press(calc, 2, 'add', 3, 'multiply');
      expect(calc.shownFormula).toBe('2+3×');
    });

    it('replaces an operator pressed straight after another', () => {
      press(calc, 5, 'add', 'subtract', 'multiply');
      expect(calc.shownFormula).toBe('5×');
    });

    it('treats minus at the very start as a negative sign', () => {
      press(calc, 'subtract', 5);
      expect(calc.getState()).toMatchObject({ inputValue: '-5', shownFormula: '' });
    });

    it('treats minus after an answer of zero as a negative sign too', () => {
      press(calc, 5, 'subtract', 5, 'equals', 'subtract', 3);
      expect(calc.inputValue).toBe('-3');
    });

    it('refuses an operator it does not know', () => {
      expect(calc.useOperator('power')).toEqual({ error: 'Invalid operator' });
    });
  });

  describe('equals', () => {
    it.each([
      ['2+3', [2, 'add', 3], '5'],
      ['7-4', [7, 'subtract', 4], '3'],
      ['6×7', [6, 'multiply', 7], '42'],
      ['20÷4', [2, 0, 'divide', 4], '5'],
      ['2+3×4, multiplying first', [2, 'add', 3, 'multiply', 4], '14'],
      ['10-3-2, from left to right', [1, 0, 'subtract', 3, 'subtract', 2], '5'],
      ['10+5×2-3', [1, 0, 'add', 5, 'multiply', 2, 'subtract', 3], '17'],
      ['0.1+0.2 without floating-point noise', [0, 'decimal', 1, 'add', 0, 'decimal', 2], '0.3'],
      ['5+-3, using the second of two operators', [5, 'add', 'subtract', 3], '2'],
      ['2+3², squaring the second number', [2, 'add', 3, 'square'], '11']
    ])('works out %s', (_label, actions, expected) => {
      press(calc, ...actions, 'equals');
      expect(calc.inputValue).toBe(expected);
    });

    it('keeps every digit of a fifteen-digit answer', () => {
      press(calc, 1, 0, 0, 0, 0, 0, 0, 0, 'multiply', 1, 0, 0, 0, 0, 0, 0, 0, 'equals');
      expect(calc.inputValue).toBe('100000000000000');
    });

    it('clears the history line once there is an answer', () => {
      press(calc, 2, 'add', 3, 'equals');
      expect(calc.getState()).toMatchObject({ formula: [], shownFormula: '' });
    });

    it('drops a trailing operator that has nothing after it', () => {
      expect(press(calc, 5, 'add', 'equals')).toEqual({ value: '5' });
    });

    it('shows the number itself when there is nothing to work out', () => {
      expect(press(calc, 'equals')).toEqual({ value: '0' });
    });

    it('reports division by zero as a Math error', () => {
      expect(press(calc, 5, 'divide', 0, 'equals')).toEqual({ error: 'Math error' });
    });

    it('lets the next operator carry on from an answer', () => {
      press(calc, 2, 'add', 3, 'equals', 'multiply', 4, 'equals');
      expect(calc.inputValue).toBe('20');
    });
  });

  describe('pressing equals again', () => {
    it('repeats the last operation each time', () => {
      press(calc, 5, 'add', 3, 'equals');
      expect(calc.inputValue).toBe('8');

      press(calc, 'equals');
      expect(calc.inputValue).toBe('11');

      press(calc, 'equals');
      expect(calc.inputValue).toBe('14');
    });

    it('repeats the last operation of a chain', () => {
      press(calc, 2, 'add', 3, 'multiply', 4, 'equals', 'equals');
      expect(calc.inputValue).toBe('56');
    });

    /* Squares, roots and percentages change the number on screen, so the repeat has to start from that number */
    it.each([
      ['a square', [4, 'square'], '19'],
      ['a percentage', ['percent'], '3.05'],
      ['a square root', [9, 'sqrt'], '6']
    ])('starts from the number on screen after %s', (_label, actions, expected) => {
      press(calc, 2, 'add', 3, 'equals', ...actions, 'equals');
      expect(calc.inputValue).toBe(expected);
    });

    it('turns a repeat that runs off to infinity into a Math error', () => {
      calc.inputValue = '1e308';
      calc.lastUsedOp = '*';
      calc.lastNumberUsed = 10;

      expect(calc.repeatCalculation()).toEqual({ error: 'Math error' });
    });

    it('has nothing to repeat before any operation', () => {
      expect(calc.repeatCalculation()).toEqual({ ignored: true });
    });

    /* A function pressed inside a new sum must not turn its equals into a repeat of the previous one */
    it.each([
      ['a percentage', [5, 0, 'add', 1, 0, 'percent'], '50.1'],
      ['a square root', [5, 'multiply', 9, 'sqrt'], '15'],
      ['a square', [2, 'add', 3, 'square'], '11']
    ])('finishes a new sum which ends in %s after an earlier answer', (_label, actions, expected) => {
      press(calc, 2, 'add', 3, 'equals', ...actions, 'equals');
      expect(calc.inputValue).toBe(expected);
    });
  });

  describe('square, square root and percent', () => {
    it.each([
      ['squares 5', [5, 'square'], '25'],
      ['squares -3', [3, 'toggle-sign', 'square'], '9'],
      ['takes the square root of 9', [9, 'sqrt'], '3'],
      ['turns 50 into 0.5', [5, 0, 'percent'], '0.5'],
      ['turns 1 into 0.01', [1, 'percent'], '0.01'],
      ['leaves 0 as 0', ['percent'], '0']
    ])('%s', (_label, actions, expected) => {
      press(calc, ...actions);
      expect(calc.inputValue).toBe(expected);
    });

    it('refuses the square root of a negative number', () => {
      expect(press(calc, 4, 'toggle-sign', 'sqrt')).toEqual({ error: 'Invalid input for square root' });
    });

    it('accepts the square root of 0, the lowest number that has one', () => {
      expect(press(calc, 'sqrt')).toEqual({ value: '0' });
    });

    it('turns a square that runs off to infinity into a Math error', () => {
      calc.inputValue = '1e200';

      expect(calc.square()).toEqual({ error: 'Math error' });
    });

    it.each(['square', 'sqrt', 'percent'])('treats the outcome of %s as an answer, so the next digit starts a new number', (action) => {
      press(calc, 9, action, 7);
      expect(calc.inputValue).toBe('7');
    });

    it.each(['square', 'sqrt', 'percent'])('ignores %s straight after an operator', (action) => {
      expect(press(calc, 5, 'add', action)).toEqual({ ignored: true });
    });
  });

  describe('sign toggle', () => {
    it('switches between positive and negative', () => {
      press(calc, 5, 'toggle-sign');
      expect(calc.inputValue).toBe('-5');

      press(calc, 'toggle-sign');
      expect(calc.inputValue).toBe('5');
    });

    it('leaves zero alone', () => {
      press(calc, 'toggle-sign');
      expect(calc.inputValue).toBe('0');
    });
  });

  describe('backspace', () => {
    it('removes the last digit', () => {
      press(calc, 1, 2, 3, 'backspace');
      expect(calc.inputValue).toBe('12');
    });

    it('goes back to zero after the last digit', () => {
      press(calc, 5, 'backspace');
      expect(calc.inputValue).toBe('0');
    });

    it('returns to zero rather than leaving a lone minus sign', () => {
      press(calc, 5, 'toggle-sign', 'backspace');
      expect(calc.inputValue).toBe('0');
    });

    it('removes an operator and brings back the number before it', () => {
      press(calc, 5, 'add', 'backspace');
      expect(calc.getState()).toMatchObject({ inputValue: '5', shownFormula: '' });
    });

    it('edits the second number without touching the history line', () => {
      press(calc, 1, 2, 'add', 3, 4, 'backspace');
      expect(calc.getState()).toMatchObject({ inputValue: '3', shownFormula: '12+' });
    });

    it('brings back the right number after a subtraction', () => {
      press(calc, 3, 'subtract', 5, 'add', 'backspace');
      expect(calc.getState()).toMatchObject({ inputValue: '5', shownFormula: '3-', formula: ['3', '-'] });

      press(calc, 'equals');
      expect(calc.inputValue).toBe('-2');
    });

    it('brings back a number that ends in a decimal point', () => {
      press(calc, 5, 'decimal', 'add', 'backspace');
      expect(calc.getState()).toMatchObject({ inputValue: '5.', shownFormula: '' });
    });

    it('steps back through the second number, then the operator, into the first number', () => {
      press(calc, 1, 2, 'add', 3, 'backspace', 'backspace');
      expect(calc.getState()).toMatchObject({ inputValue: '12', shownFormula: '', formula: [] });
    });

    it.each([
      ['after removing a digit', [1, 2, 'backspace', 3], '13'],
      ['into the number it brought back', [1, 2, 'add', 'backspace', 3], '123'],
      ['after removing a digit from an answer', [1, 2, 'add', 3, 4, 'equals', 'backspace', 7], '47'],
      ['into the number it brought back from behind an answer of zero', [2, 'add', 0, 'square', 'backspace', 5], '25']
    ])('carries on typing %s', (_label, actions, expected) => {
      press(calc, ...actions);
      expect(calc.getState()).toMatchObject({ inputValue: expected, shownFormula: '' });
    });
  });

  describe('dispatcher', () => {
    it('clears everything', () => {
      press(calc, 5, 'add', 3, 'clear');
      expect(calc.getState()).toMatchObject({ inputValue: '0', formula: [], shownFormula: '' });
    });

    it('reports an action it does not know', () => {
      expect(calc.handleInput('unknown')).toEqual({ error: 'Unknown action' });
    });
  });
});