import { KEY_NAMES } from './support/scenarios.js';

describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('announces the screen through a status region', () => {
    cy.get('#screen-inner')
      .should('have.attr', 'role', 'status')
      .and('have.attr', 'aria-live', 'polite')
      .and('have.attr', 'aria-atomic', 'true');
  });

  it('raises warnings as alerts', () => {
    cy.get('#error-msg').should('have.attr', 'role', 'alert');
  });

  KEY_NAMES.forEach(([id, name]) => {
    it(`names the ${id} key "${name}"`, () => {
      cy.get(`#${id}`).should('have.attr', 'aria-label', name);
    });
  });

  it('has a single top-level heading', () => {
    cy.get('h1').should('have.length', 1);
  });
});