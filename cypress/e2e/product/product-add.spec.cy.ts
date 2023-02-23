describe('product add test', () => {
  it('visits the root', () => {
    cy.visit('/');
  });
  it('clicks the menu button products option', () => {
    cy.get('mat-icon').click();
    cy.contains('a', 'products').click();
  });
  it('clicks add icon', () => {
    cy.contains('control_point').click();
  });
  it('fills in fields', () => {
    cy.get('input[formcontrolname=id]').type('99T99');
    cy.get('mat-select[formcontrolname="vendorid"]').click(); // open the list
    cy.get('mat-option').should('have.length.gt', 0); // wait for options
    cy.contains('ABC').click();
    cy.get('input[formcontrolname=name]').type('Test');
    cy.get('input[formcontrolname=costprice]').type('99.99');
    cy.get('input[formcontrolname=msrp]').type('129.99');
  });
  it('clicks the save button', () => {
    cy.get('button').contains('Save').click();
  });
  it('confirms add', () => {
    cy.contains('added!');
  });
});
