const MAX_INPUT_DIGITS = 15;

export const OPERATORS = {
  add:      { symbol: "+", code: "+" },
  subtract: { symbol: "-", code: "-" },
  multiply: { symbol: "×", code: "*" },
  divide:   { symbol: "÷", code: "/" }
};

/* Strips leading zeros but keeps one in front of a decimal point, so "-." becomes "-0." and "00.5" becomes "0.5" */
export function removeLeadingZeros(numStr) {
  if (!numStr) return "0";
  if (numStr === "-.") return "-0.";

  const isNegative = numStr.startsWith('-');
  let str = isNegative ? numStr.slice(1) : numStr;

  if (str.includes(".")) {
    str = str.replace(/^0+/, '');
    if (str.startsWith('.')) str = '0' + str;
  } else {
    str = str.replace(/^0+/, '') || '0';
  }

  return isNegative ? '-' + str : str;
}

/* Rounds away floating-point noise and lets String() drop the trailing zeros of a decimal */
export function formatResult(num) {
  if (isNaN(num)) return "0";
  const rounded = Number(num.toFixed(12));
  return String(Number(rounded.toPrecision(15)));
}

export function hasHigherOrEqualPriority(opA, opB) {
  const precedence = { "*": 2, "/": 2, "+": 1, "-": 1 };
  return (precedence[opA] ?? 0) >= (precedence[opB] ?? 0);
}

/* Shunting-yard: converts infix token array to postfix (RPN) order */
export function convertToPostfix(infix) {
  const stack = [];
  const output = [];
  for (const token of infix) {
    if (isNaN(parseFloat(token))) {
      /* Pop higher/equal-precedence operators to output before pushing the new one */
      while (stack.length && hasHigherOrEqualPriority(stack[stack.length - 1], token)) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else {
      output.push(token);
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

export function doMath(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return a / b;
    default:  return NaN;
  }
}

/* Evaluates postfix tokens on a stack, where each operator replaces the top two numbers with its result */
export function calculatePostfix(postfix) {
  const stack = [];
  for (const token of postfix) {
    if (isNaN(parseFloat(token))) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(doMath(a, b, token));
    } else {
      stack.push(parseFloat(token));
    }
  }
  return stack.pop();
}

export function toggleSign(numStr) {
  if (!numStr || numStr === "0") return numStr;
  if (numStr.startsWith("-")) return numStr.slice(1);
  /* A bare decimal like ".5" also gets a leading zero, giving "-0.5" */
  if (numStr.startsWith(".")) return "-0" + numStr;
  return "-" + numStr;
}

export class Calculator {
  constructor() {
    this.reset();
  }

  reset() {
    this.formula = [];
    this.shownFormula = "";
    this.inputValue = "0";
    this.replaceNext = true;
    this.lastWasOperator = false;
    this.showingResult = false;
    this.lastUsedOp = null;
    this.lastNumberUsed = null;
  }

  getState() {
    return {
      formula:        [...this.formula],
      shownFormula:   this.shownFormula,
      inputValue:     this.inputValue,
      replaceNext:    this.replaceNext,
      lastWasOperator: this.lastWasOperator,
      showingResult:  this.showingResult,
      lastUsedOp:     this.lastUsedOp,
      lastNumberUsed: this.lastNumberUsed
    };
  }

  addNumber(digit) {
    if (this.showingResult || this.replaceNext) {
      this.inputValue = String(digit);
      this.showingResult = false;
      this.replaceNext = false;
    } else {
      if (this.inputValue.replace(/[-.]/g, "").length >= MAX_INPUT_DIGITS) {
        return { error: `Max ${MAX_INPUT_DIGITS} digits` };
      }
      this.inputValue += digit;
    }
    this.inputValue = removeLeadingZeros(this.inputValue);
    this.lastWasOperator = false;
    return { value: this.inputValue };
  }

  addDecimal() {
    if (this.showingResult || this.replaceNext) {
      this.inputValue = "0.";
      this.showingResult = false;
      this.replaceNext = false;
    } else if (!this.inputValue.includes(".")) {
      this.inputValue += ".";
    }
    this.lastWasOperator = false;
    return { value: this.inputValue };
  }

  useOperator(opName) {
    const op = OPERATORS[opName];
    if (!op) return { error: "Invalid operator" };

    if (this.lastWasOperator) {
      /* Replace the previous operator rather than stacking two in a row */
      this.formula.pop();
      this.formula.push(op.code);
      this.shownFormula = this.shownFormula.slice(0, -1) + op.symbol;
    } else {
      if (this.inputValue === "0" && opName === "subtract") {
        /* Subtract at the very start means the user is entering a negative number */
        this.inputValue = "-0";
        this.replaceNext = false;
        this.lastWasOperator = false;
        this.showingResult = false;
        return { value: this.inputValue };
      }
      const value = this.inputValue || "0";
      this.formula.push(value, op.code);
      this.shownFormula += value + op.symbol;
    }

    this.replaceNext = true;
    this.lastWasOperator = true;
    this.inputValue = "0";
    this.showingResult = false;
    return { formula: this.shownFormula };
  }

  square() {
    if (this.lastWasOperator) return { ignored: true };
    const num = parseFloat(this.inputValue);
    if (isNaN(num)) return { error: "Invalid number" };
    if (!isFinite(num * num)) return { error: "Math error" };
    this.inputValue = formatResult(num * num);
    this.replaceNext = false;
    this.lastWasOperator = false;
    this.showingResult = true;
    return { value: this.inputValue };
  }

  squareRoot() {
    if (this.lastWasOperator) return { ignored: true };
    const num = parseFloat(this.inputValue);
    if (isNaN(num) || num < 0) return { error: "Invalid input for square root" };
    this.inputValue = formatResult(Math.sqrt(num));
    this.replaceNext = false;
    this.lastWasOperator = false;
    this.showingResult = true;
    return { value: this.inputValue };
  }

  percent() {
    if (this.lastWasOperator) return { ignored: true };
    const num = parseFloat(this.inputValue);
    if (isNaN(num)) return { error: "Invalid number" };
    this.inputValue = formatResult(num / 100);
    this.replaceNext = false;
    this.lastWasOperator = false;
    this.showingResult = true;
    return { value: this.inputValue };
  }

  flipSign() {
    if (this.inputValue === "0" || !this.inputValue) return { value: this.inputValue };
    this.inputValue = toggleSign(this.inputValue);
    this.showingResult = false;
    return { value: this.inputValue };
  }

  calculate() {
    try {
      let evalFormula = this.formula.slice();

      if (!this.lastWasOperator && this.inputValue !== "") {
        evalFormula.push(this.inputValue);
      } else if (evalFormula.length > 0 && ["+", "-", "*", "/"].includes(evalFormula[evalFormula.length - 1])) {
        /* A trailing operator with no second operand is dropped */
        evalFormula.pop();
      }

      if (evalFormula.length === 0) return { value: this.inputValue };

      const result = calculatePostfix(convertToPostfix(evalFormula));

      if (!isFinite(result)) return { error: "Math error" };

      this.inputValue = formatResult(result);

      /* Remember the last binary operation so = can repeat it */
      if (evalFormula.length >= 3) {
        const lastNum  = evalFormula[evalFormula.length - 1];
        const op       = evalFormula[evalFormula.length - 2];
        const prevNum  = evalFormula[evalFormula.length - 3];
        if (!isNaN(parseFloat(lastNum)) && ["+", "-", "*", "/"].includes(op) && !isNaN(parseFloat(prevNum))) {
          this.lastUsedOp = op;
          this.lastNumberUsed = parseFloat(lastNum);
        }
      }

      this.formula = [];
      this.shownFormula = "";
      this.replaceNext = false;
      this.lastWasOperator = false;
      this.showingResult = true;
      return { value: this.inputValue };
    } catch {
      return { error: "Calculation error" };
    }
  }

  repeatCalculation() {
    if (this.lastUsedOp && this.lastNumberUsed != null) {
      /* The value on screen is the starting point, so a square, root or percent taken of a result carries into the repeat */
      const expr = [this.inputValue, this.lastUsedOp, this.lastNumberUsed.toString()];
      try {
        const result = calculatePostfix(convertToPostfix(expr));
        if (!isFinite(result)) return { error: "Math error" };
        this.inputValue = formatResult(result);
        this.showingResult = true;
        return { value: this.inputValue };
      } catch {
        return { error: "Calculation error" };
      }
    }
    return { ignored: true };
  }

  backspace() {
    if (this.formula.length === 0 && !this.showingResult) {
      this.inputValue = this.inputValue.slice(0, -1) || "0";
      if (["", "-", "-0", "-."].includes(this.inputValue)) this.inputValue = "0";
      this.inputValue = removeLeadingZeros(this.inputValue);
      this.showingResult = false;
    } else if (!this.replaceNext && this.inputValue !== "0") {
      this.inputValue = this.inputValue.slice(0, -1) || "0";
      if (["", "-", "-0", "-."].includes(this.inputValue)) this.inputValue = "0";
      this.inputValue = removeLeadingZeros(this.inputValue);
      this.showingResult = false;
    } else if (this.shownFormula) {
      /* Removes the operator and brings the number before it back for editing */
      this.formula.pop();
      const previous = this.formula.pop();
      this.shownFormula = this.shownFormula.slice(0, -(previous.length + 1));
      this.inputValue = previous;
      this.lastWasOperator = false;
      this.replaceNext = false;
      this.showingResult = false;
    } else {
      this.inputValue = "0";
      this.replaceNext = true;
    }

    return { value: this.inputValue, formula: this.shownFormula };
  }

  /* Central dispatcher that routes every action string or digit to the right method */
  handleInput(action) {
    if (typeof action === "number") {
      return this.addNumber(action);
    } else if (action === "decimal") {
      return this.addDecimal();
    } else if (["add", "subtract", "multiply", "divide"].includes(action)) {
      return this.useOperator(action);
    } else if (action === "square") {
      return this.square();
    } else if (action === "sqrt") {
      return this.squareRoot();
    } else if (action === "percent") {
      return this.percent();
    } else if (action === "toggle-sign") {
      return this.flipSign();
    } else if (action === "equals") {
      if (this.showingResult && this.lastUsedOp && this.lastNumberUsed != null && this.formula.length === 0) {
        return this.repeatCalculation();
      }
      return this.calculate();
    } else if (action === "backspace") {
      return this.backspace();
    } else if (action === "clear") {
      this.reset();
      return { value: "0" };
    }
    return { error: "Unknown action" };
  }
}

const KEY_ACTIONS = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  x: "multiply",
  X: "multiply",
  "/": "divide",
  "%": "percent",
  ".": "decimal",
  "=": "equals",
  Enter: "equals",
  Escape: "clear",
  Backspace: "backspace"
};

/* Maps a key press to a calculator action, leaving browser shortcuts and Enter on a focused key alone */
export function actionForKey({ key, ctrlKey = false, metaKey = false, altKey = false, onButton = false }) {
  if (ctrlKey || metaKey || altKey) return null;
  if (key === "Enter" && onButton) return null;
  if (/^[0-9]$/.test(key)) return Number(key);
  return KEY_ACTIONS[key] ?? null;
}

/* --- Browser UI --- */

/* Wires the calculator up to the given document, which lets a test pass in a page of its own */
export function initCalculator(doc = globalThis.document) {
  const view = doc.defaultView ?? globalThis;
  const calculator = new Calculator();
  const mainScreen = doc.getElementById("current-number");
  const historyScreen = doc.getElementById("history-line");
  const errorBox = doc.getElementById("error-msg");
  let hideWarningTimer;

  function displayError(message) {
    clearTimeout(hideWarningTimer);
    errorBox.textContent = message;
    errorBox.style.display = "block";
    /* The warning hides itself after 2 seconds */
    hideWarningTimer = setTimeout(() => {
      errorBox.style.display = "none";
    }, 2000);
  }

  /* Shrinks font size one pixel at a time until the text fits, down to a minimum of 10px */
  function fitTextToScreen(element, text) {
    element.style.fontSize = "var(--base-font-size)";
    element.textContent = text;
    let size = parseFloat(view.getComputedStyle(element).fontSize);
    const maxW = element.clientWidth;
    while (element.scrollWidth > maxW && size > 10) {
      size -= 1;
      element.style.fontSize = size + "px";
    }
  }

  function updateScreen() {
    historyScreen.textContent = calculator.shownFormula;
    fitTextToScreen(mainScreen, calculator.inputValue);
  }

  function handleInput(action) {
    if (mainScreen.textContent === "Error") calculator.reset();

    const result = calculator.handleInput(action);

    if (result.error) {
      if (result.error.startsWith("Max ") && result.error.endsWith(" digits")) {
        displayError(result.error);
      } else if (result.error === "Invalid input for square root" || result.error === "Math error") {
        mainScreen.textContent = "Error";
        historyScreen.textContent = "";
        calculator.reset();
        return;
      }
    }

    updateScreen();
  }

  /* One listener serves every key on the pad, reading what to do from its data-action attribute */
  doc.querySelector(".keypad").addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const { action } = button.dataset;
    handleInput(/^[0-9]$/.test(action) ? Number(action) : action);
  });

  /* A key clicked with the mouse does not take focus, so Enter afterwards still works out the answer */
  doc.querySelector(".keypad").addEventListener("mousedown", (e) => e.preventDefault());

  doc.addEventListener("keydown", (e) => {
    const action = actionForKey({
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey,
      onButton: Boolean(e.target.closest?.("button"))
    });
    if (action === null) return;

    /* Keys the calculator uses are kept from the browser, which would otherwise open Quick Find on / in Firefox */
    e.preventDefault();
    handleInput(action);
  });

  updateScreen();
  return calculator;
}

/* --- Background equations --- */

/* The layout each half of the screen uses in each round, which brings every spot home again after four rounds */
const LAYOUTS = [
  { left: "as is", right: "as is" },
  { left: "mirrored", right: "upside down" },
  { left: "flipped", right: "flipped" },
  { left: "upside down", right: "mirrored" }
];

/* Turns a spot into CSS offsets for a round, measuring from the opposite edges when it is mirrored or flipped */
function spotPosition(spot, round) {
  const [fromTop, fromLeft] = spot.split(" ");
  const half = parseFloat(fromLeft) < 50 ? "left" : "right";
  const change = LAYOUTS[round % LAYOUTS.length][half];
  const mirrored = change === "mirrored" || change === "upside down";
  const flipped = change === "flipped" || change === "upside down";

  return {
    top: flipped ? "auto" : fromTop,
    bottom: flipped ? fromTop : "auto",
    left: mirrored ? "auto" : fromLeft,
    right: mirrored ? fromLeft : "auto"
  };
}

/* Each faded-out equation moves to its next spot and swaps places with another hidden one, so nothing moves while visible */
export function initBackground(doc = globalThis.document) {
  const view = doc.defaultView ?? globalThis;
  const equations = [...doc.querySelectorAll(".math-example")];
  const isHidden = (equation) => view.getComputedStyle(equation).opacity === "0";
  const rounds = new Map(equations.map((equation) => [equation, 0]));

  /* A longer equation landing in a spot near an edge is nudged back just enough to stay fully on screen */
  function keepInView(equation) {
    equation.style.transform = "";
    const box = equation.getBoundingClientRect();
    const overflow = Math.max(box.right - doc.documentElement.clientWidth, 0) + Math.min(box.left, 0);
    if (overflow) equation.style.transform = `translateX(${-overflow}px)`;
  }

  function place(equation) {
    Object.assign(equation.style, spotPosition(equation.dataset.spot, rounds.get(equation)));
    keepInView(equation);
  }

  equations.forEach((equation) => {
    place(equation);

    equation.addEventListener("animationiteration", () => {
      rounds.set(equation, rounds.get(equation) + 1);
      place(equation);

      const partners = equations.filter((other) => other !== equation && isHidden(other));
      if (!partners.length) return;

      const partner = partners[Math.floor(Math.random() * partners.length)];
      const moving = [...equation.childNodes];
      equation.replaceChildren(...partner.childNodes);
      partner.replaceChildren(...moving);
      keepInView(equation);
      keepInView(partner);
    });
  });
}

/* Start the calculator when a browser loads this module */
if (typeof document !== 'undefined' && document.getElementById('current-number')) {
  initCalculator();
  initBackground();
}