# A Simple Calculator

![CI](https://github.com/ErikM9/calculator-app/actions/workflows/ci.yml/badge.svg)

Calculator that handles operator precedence correctly using the shunting-yard algorithm.

## Run it

```bash
npm install
npm run serve
```

Then open http://localhost:3000.

## Testing

Unit tests with Vitest, end-to-end tests with Cypress.

```bash
npm test                 # unit tests
npm run test:coverage    # unit tests with coverage (fails below 90%)
npm run test:e2e         # e2e tests (start npm run serve in another terminal first)
npm run test:e2e:open    # interactive mode
```

### Why these tools?

- **Vitest** — Native ESM support, no config overhead, and `it.each` for the rule tables. Faster startup than Jest, which matters when the suite runs on every save.
- **jsdom** — Loads the real page markup, so the keypad, keyboard handling, warnings and accessibility attributes are unit tested too.
- **Cypress** — Custom commands (`press`, `getDisplay`, `getHistory`) keep multi-step sequences short, and the interactive runner (`test:e2e:open`) is useful for stepping through a failing test.

### Shared scenarios

Most e2e specs are tables in `tests/e2e/support/scenarios.js`: a key sequence such as `2+3=4x²=` and the display it should end on. Adding a case is one line, and the same table can be replayed by any other tool.

### What's tested

**Unit (198 tests, 95% of statements)**
- Number formatting, including fifteen-digit answers and tiny results
- Shunting-yard conversion, precedence and left-to-right evaluation
- The `Calculator` class: entry, the digit cap, operators, equals, repeat-equals after x², √ and %, backspace, errors
- Key mapping: digits, operators, function keys and browser shortcuts left alone
- The page itself: keypad, errors and the digit warning, keyboard, and accessibility attributes

**E2E (80 specs)**
- Arithmetic, functions, editing and errors from the shared scenario tables
- Keyboard input, including function keys, Ctrl shortcuts and Enter on a focused key
- Accessibility: the status region, alerts, and a name for every key
- Responsive layout from 320px upwards

## CI

GitHub Actions runs the unit tests with coverage, and the e2e suite at desktop and mobile sizes, on every push and pull request.