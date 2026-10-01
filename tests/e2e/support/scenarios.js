/* Button ids for every key on the pad, keyed by what is printed on it, with * and / as typing-friendly aliases */
export const KEY_IDS = {
  0: 'num-0', 1: 'num-1', 2: 'num-2', 3: 'num-3', 4: 'num-4',
  5: 'num-5', 6: 'num-6', 7: 'num-7', 8: 'num-8', 9: 'num-9',
  '+': 'add-btn',
  '-': 'subtract-btn',
  '×': 'multiply-btn',
  '*': 'multiply-btn',
  '÷': 'divide-btn',
  '/': 'divide-btn',
  '.': 'decimal-btn',
  '=': 'equals-btn',
  AC: 'reset-all',
  '⌫': 'delete-last',
  '%': 'percent-btn',
  'x²': 'power-two',
  '√': 'square-root',
  '±': 'sign-toggle'
};

/* Splits a sequence such as 4x²= into single keys, keeping the two-character keys together */
export const toKeys = (sequence) => sequence.match(/x²|AC|./gu);

/* Each scenario is pressed on the keypad from a fresh page and ends on the display shown */
export const ARITHMETIC = [
  { name: 'adds', keys: '2+3=', display: '5' },
  { name: 'subtracts', keys: '7-4=', display: '3' },
  { name: 'multiplies', keys: '6*7=', display: '42' },
  { name: 'divides', keys: '20/4=', display: '5' },
  { name: 'multiplies before adding', keys: '2+3*4=', display: '14' },
  { name: 'divides before subtracting', keys: '10-6/2=', display: '7' },
  { name: 'works through a mixed expression', keys: '10+5*2-3=', display: '17' },
  { name: 'chains additions', keys: '1+2+3+4=', display: '10' },
  { name: 'subtracts from left to right', keys: '10-3-2=', display: '5' },
  { name: 'divides from left to right', keys: '8/4/2=', display: '1' },
  { name: 'uses the second of two operators pressed in a row', keys: '5+-3=', display: '2' },
  { name: 'adds decimals without floating-point noise', keys: '0.1+0.2=', display: '0.3' },
  { name: 'multiplies decimals', keys: '2.5*4=', display: '10' },
  { name: 'keeps every digit of a fifteen-digit answer', keys: '10000000*10000000=', display: '100000000000000' },
  { name: 'shows a tiny answer in short exponent form', keys: '1/10000000=', display: '1e-7' },
  { name: 'shows a thousandth exactly', keys: '1/1000=', display: '0.001' },
  { name: 'drops an operator with nothing after it', keys: '5+=', display: '5' }
];

export const FUNCTIONS = [
  { name: 'squares a number', keys: '5x²', display: '25' },
  { name: 'takes a square root', keys: '9√', display: '3' },
  { name: 'turns 50 into a percentage', keys: '50%', display: '0.5' },
  { name: 'turns 1 into a percentage', keys: '1%', display: '0.01' },
  { name: 'makes a number negative', keys: '5±', display: '-5' },
  { name: 'makes it positive again', keys: '5±±', display: '5' },
  { name: 'calculates with a negative number', keys: '5±+3=', display: '-2' },
  { name: 'reads a leading minus as a negative sign', keys: '-5+3=', display: '-2' },
  { name: 'repeats the last operation on each =', keys: '5+3===', display: '14' },
  { name: 'repeats from the number on screen after x²', keys: '2+3=4x²=', display: '19' },
  { name: 'carries on from an answer', keys: '2+3=×4=', display: '20' },
  { name: 'starts afresh when a digit follows an answer', keys: '2+3=7', display: '7' }
];

export const EDITING = [
  { name: 'clears everything with AC', keys: '5+3AC', display: '0', history: '' },
  { name: 'removes the last digit', keys: '123⌫', display: '12' },
  { name: 'goes back to zero after the last digit', keys: '5⌫', display: '0' },
  { name: 'removes an operator and brings back the number before it', keys: '5+⌫', display: '5', history: '' },
  { name: 'shows the expression so far on the history line', keys: '12+3', display: '3', history: '12+' },
  { name: 'ignores a second decimal point', keys: '3.1.4', display: '3.14' },
  { name: 'drops leading zeros', keys: '005', display: '5' },
  { name: 'starts a leading decimal with 0', keys: '.5', display: '0.5' }
];

export const ERRORS = [
  { name: 'shows Error for division by zero', keys: '5/0=', display: 'Error', history: '' },
  { name: 'shows Error for the square root of a negative number', keys: '4±√', display: 'Error', history: '' },
  { name: 'starts again on the next key after an error', keys: '5/0=7', display: '7' },
  { name: 'clears an error with backspace', keys: '5/0=⌫', display: '0' }
];

/* Every key with the name a screen reader gives it */
export const KEY_NAMES = [
  ['reset-all', 'AC, all clear'],
  ['delete-last', 'Backspace'],
  ['percent-btn', 'Percent'],
  ['power-two', 'x squared'],
  ['square-root', 'Square Root'],
  ['divide-btn', 'Divide'],
  ['multiply-btn', 'Multiply'],
  ['subtract-btn', 'Subtract'],
  ['add-btn', 'Add'],
  ['sign-toggle', 'Toggle sign'],
  ['decimal-btn', 'Decimal point'],
  ['equals-btn', 'Equals']
];

export const SCREENS = [
  { name: 'small phone', width: 320, height: 568 },
  { name: 'phone', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 }
];