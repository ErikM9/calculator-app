Cypress.Commands.add('getDisplay', () => {
  return cy.get('#current-number');
});

Cypress.Commands.add('getHistory', () => {
  return cy.get('#history-line');
});

Cypress.Commands.add('calculate', (expression) => {
  for (const char of expression) {
    if (/[0-9]/.test(char)) {
      cy.get(`#num-${char}`).click();
    } else if (char === '+') {
      cy.get('#add-btn').click();
    } else if (char === '-') {
      cy.get('#subtract-btn').click();
    } else if (char === '*' || char === '×') {
      cy.get('#multiply-btn').click();
    } else if (char === '/' || char === '÷') {
      cy.get('#divide-btn').click();
    } else if (char === '.') {
      cy.get('#decimal-btn').click();
    } else if (char === '=') {
      cy.get('#equals-btn').click();
    }
  }
});