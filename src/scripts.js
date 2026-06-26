export const MAX_DIGITS = 20;
/* Display truncation limit and input entry cap are separate concerns */
const MAX_INPUT_DIGITS = 15;

export const OPERATORS = {
  add:      { symbol: "+", code: "+" },
  subtract: { symbol: "-", code: "-" },
  multiply: { symbol: "×", code: "*" },
  divide:   { symbol: "÷", code: "/" }
};

export function shortenIfTooLong(text, maxDigits = MAX_DIGITS) {
  return text.length > maxDigits ? text.slice(0, maxDigits) + "..." : text;
}

/* Handles the "-." edge case and preserves the decimal point for partial inputs like "0.5" */
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

/* Rounds to 12 decimal places to fix floating-point noise, then strips trailing zeros */
export function formatResult(num) {
  if (isNaN(num)) return "0";
  num = Number(num.toFixed(12));
  return num.toPrecision(15).replace(/\.?0+$/, "");
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

/* Postfix stack evaluator: numbers push, operators pop two and push the result */
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
  /* Bare decimal like ".5" needs "0" prepended before the minus */
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
    this.previousResult = null;
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
      previousResult: this.previousResult,
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

    const lastItem = this.formula[this.formula.length - 1] || "";

    if (this.lastWasOperator) {
      if (["+", "-", "*", "/"].includes(lastItem)) {
        /* Replace the previous operator rather than stacking two in a row */
        this.formula.pop();
        this.formula.push(op.code);
        this.shownFormula = this.shownFormula.slice(0, -1) + op.symbol;
      } else if (this.formula.length === 0 && opName === "subtract") {
        this.inputValue = "-";
        this.replaceNext = false;
        this.lastWasOperator = false;
        return { value: this.inputValue };
      } else {
        return { ignored: true };
      }
    } else {
      if (this.inputValue === "0" && opName === "subtract" && this.formula.length === 0) {
        /* Subtract at the very start means the user is entering a negative number */
        this.inputValue = "-0";
        this.replaceNext = false;
        this.lastWasOperator = false;
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
        /* Trailing operator with no second operand — drop it and return current value */
        evalFormula.pop();
      }

      if (evalFormula.length === 0) return { value: this.inputValue };

      const result = calculatePostfix(convertToPostfix(evalFormula));

      if (!isFinite(result)) return { error: "Math error" };

      this.inputValue = formatResult(result);
      this.previousResult = result;

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
    if (this.previousResult != null && this.lastUsedOp && this.lastNumberUsed != null) {
      const expr = [this.previousResult.toString(), this.lastUsedOp, this.lastNumberUsed.toString()];
      try {
        const result = calculatePostfix(convertToPostfix(expr));
        this.inputValue = formatResult(result);
        this.previousResult = result;
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
    } else if (this.shownFormula) {
      const removed = this.shownFormula.slice(-1);
      this.shownFormula = this.shownFormula.slice(0, -1);
      this.formula.pop();

      if (["+", "-", "×", "÷"].includes(removed)) {
        this.lastWasOperator = true;
        this.replaceNext = true;
        this.inputValue = "0";
      }

      /* After removing the operator, recover the preceding number from the formula string */
      const match = this.shownFormula.match(/([-]?\d*\.?\d+)$/);
      if (match) {
        this.inputValue = match[0];
        this.shownFormula = this.shownFormula.slice(0, -this.inputValue.length);
        this.formula.pop();
        this.inputValue = removeLeadingZeros(this.inputValue);
        this.lastWasOperator = false;
        this.replaceNext = false;
      } else {
        this.inputValue = "0";
        this.replaceNext = true;
      }
    } else {
      this.inputValue = "0";
      this.replaceNext = true;
    }

    return { value: this.inputValue, formula: this.shownFormula };
  }

  /* Central dispatcher — routes every action string or digit to the right method */
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
      if (this.showingResult && this.lastUsedOp && this.lastNumberUsed != null) {
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

/* --- Browser UI --- */
if (typeof document !== 'undefined' && document.getElementById('current-number')) {
  let hideWarningTimer;

  function displayError(message) {
    clearTimeout(hideWarningTimer);
    const errorBox = document.getElementById("error-msg");
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = "block";
    /* Auto-hide after 2 seconds so it doesn't linger */
    hideWarningTimer = setTimeout(() => {
      errorBox.style.display = "none";
    }, 2000);
  }

  /* Shrinks font size one pixel at a time until the text fits, down to a minimum of 10px */
  function fitTextToScreen(element, text) {
    element.style.fontSize = "var(--base-font-size)";
    element.textContent = text;
    let size = parseFloat(getComputedStyle(element).fontSize);
    const maxW = element.clientWidth;
    while (element.scrollWidth > maxW && size > 10) {
      size -= 1;
      element.style.fontSize = size + "px";
    }
  }

  function updateScreen(calc) {
    const mainScreen = document.getElementById("current-number");
    const historyScreen = document.getElementById("history-line");
    historyScreen.textContent = calc.shownFormula;
    fitTextToScreen(mainScreen, calc.inputValue);
  }

  const calculator = new Calculator();

  /* Exposed on window so the HTML onclick attributes can reach it */
  window.handleInput = function(action) {
    const mainScreen = document.getElementById("current-number");
    if (mainScreen.textContent === "Error") calculator.reset();

    const result = calculator.handleInput(action);

    if (result.error) {
      if (result.error && result.error.startsWith("Max ") && result.error.endsWith(" digits")) {
        displayError(result.error);
      } else if (result.error === "Invalid input for square root" || result.error === "Math error") {
        mainScreen.textContent = "Error";
        document.getElementById("history-line").textContent = "";
        calculator.reset();
        return;
      }
    }

    updateScreen(calculator);
  };

  window.removeLastChar = function() {
    const mainScreen = document.getElementById("current-number");
    if (mainScreen.textContent === "Error") {
      calculator.reset();
      updateScreen(calculator);
      return;
    }
    calculator.backspace();
    updateScreen(calculator);
  };

  window.clearAll = function() {
    calculator.reset();
    updateScreen(calculator);
  };

  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (/[0-9]/.test(key))              handleInput(parseInt(key));
    else if (key === "+")               handleInput("add");
    else if (key === "-")               handleInput("subtract");
    else if (key === "*" || /[xX]/.test(key)) handleInput("multiply");
    else if (key === "/")               handleInput("divide");
    else if (key === "%")               handleInput("percent");
    else if (key === ".")               handleInput("decimal");
    else if (key === "Enter" || key === "=") { e.preventDefault(); handleInput("equals"); }
    else if (key === "Escape")          clearAll();
    else if (key === "Backspace")       { e.preventDefault(); removeLastChar(); }
  });

  calculator.reset();
  updateScreen(calculator);
}