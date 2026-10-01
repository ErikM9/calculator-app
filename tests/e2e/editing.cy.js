import { EDITING } from './support/scenarios.js';

describe('Editing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  EDITING.forEach(({ name, keys, display, history }) => {
    it(`${name} (${keys})`, () => {
      cy.press(keys);

      cy.getDisplay().should('have.text', display);
      if (history !== undefined) cy.getHistory().should('have.text', history);
    });
  });

  it('warns about a sixteenth digit, then lets the warning go', () => {
    cy.press('1234567890123456');

    cy.getDisplay().should('have.text', '123456789012345');
    cy.get('#error-msg').should('be.visible').and('have.text', 'Max 15 digits');
    cy.get('#error-msg').should('not.be.visible');
  });
});