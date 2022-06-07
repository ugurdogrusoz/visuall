import { open, openTab, openSubTab, navbarAction, addPropertyRule } from '../helper';

context('Timebar', () => {

  beforeEach(open);

  it('TC1: Timebar metric as AND rule birth > 1994 && death < 2020', () => {
    openTab('Settings');
    // click to close 'General' settings
    // cy.wait(3000);
    openSubTab('General');
    // click to open 'Timebar' settings
    openSubTab('Timebar');
    cy.get('span.va-heading3').contains('Configure Statistics').click();
    cy.get('b.timebar-metric-name').contains('new').click();
    cy.get('select[title="Type"]').select('Person');

    cy.get('img[alt="Add Rule"]:visible').click();
    cy.get('button.dd-item.dropdown-item').contains('AND').click();
    addPropertyRule('birth_year', '≥', '1994');

    cy.get('img[title="Add"]:visible').click();
    cy.get('button.dd-item.dropdown-item').contains('Condition').click();
    addPropertyRule('death_year', '≤', '2020');

    cy.get('input[value="Add"]:visible').click();

  });

});