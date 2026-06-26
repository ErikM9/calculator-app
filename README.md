# A Simple Calculator

![CI](https://github.com/ErikM9/calculator-app/actions/workflows/ci.yml/badge.svg)

Calculator that handles operator precedence correctly using the shunting-yard algorithm.

## Run it

```bash
npm install
npm run serve
```

## Testing

Unit tests with Vitest, E2E tests with Cypress.

```bash
npm test                 # unit tests
npm run test:e2e         # e2e tests (needs npm run serve first)
npm run test:e2e:open    # interactive mode
```

### Why these tools?

- **Vitest** — Native ESM support, no config overhead. Faster startup than Jest, which matters when the suite runs on every save during development.
- **Cypress** — Custom commands (`calculate`, `getDisplay`, `getHistory`) in `e2e.js` make multi-step calculator sequences very concise. The interactive runner (`test:e2e:open`) is also useful for stepping through failing UI tests.

### What's tested

**Unit (73 tests)**
- Constants and operator definitions
- String helpers (shortenIfTooLong, removeLeadingZeros, formatResult)
- Shunting-yard conversion (infix → postfix)
- Postfix evaluation
- Individual math operations
- Sign toggle
- Calculator class (number entry, operators, calculate, repeat, square/sqrt/percent, backspace, reset, handleInput dispatch, edge cases)

**E2E (63 specs)**
- Page load and button presence
- Basic input and leading zero handling
- Basic operations (add, subtract, multiply, divide)
- Operator precedence
- Chained operations and operator replacement
- Special functions (square, sqrt, percent, sign toggle)
- Clear and backspace
- Repeat calculation
- Error handling (division by zero, negative sqrt)
- Keyboard support
- Decimal operations and floating-point correctness
- Calculation continuation after result
- Accessibility (aria-labels, heading hierarchy, display readability)
- Visual elements
- Responsive design

## CI

GitHub Actions runs both test suites on push.