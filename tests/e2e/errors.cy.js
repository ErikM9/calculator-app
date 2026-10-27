import { ERRORS } from './support/scenarios.js';

describe('Errors', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  ERRORS.forEach(({ name, keys, display, history }) => {
    it(`${name} (${keys})`, () => {
      cy.press(keys);

      cy.getDisplay().should('have.text', display);
      if (history !== undefined) cy.getHistory().should('have.text', history);
    });
  });
});