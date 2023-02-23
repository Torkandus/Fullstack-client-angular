describe('po generator test', () => {
  it('visits the root', () => {
    cy.visit('/');
  });
  it('clicks the menu button pos option', () => {
    cy.get('mat-icon').click();
    cy.contains('a', 'generator').click();
  });
  it('selects a vendor', () => {
    cy.wait(500);
    cy.get('mat-select[formcontrolname="vendorid"]').click();
    cy.contains('James').click();
  });
  it('selects a product', () => {
    cy.wait(500);
    cy.get('mat-select[formcontrolname="productid"]').click();
    cy.contains('Doohickey').click();
  });
  it('selects a wty', () => {
    cy.wait(500);
    cy.get('mat-select[formcontrolname="productqty"]').click();
    cy.contains('2').click();
  });
  it('clicks the add button', () => {
    cy.get('button').contains('Add PO').click();
  });
  it('confirms po added', () => {
    cy.contains('added!');
  });
});
