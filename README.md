# A Simple Calculator

![CI](https://github.com/ErikM9/calculator-app/actions/workflows/ci.yml/badge.svg)

A calculator which gets operator precedence right by using the shunting-yard algorithm. It works with both the on-screen keys and the keyboard.

**Live demo:** [erikm9.github.io/calculator-app](https://erikm9.github.io/calculator-app/)

## Run it

```bash
npm install
npm run serve
```

Then open http://localhost:3000.

## Testing

I used Vitest for the unit tests and Cypress for the end-to-end tests.

```bash
npm test                 # unit tests
npm run test:coverage    # unit tests with coverage (fails below 90%)
npm run test:e2e         # e2e tests (run npm run serve in another terminal first)
npm run test:e2e:open    # e2e tests in the interactive Cypress runner
```

### Why these tools?

My smaller projects each use a different set of testing tools, because I chose them so I could learn how various testing tools work. For the calculator I went with Vitest, jsdom and Cypress.

- Vitest supports ES modules natively, needs barely any configuration, has `it.each` for the tables of rules and a watch mode for working on the code, and its V8 coverage fails the run when coverage drops below 90%.
- jsdom loads the real page markup, a fresh copy for every test, so the keypad, the keyboard handling, the warnings and the accessibility attributes are unit tested as well.
- Cypress waits for elements and retries its assertions by itself, `cy.viewport` switches the screen size for the layout tests, and it lets me add commands of my own (`press`, `getDisplay`, `getHistory`), so a test with a long key sequence still fits on one line. Its interactive runner is also useful for stepping through a failing test.

### Scenario tables

Most of the e2e tests are rows of a table in `tests/e2e/support/scenarios.js`: a key sequence such as `2+3=4x²=` and the display it should end on. Adding a new case only takes one line.

### What's tested

**Unit (237 tests, 98% of statements)**
- Number formatting, including fifteen-digit answers, longer ones in exponent form and tiny results
- Shunting-yard conversion, precedence and left-to-right evaluation
- The `Calculator` class: entering numbers, the digit cap, operators, equals, repeating equals after x², √ and %, answers carried on at full precision, backspace and errors
- Key mapping: digits, operators, the F keys which are ignored and the browser shortcuts which are left alone
- The page itself: the keypad, errors and the digit warning, shrinking a long number to fit the screen, the keyboard, accessibility attributes and the background equations

**End-to-end (91 tests)**
- Arithmetic, functions, editing and errors from the scenario tables
- Keyboard input, including the F keys, Ctrl shortcuts and Enter after a mouse click
- Accessibility: the status region, alerts and the names screen readers get for the keys
- Responsive layout from 320px upwards

## CI

GitHub Actions runs the unit tests with coverage and the e2e suite at desktop and mobile sizes on every push and pull request to `main`. A push to `main` which passes them is then deployed to GitHub Pages, straight from `src/`.