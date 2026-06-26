import { describe, it, expect, beforeEach } from 'vitest';
import {
  MAX_DIGITS,
  OPERATORS,
  shortenIfTooLong,
  removeLeadingZeros,
  formatResult,
  hasHigherOrEqualPriority,
  convertToPostfix,
  doMath,
  calculatePostfix,
  toggleSign,
  Calculator
} from '../../src/scripts.js';


describe('Constants', () => {
  it('MAX_DIGITS is 20', () => {
    expect(MAX_DIGITS).toBe(20);
  });

  it('OPERATORS has correct symbols and codes for all four ops', () => {
    expect(OPERATORS.add).toEqual({ symbol: '+', code: '+' });
    expect(OPERATORS.subtract).toEqual({ symbol: '-', code: '-' });
    expect(OPERATORS.multiply).toEqual({ symbol: '×', code: '*' });
    expect(OPERATORS.divide).toEqual({ symbol: '÷', code: '/' });
  });
});


describe('shortenIfTooLong', () => {
  it('leaves short strings alone', () => {
    expect(shortenIfTooLong('12345')).toBe('12345');
    expect(shortenIfTooLong('')).toBe('');
  });

  it('truncates at 20 chars and appends ellipsis', () => {
    const long = '123456789012345678901234567890';
    expect(shortenIfTooLong(long)).toBe('12345678901234567890...');
  });

  it('respects a custom limit', () => {
    expect(shortenIfTooLong('12345', 3)).toBe('123...');
  });
});


describe('removeLeadingZeros', () => {
  it('strips leading zeros from plain integers', () => {
    expect(removeLeadingZeros('007')).toBe('7');
    expect(removeLeadingZeros('000123')).toBe('123');
  });

  it('collapses multiple zeros to a single zero', () => {
    expect(removeLeadingZeros('0')).toBe('0');
    expect(removeLeadingZeros('000')).toBe('0');
  });

  it('handles decimal strings without over-stripping', () => {
    expect(removeLeadingZeros('0.5')).toBe('0.5');
    expect(removeLeadingZeros('00.123')).toBe('0.123');
  });

  it('returns "0" for empty/null/undefined', () => {
    expect(removeLeadingZeros('')).toBe('0');
    expect(removeLeadingZeros(null)).toBe('0');
    expect(removeLeadingZeros(undefined)).toBe('0');
  });

  it('handles the "-." partial input', () => {
    expect(removeLeadingZeros('-.')).toBe('-0.');
  });
});


describe('formatResult', () => {
  it('formats basic integers and decimals', () => {
    expect(formatResult(42)).toBe('42');
    expect(formatResult(0.5)).toBe('0.5');
    expect(formatResult(3.14159)).toBe('3.14159');
  });

  it('strips trailing zeros', () => {
    expect(formatResult(5.0)).toBe('5');
    expect(formatResult(3.10)).toBe('3.1');
  });

  it('fixes the 0.1 + 0.2 floating point problem', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0.3');
  });

  it('handles negatives', () => {
    expect(formatResult(-42)).toBe('-42');
    expect(formatResult(-3.14)).toBe('-3.14');
  });

  it('returns "0" for NaN', () => {
    expect(formatResult(NaN)).toBe('0');
  });
});


describe('hasHigherOrEqualPriority', () => {
  it('* and / beat + and -', () => {
    expect(hasHigherOrEqualPriority('*', '+')).toBe(true);
    expect(hasHigherOrEqualPriority('/', '-')).toBe(true);
  });

  it('+ and - do not beat * and /', () => {
    expect(hasHigherOrEqualPriority('+', '*')).toBe(false);
    expect(hasHigherOrEqualPriority('-', '/')).toBe(false);
  });

  it('same-precedence operators are considered equal', () => {
    expect(hasHigherOrEqualPriority('+', '-')).toBe(true);
    expect(hasHigherOrEqualPriority('-', '+')).toBe(true);
    expect(hasHigherOrEqualPriority('*', '/')).toBe(true);
    expect(hasHigherOrEqualPriority('/', '*')).toBe(true);
  });
});


describe('convertToPostfix', () => {
  it('handles a single number', () => {
    expect(convertToPostfix(['42'])).toEqual(['42']);
  });

  it('converts simple binary expressions', () => {
    expect(convertToPostfix(['2', '+', '3'])).toEqual(['2', '3', '+']);
    expect(convertToPostfix(['5', '-', '2'])).toEqual(['5', '2', '-']);
  });

  it('respects operator precedence (* before +)', () => {
    expect(convertToPostfix(['2', '+', '3', '*', '4'])).toEqual(['2', '3', '4', '*', '+']);
  });

  it('handles left-to-right evaluation for equal precedence', () => {
    expect(convertToPostfix(['6', '-', '3', '+', '2'])).toEqual(['6', '3', '-', '2', '+']);
  });

  it('handles multiple high-precedence operators', () => {
    expect(convertToPostfix(['2', '*', '3', '+', '4', '*', '5'])).toEqual(['2', '3', '*', '4', '5', '*', '+']);
  });
});


describe('doMath', () => {
  it('performs all four operations', () => {
    expect(doMath(2, 3, '+')).toBe(5);
    expect(doMath(5, 3, '-')).toBe(2);
    expect(doMath(4, 5, '*')).toBe(20);
    expect(doMath(10, 2, '/')).toBe(5);
  });

  it('handles negatives and non-integer results', () => {
    expect(doMath(-2, 3, '+')).toBe(1);
    expect(doMath(3, 5, '-')).toBe(-2);
    expect(doMath(-3, 4, '*')).toBe(-12);
    expect(doMath(7, 2, '/')).toBe(3.5);
  });

  it('dividing by zero gives Infinity', () => {
    expect(doMath(5, 0, '/')).toBe(Infinity);
  });

  it('returns NaN for an unrecognised operator', () => {
    expect(doMath(2, 3, '%')).toBeNaN();
  });

  it('coerces string inputs to numbers', () => {
    expect(doMath('2', '3', '+')).toBe(5);
  });
});


describe('calculatePostfix', () => {
  it('evaluates simple expressions', () => {
    expect(calculatePostfix(['2', '3', '+'])).toBe(5);
    expect(calculatePostfix(['4', '5', '*'])).toBe(20);
  });

  it('evaluates a mixed-precedence postfix expression', () => {
    expect(calculatePostfix(['2', '3', '4', '*', '+'])).toBe(14);
  });

  it('handles negatives and decimals', () => {
    expect(calculatePostfix(['-5', '3', '+'])).toBe(-2);
    expect(calculatePostfix(['2.5', '2', '*'])).toBe(5);
  });
});


describe('toggleSign', () => {
  it('negates a positive number string', () => {
    expect(toggleSign('5')).toBe('-5');
    expect(toggleSign('42')).toBe('-42');
  });

  it('removes the minus sign from a negative', () => {
    expect(toggleSign('-5')).toBe('5');
  });

  it('leaves zero unchanged', () => {
    expect(toggleSign('0')).toBe('0');
  });

  it('handles a bare decimal starting with "."', () => {
    expect(toggleSign('.5')).toBe('-0.5');
  });

  it('returns empty string unchanged', () => {
    expect(toggleSign('')).toBe('');
  });
});


describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  it('initialises with zeroed state', () => {
    const state = calc.getState();
    expect(state.inputValue).toBe('0');
    expect(state.formula).toEqual([]);
    expect(state.shownFormula).toBe('');
    expect(state.replaceNext).toBe(true);
  });

  describe('number entry', () => {
    it('builds up a multi-digit number', () => {
      calc.addNumber(1);
      calc.addNumber(2);
      calc.addNumber(3);
      expect(calc.inputValue).toBe('123');
    });

    it('replaces the initial zero on first keypress', () => {
      calc.addNumber(7);
      expect(calc.inputValue).toBe('7');
    });

    it('enforces the 15-digit cap', () => {
      calc.inputValue = '123456789012345';
      calc.replaceNext = false;
      expect(calc.addNumber(6).error).toMatch(/^Max \d+ digits$/);
    });

    it('enforces the 15-digit cap via handleInput', () => {
      calc.inputValue = '123456789012345';
      calc.replaceNext = false;
      expect(calc.handleInput(6).error).toMatch(/^Max \d+ digits$/);
    });
  });

  describe('decimal entry', () => {
    it('appends a decimal point', () => {
      calc.addNumber(5);
      calc.addDecimal();
      expect(calc.inputValue).toBe('5.');
    });

    it('starts with 0. when nothing entered yet', () => {
      calc.addDecimal();
      expect(calc.inputValue).toBe('0.');
    });

    it('ignores a second decimal point', () => {
      calc.addNumber(3);
      calc.addDecimal();
      calc.addNumber(1);
      calc.addDecimal();
      expect(calc.inputValue).toBe('3.1');
    });
  });

  describe('operators', () => {
    it('records the operator and shown formula', () => {
      calc.addNumber(5);
      calc.useOperator('add');
      expect(calc.shownFormula).toBe('5+');
    });

    it('chains operators across multiple numbers', () => {
      calc.addNumber(2);
      calc.useOperator('add');
      calc.addNumber(3);
      calc.useOperator('multiply');
      expect(calc.shownFormula).toBe('2+3×');
    });

    it('replaces the previous operator if pressed twice in a row', () => {
      calc.addNumber(5);
      calc.useOperator('add');
      calc.useOperator('subtract');
      expect(calc.shownFormula).toBe('5-');
    });

    it('treats subtract at the very start as a negative sign', () => {
      calc.useOperator('subtract');
      expect(calc.inputValue).toBe('-0');
    });
  });

  describe('calculate', () => {
    it('does basic arithmetic', () => {
      calc.addNumber(2); calc.useOperator('add'); calc.addNumber(3);
      expect(calc.calculate().value).toBe('5');

      calc.reset();
      calc.addNumber(7); calc.useOperator('subtract'); calc.addNumber(4);
      expect(calc.calculate().value).toBe('3');

      calc.reset();
      calc.addNumber(6); calc.useOperator('multiply'); calc.addNumber(7);
      expect(calc.calculate().value).toBe('42');

      calc.reset();
      calc.addNumber(2); calc.addNumber(0); calc.useOperator('divide'); calc.addNumber(4);
      expect(calc.calculate().value).toBe('5');
    });

    it('respects operator precedence', () => {
      calc.addNumber(2); calc.useOperator('add');
      calc.addNumber(3); calc.useOperator('multiply'); calc.addNumber(4);
      expect(calc.calculate().value).toBe('14');
    });

    it('handles chained operations left-to-right', () => {
      calc.addNumber(1); calc.addNumber(0);
      calc.useOperator('subtract'); calc.addNumber(3);
      calc.useOperator('subtract'); calc.addNumber(2);
      expect(calc.calculate().value).toBe('5');
    });

    it('returns an error for division by zero', () => {
      calc.addNumber(5); calc.useOperator('divide'); calc.addNumber(0);
      expect(calc.calculate().error).toBe('Math error');
    });

    it('clears formula and history after a result', () => {
      calc.addNumber(2); calc.useOperator('add'); calc.addNumber(3);
      calc.calculate();
      expect(calc.formula).toEqual([]);
      expect(calc.shownFormula).toBe('');
    });

    it('does nothing with a trailing operator (no second operand)', () => {
      calc.addNumber(5); calc.useOperator('add');
      expect(calc.calculate().value).toBe('5');
    });
  });

  describe('repeat calculation', () => {
    it('re-applies the last operation each time = is pressed', () => {
      calc.addNumber(5); calc.useOperator('add'); calc.addNumber(3);
      calc.calculate();
      expect(calc.inputValue).toBe('8');
      calc.repeatCalculation();
      expect(calc.inputValue).toBe('11');
      calc.repeatCalculation();
      expect(calc.inputValue).toBe('14');
    });
  });

  describe('square / sqrt / percent', () => {
    it('squares positive and negative numbers', () => {
      calc.addNumber(5); calc.square();
      expect(calc.inputValue).toBe('25');

      calc.reset();
      calc.addNumber(3); calc.flipSign(); calc.square();
      expect(calc.inputValue).toBe('9');
    });

    it('returns error for sqrt of a negative', () => {
      calc.addNumber(4); calc.flipSign();
      expect(calc.squareRoot().error).toBe('Invalid input for square root');
    });

    it('calculates square root correctly', () => {
      calc.addNumber(9); calc.squareRoot();
      expect(calc.inputValue).toBe('3');
    });

    it('converts percent', () => {
      calc.addNumber(5); calc.addNumber(0); calc.percent();
      expect(calc.inputValue).toBe('0.5');

      calc.reset();
      calc.addNumber(1); calc.percent();
      expect(calc.inputValue).toBe('0.01');

      calc.reset();
      calc.percent();
      expect(calc.inputValue).toBe('0');
    });
  });

  describe('flipSign', () => {
    it('toggles between positive and negative', () => {
      calc.addNumber(5); calc.flipSign();
      expect(calc.inputValue).toBe('-5');
      calc.flipSign();
      expect(calc.inputValue).toBe('5');
    });

    it('does not toggle zero', () => {
      calc.flipSign();
      expect(calc.inputValue).toBe('0');
    });
  });

  describe('backspace', () => {
    it('removes the last digit', () => {
      calc.addNumber(1); calc.addNumber(2); calc.addNumber(3);
      calc.backspace();
      expect(calc.inputValue).toBe('12');
    });

    it('goes back to zero when the last digit is removed', () => {
      calc.addNumber(5);
      calc.backspace();
      expect(calc.inputValue).toBe('0');
    });

    it('removes the operator and restores the previous number', () => {
      calc.addNumber(5); calc.useOperator('add');
      calc.backspace();
      expect(calc.inputValue).toBe('5');
    });

    it('works via handleInput dispatch', () => {
      calc.handleInput(1); calc.handleInput(2); calc.handleInput(3);
      calc.handleInput('backspace');
      expect(calc.inputValue).toBe('12');
    });
  });

  describe('reset', () => {
    it('wipes all state back to defaults', () => {
      calc.addNumber(5); calc.useOperator('add'); calc.addNumber(3);
      calc.reset();
      const state = calc.getState();
      expect(state.inputValue).toBe('0');
      expect(state.formula).toEqual([]);
      expect(state.shownFormula).toBe('');
    });
  });

  describe('handleInput dispatch', () => {
    it('routes digits, decimal, operators, and equals correctly', () => {
      calc.handleInput(5);
      calc.handleInput('add');
      calc.handleInput(3);
      calc.handleInput('equals');
      expect(calc.inputValue).toBe('8');
    });

    it('routes decimal input', () => {
      calc.handleInput(3); calc.handleInput('decimal');
      calc.handleInput(1); calc.handleInput(4);
      expect(calc.inputValue).toBe('3.14');
    });

    it('routes clear', () => {
      calc.handleInput(5); calc.handleInput('add');
      calc.handleInput('clear');
      expect(calc.inputValue).toBe('0');
    });

    it('returns an error for an unrecognised action', () => {
      expect(calc.handleInput('unknown').error).toBe('Unknown action');
    });
  });

  describe('edge cases', () => {
    it('leading decimal becomes 0.5', () => {
      calc.addDecimal(); calc.addNumber(5);
      expect(calc.inputValue).toBe('0.5');
    });

    it('continues a calculation after a result', () => {
      calc.addNumber(2); calc.useOperator('add'); calc.addNumber(3);
      calc.calculate();
      calc.useOperator('multiply'); calc.addNumber(4);
      calc.calculate();
      expect(calc.inputValue).toBe('20');
    });

    it('handles a complex mixed-precedence expression', () => {
      calc.addNumber(1); calc.addNumber(0); calc.useOperator('add');
      calc.addNumber(5); calc.useOperator('multiply'); calc.addNumber(2);
      calc.useOperator('subtract'); calc.addNumber(3);
      calc.calculate();
      expect(calc.inputValue).toBe('17');
    });
  });
});