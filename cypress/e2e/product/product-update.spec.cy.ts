describe('product update test', () => {
  it('visits the root', () => {
    cy.visit('/');
  });
  it('clicks the menu button products option', () => {
    cy.get('mat-icon').click();
    cy.contains('a', 'products').click();
  });
  it('selects Test Product', () => {
    cy.contains('99T99').click();
  });
  it('updates Cost Price', () => {
    cy.get('input[formcontrolname=costprice]').clear();
    cy.get('input[formcontrolname=costprice]').type('99.98');
  });
  it('clicks the save button', () => {
    cy.get('button').contains('Save').click();
  });
  it('confirms update', () => {
    cy.contains('updated!');
  });
});
