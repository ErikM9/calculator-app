describe('Calculator', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load', () => {

    it('displays the calculator', () => {
      cy.get('#calc-body').should('be.visible');
    });

    it('shows title', () => {
      cy.get('h1').should('contain', 'A Simple Calculator');
    });

    it('displays initial zero', () => {
      cy.getDisplay().should('have.text', '0');
    });

    it('has all number buttons', () => {
      for (let i = 0; i <= 9; i++) {
        cy.get(`#num-${i}`).should('be.visible');
      }
    });

    it('has all operator buttons', () => {
      cy.get('#add-btn').should('be.visible');
      cy.get('#subtract-btn').should('be.visible');
      cy.get('#multiply-btn').should('be.visible');
      cy.get('#divide-btn').should('be.visible');
    });

    it('has special function buttons', () => {
      cy.get('#equals-btn').should('be.visible');
      cy.get('#decimal-btn').should('be.visible');
      cy.get('#delete-last').should('be.visible');
      cy.get('#reset-all').should('be.visible');
      cy.get('#power-two').should('be.visible');
      cy.get('#square-root').should('be.visible');
      cy.get('#percent-btn').should('be.visible');
      cy.get('#sign-toggle').should('be.visible');
    });

  });

  describe('Basic Input', () => {

    it('displays single digit', () => {
      cy.get('#num-5').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('displays multi-digit number', () => {
      cy.get('#num-1').click();
      cy.get('#num-2').click();
      cy.get('#num-3').click();
      cy.getDisplay().should('have.text', '123');
    });

    it('displays decimal number', () => {
      cy.get('#num-3').click();
      cy.get('#decimal-btn').click();
      cy.get('#num-1').click();
      cy.get('#num-4').click();
      cy.getDisplay().should('have.text', '3.14');
    });

    it('prevents multiple decimals', () => {
      cy.get('#num-3').click();
      cy.get('#decimal-btn').click();
      cy.get('#num-1').click();
      cy.get('#decimal-btn').click();
      cy.get('#num-4').click();
      cy.getDisplay().should('have.text', '3.14');
    });

    it('handles leading zeros', () => {
      cy.get('#num-0').click();
      cy.get('#num-0').click();
      cy.get('#num-5').click();
      cy.getDisplay().should('have.text', '5');
    });

  });

  describe('Basic Operations', () => {

    it('adds two numbers', () => {
      cy.calculate('2+3=');
      cy.getDisplay().should('have.text', '5');
    });

    it('subtracts two numbers', () => {
      cy.calculate('7-4=');
      cy.getDisplay().should('have.text', '3');
    });

    it('multiplies two numbers', () => {
      cy.calculate('6*7=');
      cy.getDisplay().should('have.text', '42');
    });

    it('divides two numbers', () => {
      cy.get('#num-2').click();
      cy.get('#num-0').click();
      cy.get('#divide-btn').click();
      cy.get('#num-4').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('shows history line during operation', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.getHistory().should('contain', '5+');
    });

    it('clears history after calculation', () => {
      cy.calculate('2+3=');
      cy.getHistory().should('have.text', '');
    });

  });

  describe('Operator Precedence', () => {

    it('respects multiplication over addition', () => {
      cy.calculate('2+3*4=');
      cy.getDisplay().should('have.text', '14');
    });

    it('respects division over subtraction', () => {
      cy.get('#num-1').click();
      cy.get('#num-0').click();
      cy.get('#subtract-btn').click();
      cy.get('#num-6').click();
      cy.get('#divide-btn').click();
      cy.get('#num-2').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '7');
    });

    it('handles complex expression', () => {
      cy.get('#num-1').click();
      cy.get('#num-0').click();
      cy.get('#add-btn').click();
      cy.get('#num-5').click();
      cy.get('#multiply-btn').click();
      cy.get('#num-2').click();
      cy.get('#subtract-btn').click();
      cy.get('#num-3').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '17');
    });

  });

  describe('Chained Operations', () => {

    it('chains multiple additions', () => {
      cy.calculate('1+2+3+4=');
      cy.getDisplay().should('have.text', '10');
    });

    it('chains mixed operations', () => {
      cy.get('#num-1').click();
      cy.get('#num-0').click();
      cy.get('#subtract-btn').click();
      cy.get('#num-3').click();
      cy.get('#subtract-btn').click();
      cy.get('#num-2').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('allows operator replacement', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.get('#subtract-btn').click();
      cy.get('#num-3').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '2');
    });

  });

  describe('Special Functions', () => {

    it('squares a number', () => {
      cy.get('#num-5').click();
      cy.get('#power-two').click();
      cy.getDisplay().should('have.text', '25');
    });

    it('calculates square root', () => {
      cy.get('#num-9').click();
      cy.get('#square-root').click();
      cy.getDisplay().should('have.text', '3');
    });

    it('calculates percent', () => {
      cy.get('#num-5').click();
      cy.get('#num-0').click();
      cy.get('#percent-btn').click();
      cy.getDisplay().should('have.text', '0.5');
    });

    it('calculates percent of small number', () => {
      cy.get('#num-1').click();
      cy.get('#percent-btn').click();
      cy.getDisplay().should('have.text', '0.01');
    });

    it('toggles sign to negative', () => {
      cy.get('#num-5').click();
      cy.get('#sign-toggle').click();
      cy.getDisplay().should('have.text', '-5');
    });

    it('toggles sign back to positive', () => {
      cy.get('#num-5').click();
      cy.get('#sign-toggle').click();
      cy.get('#sign-toggle').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('calculates with negative numbers', () => {
      cy.get('#num-5').click();
      cy.get('#sign-toggle').click();
      cy.get('#add-btn').click();
      cy.get('#num-3').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '-2');
    });

  });

  describe('Clear and Backspace', () => {

    it('AC clears everything', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.get('#num-3').click();
      cy.get('#reset-all').click();
      cy.getDisplay().should('have.text', '0');
      cy.getHistory().should('have.text', '');
    });

    it('backspace removes last digit', () => {
      cy.get('#num-1').click();
      cy.get('#num-2').click();
      cy.get('#num-3').click();
      cy.get('#delete-last').click();
      cy.getDisplay().should('have.text', '12');
    });

    it('backspace returns to zero', () => {
      cy.get('#num-5').click();
      cy.get('#delete-last').click();
      cy.getDisplay().should('have.text', '0');
    });

    it('backspace removes operator from history', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.get('#delete-last').click();
      cy.getDisplay().should('have.text', '5');
    });

  });

  describe('Repeat Calculation', () => {

    it('repeats last operation on equals', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.get('#num-3').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '8');
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '11');
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '14');
    });

  });

  describe('Error Handling', () => {

    it('shows error for division by zero', () => {
      cy.get('#num-5').click();
      cy.get('#divide-btn').click();
      cy.get('#num-0').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', 'Error');
    });

    it('shows error for negative square root', () => {
      cy.get('#num-4').click();
      cy.get('#sign-toggle').click();
      cy.get('#square-root').click();
      cy.getDisplay().should('have.text', 'Error');
    });

    it('clears error on next input', () => {
      cy.get('#num-5').click();
      cy.get('#divide-btn').click();
      cy.get('#num-0').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', 'Error');
      cy.get('#num-5').click();
      cy.getDisplay().should('have.text', '5');
    });

  });

  describe('Keyboard Support', () => {

    it('accepts number keys', () => {
      cy.get('body').type('123');
      cy.getDisplay().should('have.text', '123');
    });

    it('accepts operator keys', () => {
      cy.get('body').type('5+3');
      cy.getHistory().should('contain', '5+');
    });

    it('accepts Enter for equals', () => {
      cy.get('body').type('2+3{enter}');
      cy.getDisplay().should('have.text', '5');
    });

    it('accepts Escape for clear', () => {
      cy.get('body').type('123{esc}');
      cy.getDisplay().should('have.text', '0');
    });

    it('accepts Backspace', () => {
      cy.get('body').type('123{backspace}');
      cy.getDisplay().should('have.text', '12');
    });

    it('accepts decimal point', () => {
      cy.get('body').type('3.14');
      cy.getDisplay().should('have.text', '3.14');
    });

    it('accepts * for multiply', () => {
      cy.get('body').type('6*7{enter}');
      cy.getDisplay().should('have.text', '42');
    });

    it('accepts / for divide', () => {
      cy.get('body').type('20/4{enter}');
      cy.getDisplay().should('have.text', '5');
    });

    it('accepts % for percent', () => {
      cy.get('body').type('50%');
      cy.getDisplay().should('have.text', '0.5');
    });

  });

  describe('Decimal Operations', () => {

    it('adds decimals correctly', () => {
      cy.get('body').type('0.1+0.2{enter}');
      cy.getDisplay().should('have.text', '0.3');
    });

    it('multiplies decimals correctly', () => {
      cy.get('body').type('2.5*4{enter}');
      cy.getDisplay().should('have.text', '10');
    });

    it('handles leading decimal', () => {
      cy.get('#decimal-btn').click();
      cy.get('#num-5').click();
      cy.getDisplay().should('have.text', '0.5');
    });

  });

  describe('Calculation Continuation', () => {

    it('continues calculation after result', () => {
      cy.calculate('2+3=');
      cy.get('#multiply-btn').click();
      cy.get('#num-4').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '20');
    });

    it('starts new calculation after result', () => {
      cy.calculate('2+3=');
      cy.get('#num-7').click();
      cy.getDisplay().should('have.text', '7');
    });

  });

  describe('Edge Cases', () => {

    it('handles operation with only one number', () => {
      cy.get('#num-5').click();
      cy.get('#add-btn').click();
      cy.get('#equals-btn').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('handles multiple zeros', () => {
      cy.get('#num-0').click();
      cy.get('#num-0').click();
      cy.get('#num-0').click();
      cy.getDisplay().should('have.text', '0');
    });

    it('handles very small decimals', () => {
      cy.get('body').type('1/1000{enter}');
      cy.getDisplay().should('contain', '0.001');
    });

  });

  describe('Visual Elements', () => {

    it('displays math examples in background', () => {
      cy.get('.math-example').should('have.length', 10);
    });

    it('has animated border', () => {
      cy.get('#bg-border').should('have.class', 'border-animation');
    });

  });

  describe('Accessibility', () => {

    it('number buttons have visible text labels', () => {
      for (let i = 0; i <= 9; i++) {
        cy.get(`#num-${i}`).should('contain.text', String(i));
      }
    });

    it('operator buttons have aria-labels or visible text', () => {
      cy.get('#reset-all').should('have.attr', 'aria-label', 'Clear');
      cy.get('#delete-last').should('have.attr', 'aria-label', 'Backspace');
      cy.get('#percent-btn').should('have.attr', 'aria-label', 'Percent');
      cy.get('#power-two').should('have.attr', 'aria-label', 'Square');
      cy.get('#square-root').should('have.attr', 'aria-label', 'Square Root');
      cy.get('#sign-toggle').should('have.attr', 'aria-label', 'Toggle sign');
    });

    it('page has a single h1 heading', () => {
      cy.get('h1').should('have.length', 1);
    });

    it('display is reachable and readable', () => {
      cy.get('#current-number').should('be.visible').and('not.be.empty');
    });

  });

  describe('Responsive Design', () => {

    it('displays correctly on small screen', () => {
      cy.viewport(320, 568);
      cy.get('#calc-body').should('be.visible');
      cy.get('#num-5').click();
      cy.getDisplay().should('have.text', '5');
    });

    it('displays correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.get('#calc-body').should('be.visible');
    });

  });

});