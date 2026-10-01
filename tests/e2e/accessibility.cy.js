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

  it('starts the names of AC and x² with what is printed on them, for voice control', () => {
    cy.get('#reset-all').invoke('attr', 'aria-label').should('match', /^AC/);
    cy.get('#power-two').invoke('attr', 'aria-label').should('match', /^x/);
  });

  it('has a single top-level heading', () => {
    cy.get('h1').should('have.length', 1);
  });

  it('wires the keys up without inline handlers', () => {
    cy.get('[onclick]').should('not.exist');
  });
});