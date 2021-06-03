import { open, navbarAction, openSubTab, openTab, groupBy } from '../helper';

context('Navbar buttons', () => {

  beforeEach(open);

  /**
   * @param  {boolean} isSaveSettings
   * @param  {boolean} isSaveFilteringRules
   * @param  {boolean} isSaveTimebarMetrics
   */
  function click2saveUserProfile(isSaveSettings, isSaveFilteringRules, isSaveTimebarMetrics) {
    if (!isSaveSettings) {
      cy.get('#save-profile-cb0').click();
    }
    if (!isSaveFilteringRules) {
      cy.get('#save-profile-cb1').click();
    }
    if (!isSaveTimebarMetrics) {
      cy.get('#save-profile-cb2').click();
    }
    cy.get('button.btn.btn-primary.va-text').contains('OK').click();
  }

  it('TC1: should have at least 7 buttons on navbar', () => {
    cy.get('button.dropdown-toggle').its('length').should('eq', 7);
  });

  it('TC2: Can save as JSON and PNG', () => {
    navbarAction('Data', 'Sample Data');
    navbarAction('File', 'Save');

    cy.window().then((win) => {
      win.cy.$().select();
      navbarAction('File', 'Save Selected Objects');

      navbarAction('File', 'Save as PNG...');
      cy.get('button#save-png-btn1').click();
      navbarAction('File', 'Save as PNG...');
      win.cy.zoom(3);
      cy.get('button#save-png-btn2').click();
    });
  });

  it('TC3: Can save user profile', () => {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          navbarAction('File', 'Save User Profile...');
          click2saveUserProfile(i == 0, j == 0, k == 0);
        }
      }
    }
  });

  it('TC4: Can add/remove group manually, delete selected, use history to go back and forth', () => {
    navbarAction('Data', 'Sample Data');

    cy.window().then((win) => {
      win.cy.$().select();
    });

    navbarAction('Edit', 'Add Group for Selected');
    cy.window().then((win) => {
      expect(win.cy.$(':parent').length).to.eq(1);
      win.cy.$().unselect();
      win.cy.$(':parent').select();
    });
    navbarAction('Edit', 'Remove Group for Selected');
    cy.window().then((win) => {
      expect(win.cy.$(':parent').length).to.eq(0);
    });
    openTab('Map');
    openSubTab('Group Nodes');
    groupBy('By the Louvain modularity algorithm', true);
    cy.window().then((win) => {
      expect(win.cy.$(':parent').length > 2).to.eq(true);
    });
    navbarAction('Edit', 'Remove All Groups');

    cy.window().then((win) => {
      expect(win.cy.$(':parent').length == 0).to.eq(true);
    });

    // delete selected
    let cntBefore = -1;
    cy.window().then((win) => {
      cntBefore = win.cy.$().length;
      win.cy.$().slice(0, 10).select();
    });
    navbarAction('Edit', 'Delete Selected');
    cy.window().then((win) => {
      const cntAfter = win.cy.$().length;
      expect(cntAfter <= cntBefore + 10).to.eq(true);
    });
  });

  it('TC5: Use history to go back and forth', () => {
    navbarAction('Data', 'Sample Data');
    let cnt0 = 0;
    openSubTab('Query by Rule');
    cy.window().then((win) => {
      cnt0 = win.cy.$().length;
    });
    cy.get('img[alt="Add Rule"]:visible').click();
    cy.get('button').contains('Condition').click();
    cy.get('img[title="Add/Update"]:visible').click();
    cy.get('input.cb-is-load-graph').check();
    cy.get('input[value="Execute"]:visible').click();
    cy.wait(3000);
    let cnt1 = -1;
    cy.window().then((win) => {
      cnt1 = win.cy.$().length;
      expect(cnt1 - cnt0 >= 5).to.eq(true);
    });

    navbarAction('Edit', 'Query History');
    cy.get('button.list-group-item').eq(0).click();
    let cnt2 = -1;
    cy.window().then((win) => {
      cnt2 = win.cy.$().length;
      expect(cnt2 == cnt0).to.eq(true);
    });

    cy.get('button.list-group-item').eq(1).click();
    let cnt3 = -1;
    cy.window().then((win) => {
      cnt3 = win.cy.$().length;
      expect(cnt3 == cnt1).to.eq(true);
    });
  });

  it('TC6: Hide and/or show elements', () => {
    navbarAction('Data', 'Sample Data');
    let cnt0 = 0;
    cy.window().then((win) => {
      cnt0 = win.cy.$(':visible').length;
      win.cy.$().slice(0, 10).select();
    });

    navbarAction('View', 'Hide Selected');
    cy.window().then((win) => {
      const cnt1 = win.cy.$(':visible').length;
      expect(cnt1 < cnt0).to.eq(true);
    });

    navbarAction('View', 'Show All');
    let cnt2 = 0;
    cy.window().then((win) => {
      cnt2 = win.cy.$(':visible').length;
      // some collapsed edges might be expanded. So cnt2 can be greater.
      expect(cnt2 >= cnt0).to.eq(true);
    });
  });

  it('TC7: Expand/collapse nodes and edges', () => {
    navbarAction('Data', 'Sample Data');
    openSubTab('Group Nodes');
    groupBy('By the Louvain modularity algorithm', true);
    let compoundCount = -1;
    cy.window().then((win) => {
      compoundCount = win.cy.$(':parent').length;
      expect(compoundCount > 2).to.eq(true);
    });

    navbarAction('View', 'Collapse All Nodes');
    cy.window().then((win) => {
      const collapsedCount = win.cy.$('.cy-expand-collapse-collapsed-node').length;
      expect(collapsedCount == compoundCount).to.eq(true);
    });

    navbarAction('View', 'Expand All Nodes');
    let compoundEdgeCnt = -1;
    cy.window().then((win) => {
      const compoundCount2 = win.cy.$(':parent').length;
      expect(compoundCount2 == compoundCount).to.eq(true);
      compoundEdgeCnt = win.cy.$('.cy-expand-collapse-collapsed-edge').length;
      expect(compoundEdgeCnt > 0).to.eq(true);
    });

    navbarAction('View', 'Expand All Edges');
    cy.window().then((win) => {
      const compoundEdgeCnt2 = win.cy.$('.cy-expand-collapse-collapsed-edge').length;
      expect(compoundEdgeCnt2 == 0).to.eq(true);
    });

    navbarAction('View', 'Collapse All Edges');
    cy.window().then((win) => {
      const compoundEdgeCnt3 = win.cy.$('.cy-expand-collapse-collapsed-edge').length;
      expect(compoundEdgeCnt == compoundEdgeCnt3).to.eq(true);
    });
  });

  it('TC8: Can highlight by seleting or searching', () => {
    navbarAction('Data', 'Sample Data');

    let sumClassCnt = -1;
    cy.window().then((win) => {
      sumClassCnt = win.cy.$().map(x => x.classes().length).reduce((s, x) => s + x, 0);
    });

    navbarAction('Highlight', 'Search...');
    const inpId = 'highlight-search-inp';
    cy.focused().should('have.attr', 'id').and('equal', inpId);

    cy.get('#' + inpId).type('a');
    cy.get('body').type('{enter}');

    cy.window().then((win) => {
      const sumClassCnt2 = win.cy.$().map(x => x.classes().length).reduce((s, x) => s + x, 0);
      expect(sumClassCnt2 > sumClassCnt).to.eq(true);
    });
  });

});