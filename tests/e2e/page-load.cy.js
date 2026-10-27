import { KEY_IDS } from './support/scenarios.js';

describe('Page load', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the calculator under its heading', () => {
    cy.title().should('eq', 'A Simple Calculator');
    cy.get('h1').should('have.text', 'A Simple Calculator');
    cy.get('#calc-body').should('be.visible');
  });

  it('starts at 0 with an empty history line', () => {
    cy.getDisplay().should('have.text', '0');
    cy.getHistory().should('have.text', '');
  });

  it('shows every key with its label', () => {
    Object.entries(KEY_IDS)
      .filter(([label]) => !['*', '/'].includes(label))
      .forEach(([label, id]) => {
        cy.get(`#${id}`).should('be.visible').and('have.text', label);
      });
  });
});