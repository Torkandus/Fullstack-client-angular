describe('expense delete test', () => {
  it('visits the root', () => {
    cy.visit('/');
  });
  it('clicks the menu button products option', () => {
    cy.get('mat-icon').click();
    cy.contains('a', 'products').click();
  });
  it('selects Test expense', () => {
    cy.contains('99T99').click();
  });
  it('clicks the delete button', () => {
    cy.get('button').contains('Delete').click();
  });
  it("clicks the dialog's Yes button", () => {
    cy.get('button').contains('Yes').click();
  });
  it('confirms delete', () => {
    cy.contains('deleted!');
  });
});
