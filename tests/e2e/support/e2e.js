import { KEY_IDS, toKeys } from './scenarios.js';

Cypress.Commands.add('getDisplay', () => cy.get('#current-number'));

Cypress.Commands.add('getHistory', () => cy.get('#history-line'));

/* Clicks the keypad for a sequence such as 12+3= or 4x²=, one key at a time */
Cypress.Commands.add('press', (sequence) => {
  toKeys(sequence).forEach((key) => {
    cy.get(`#${KEY_IDS[key]}`).click();
  });
});