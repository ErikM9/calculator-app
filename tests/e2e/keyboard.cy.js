describe('Keyboard', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  [
    { name: 'types digits', typed: '123', display: '123' },
    { name: 'types a decimal', typed: '3.14', display: '3.14' },
    { name: 'works out an answer on Enter', typed: '2+3{enter}', display: '5' },
    { name: 'works out an answer on =', typed: '2+3=', display: '5' },
    { name: 'multiplies with *', typed: '6*7{enter}', display: '42' },
    { name: 'multiplies with x', typed: '6x7{enter}', display: '42' },
    { name: 'divides with /', typed: '20/4{enter}', display: '5' },
    { name: 'takes a percentage with %', typed: '50%', display: '0.5' },
    { name: 'clears on Escape', typed: '123{esc}', display: '0' },
    { name: 'deletes on Backspace', typed: '123{backspace}', display: '12' }
  ].forEach(({ name, typed, display }) => {
    it(`${name} (${typed})`, () => {
      cy.get('body').type(typed);

      cy.getDisplay().should('have.text', display);
    });
  });

  it('writes an operator to the history line', () => {
    cy.get('body').type('5+3');

    cy.getHistory().should('have.text', '5+');
  });

  it('ignores function keys, which contain digits of their own', () => {
    cy.get('body').type('5');
    cy.get('body').trigger('keydown', { key: 'F2' });

    cy.getDisplay().should('have.text', '5');
  });

  it('leaves browser shortcuts such as Ctrl+= to the browser', () => {
    cy.get('body').type('5+3');
    cy.get('body').trigger('keydown', { key: '=', ctrlKey: true });

    cy.getDisplay().should('have.text', '3');
    cy.getHistory().should('have.text', '5+');
  });

  it('leaves Enter on a focused key to that key', () => {
    cy.press('7+');
    cy.get('#num-2').focus().trigger('keydown', { key: 'Enter' });

    cy.getHistory().should('have.text', '7+');
  });
});