import { SCREENS } from './support/scenarios.js';

describe('Responsive layout', () => {
  SCREENS.forEach(({ name, width, height }) => {
    it(`fits the keypad on a ${name} screen (${width}x${height})`, () => {
      cy.viewport(width, height);
      cy.visit('/');

      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth, 'page width').to.be.at.most(doc.documentElement.clientWidth);
      });
      cy.get('.keypad button').each(($key) => {
        expect($key[0].getBoundingClientRect().right, `${$key.attr('id')} right edge`).to.be.at.most(width);
      });
    });
  });

  it('still calculates on the smallest screen', () => {
    cy.viewport(320, 568);
    cy.visit('/');

    cy.press('12*3=');

    cy.getDisplay().should('have.text', '36');
  });
});