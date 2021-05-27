export const URL = 'http://localhost:4200/';

export function open() {
  cy.visit(URL);
}

/** click to open dropdown menu and then click to the action button
 * @param  {string} dropdownBtn text shown on UI
 * @param  {string} actionBtn text shown on UI
 */
export function navbarAction(dropdownBtn, actionBtn) {
  cy.get('button.btn.btn-light.dropdown-toggle').contains(dropdownBtn).click();
  cy.get('button.dropdown-item').contains(actionBtn).click();

  cy.wait(3000);

  if (dropdownBtn == 'Data' && actionBtn == 'Sample Data') {
    cy.window().then((win) => {
      expect(win.cy.nodes().length > 0).to.eq(true);
    });
  }
  if (dropdownBtn == 'Data' && actionBtn == 'Clear Data') {
    cy.window().then((win) => {
      expect(win.cy.nodes().length == 0).to.eq(true);
    });
  }
}

/**
 * @param  {string} subTab text shown on UI
 */
export function openSubTab(subTab) {
  cy.get('b.va-heading2').contains(subTab).click();
}

/**
 * @param  {string} s text shown on UI
 */
export function openTab(s) {
  cy.get('a.nav-link').contains(s).click();
}

/** click to "Options" subheading
 */
export function click2options() {
  cy.get('span.va-heading3').contains('Options').click();
  cy.wait(250);
}