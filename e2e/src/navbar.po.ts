import { browser, by, element, protractor } from 'protractor';
import { ANIM_WAIT, getFirstDisplayed, navbarAction, openSubTab, openTab, wait4Spinner } from './test-helper';
import { FILE_PATH } from './../conf'
export class NavbarPage {

  async getSampleData() {
    await navbarAction('Data', 'Sample Data');
    await wait4Spinner();
    return browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
  }

  getButtons() {
    return element.all(by.css('button.dropdown-toggle'));
  }

  async saveAsJson() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    await navbarAction('File', 'Save');
    await browser.sleep(ANIM_WAIT);
    return hasVisibleNodesAndEdges;
  }

  async saveSelectedAsJson() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    await element(by.buttonText('File')).click();
    await browser.executeScript('cy.$().select()');
    await element(by.buttonText('Save Selected Objects')).click();
    await browser.sleep(ANIM_WAIT);
    return hasVisibleNodesAndEdges;
  }

  async saveAsPNG() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    await this.click2SaveAsPng(1);
    await browser.executeScript('cy.zoom(3)');
    await this.click2SaveAsPng(2);
    return hasVisibleNodesAndEdges;
  }

  async saveUserProfile() {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          await navbarAction('File', 'Save User Profile...')
          await browser.sleep(ANIM_WAIT);
          await this.click2saveUserProfile(i == 0, j == 0, k == 0);
        }
      }
    }
    return true;
  }

  async addRemoveGroupsManually() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    await browser.executeScript('cy.$().select()');
    await navbarAction('Edit', 'Add Group for Selected');

    const has1Group = await browser.executeScript('return cy.$(":parent").length == 1');
    await browser.executeScript('cy.$().unselect()');
    await browser.executeScript('cy.$(":parent").select()');
    await navbarAction('Edit', 'Remove Group for Selected');
    await wait4Spinner();
    const hasNoGroup = await browser.executeScript('return cy.$(":parent").length == 0');

    await openTab('Map');
    await openSubTab('Group Nodes');
    getFirstDisplayed(by.cssContainingText('label', 'By the Louvain modularity algorithm')).click();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();
    const hasCompounds = await browser.executeScript(`return cy.$(':parent').length > 2;`);
    await navbarAction('Edit', 'Remove All Groups');
    const hasNoGroup2 = await browser.executeScript('return cy.$(":parent").length == 0');
    return hasCompounds && hasVisibleNodesAndEdges && has1Group && hasNoGroup && hasNoGroup2;
  }

  async deleteSelected() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    const cntBefore = await browser.executeScript('return cy.$().length') as number;
    await browser.executeScript('cy.$().slice(0, 10).select()');
    await navbarAction('Edit', 'Delete Selected');
    const cntAfter = await browser.executeScript('return cy.$().length') as number;
    const isDeleted = (cntBefore - cntAfter) >= 10;
    return hasVisibleNodesAndEdges && isDeleted;
  }

  async useHistory() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    const cntBefore = await browser.executeScript('return cy.$().length') as number;
    await openSubTab('Query by Rule');
    getFirstDisplayed(by.css('img[alt="Add Rule"]')).click();
    await browser.sleep(ANIM_WAIT);
    await element(by.buttonText('Condition')).click();
    await element(by.css('img[title="Add/Update"]')).click();
    // check graph
    element(by.css('input.cb-is-load-graph')).click();
    await browser.sleep(ANIM_WAIT);
    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    const cntAfter = await browser.executeScript('return cy.$().length') as number;
    const isLoaded = (cntAfter - cntBefore) >= 5;

    await navbarAction('Edit', 'Query History');
    await browser.sleep(1500); // history snap delay
    await getFirstDisplayed(by.cssContainingText('button.list-group-item.p-1', 'Get sample data')).click();
    const cntAfter3 = await browser.executeScript('return cy.$().length') as number;
    const isTurnBack2SampleDataState = cntAfter3 == cntBefore;
    await getFirstDisplayed(by.cssContainingText('button.list-group-item.p-1', 'Get Person')).click();
    const cntAfter4 = await browser.executeScript('return cy.$().length') as number;
    const isTurnBack2GetPersonSate = cntAfter4 == cntAfter;

    return hasVisibleNodesAndEdges && isLoaded && isTurnBack2SampleDataState && isTurnBack2GetPersonSate;
  }

  async hideShowElems() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    const cnt0 = await browser.executeScript('return cy.$(":visible").length') as number;
    await browser.executeScript('cy.$().slice(0, 10).select()');
    await navbarAction('View', 'Hide Selected');
    await wait4Spinner();
    const cnt1 = await browser.executeScript('return cy.$(":visible").length') as number;
    const isHideSelected = cnt1 < cnt0;

    await navbarAction('View', 'Show All');
    await browser.sleep(ANIM_WAIT);
    const cnt2 = await browser.executeScript('return cy.$(":visible").length') as number;
    // some collapsed edges might be expanded. So cnt2 can be greater.
    const isShowedAll = cnt2 >= cnt0;
    return hasVisibleNodesAndEdges && isHideSelected && isShowedAll;
  }

  async expandCollapseElems() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    await openSubTab('Group Nodes');
    getFirstDisplayed(by.cssContainingText('label', 'By the Louvain modularity algorithm')).click();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();
    const compoundCount = await browser.executeScript(`return cy.$(':parent').length`) as number;

    await navbarAction('View', 'Collapse All Nodes');
    await browser.sleep(ANIM_WAIT);
    const collapsedCount = await browser.executeScript(`return cy.$('.cy-expand-collapse-collapsed-node').length`);

    await navbarAction('View', 'Expand All Nodes');
    await browser.sleep(ANIM_WAIT);
    const compoundCount2 = await browser.executeScript(`return cy.$(':parent').length`) as number;
    const compoundEdgeCnt = await browser.executeScript(`return cy.$('.cy-expand-collapse-collapsed-edge').length`) as number;

    await navbarAction('View', 'Expand All Edges');
    await browser.sleep(ANIM_WAIT);
    const compoundEdgeCnt2 = await browser.executeScript(`return cy.$('.cy-expand-collapse-collapsed-edge').length`) as number;

    await navbarAction('View', 'Collapse All Edges');
    await browser.sleep(ANIM_WAIT);
    const compoundEdgeCnt3 = await browser.executeScript(`return cy.$('.cy-expand-collapse-collapsed-edge').length`) as number;

    const isCollapsedNodesProperly = compoundCount == collapsedCount;
    const isExpandedNodesProperly = compoundCount2 == compoundCount;
    const isCompoundEdgesExpanded = compoundEdgeCnt > 0 && compoundEdgeCnt2 == 0;
    const isCompoundEdgesMaintained = compoundEdgeCnt3 == compoundEdgeCnt;
    return hasVisibleNodesAndEdges && compoundCount > 2 && isCollapsedNodesProperly
      && isExpandedNodesProperly && isCompoundEdgesExpanded && isCompoundEdgesMaintained;
  }

  async highlightElems() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean;
    const js4ClassSum = `return cy.$().map(x => x.classes().length).reduce((s,x) => s+x, 0);`
    const sumClassCnt = await browser.executeScript(js4ClassSum) as number;
    await navbarAction('Highlight', 'Search...');
    const activeElemId = await (await browser.switchTo().activeElement()).getAttribute('id');
    const inpId = 'highlight-search-inp';
    const isFocusedRight = activeElemId == inpId;
    await element(by.id(inpId)).sendKeys('a');
    await browser.actions().sendKeys(protractor.Key.ENTER).perform();
    const sumClassCnt2 = await browser.executeScript(js4ClassSum) as number;
    // remove highlights
    await navbarAction('Highlight', 'Remove Highlights');
    const sumClassCnt3 = await browser.executeScript(js4ClassSum) as number;
    const isAddedClasses = sumClassCnt2 > sumClassCnt;
    const isRemovedClasses = sumClassCnt3 == sumClassCnt;
    // highlight selected
    await browser.executeScript(`cy.$()[0].select();`);
    await navbarAction('Highlight', 'Selected');
    const sumClassCnt4 = await browser.executeScript(js4ClassSum) as number;
    const isAddedAClass = sumClassCnt4 == sumClassCnt + 1;
    await navbarAction('Highlight', 'Remove Highlights');
    const sumClassCnt5 = await browser.executeScript(js4ClassSum) as number;
    const isRemovedClasses2 = sumClassCnt5 == sumClassCnt;
    // highlight neighbors of selected
    await browser.executeScript(`cy.$()[0].select();`);
    await navbarAction('Highlight', 'Neighbors of Selected');
    const sumClassCnt6 = await browser.executeScript(js4ClassSum) as number;
    const isAddedAClass2 = sumClassCnt6 >= sumClassCnt + 2;

    return hasVisibleNodesAndEdges && isFocusedRight && isAddedClasses && isRemovedClasses
      && isAddedAClass && isRemovedClasses2 && isAddedAClass2;
  }

  async showHelpModals() {
    await navbarAction('Help', 'Quick Help');
    await browser.sleep(ANIM_WAIT);
    await getFirstDisplayed(by.css('button.close')).click();

    await navbarAction('Help', 'About');
    await browser.sleep(ANIM_WAIT);
    await getFirstDisplayed(by.css('button.close')).click();
    return true;
  }

  async clearData() {
    const hasVisibleNodesAndEdges = await this.getSampleData() as boolean as boolean;
    await navbarAction('Data', 'Clear Data');
    const isClear = await browser.executeScript('return cy.$().length == 0') as boolean;
    return isClear && hasVisibleNodesAndEdges;
  }

  async loadGraphFromJsonFile() {
    await navbarAction('File', 'Load...');
    element.all(by.css('input[type="file"]')).get(1).sendKeys(FILE_PATH + 'visuall_sample_graph.json');
    await browser.sleep(ANIM_WAIT);
    const cntCollapsedNodes = await browser.executeScript(`return cy.$('.cy-expand-collapse-collapsed-node').length`) as number;
    const cntParentNodes = await browser.executeScript(`return cy.$(':parent').length`) as number;
    const cntClusterNodes = await browser.executeScript(`return cy.$('.Cluster').length`) as number;
    return cntCollapsedNodes == 3 && cntClusterNodes == 7 && cntParentNodes == 4;
  }

  async loadUserProfileFromJsonFile() {
    await navbarAction('File', 'Load User Profile...');
    element.all(by.css('input[type="file"]')).get(1).sendKeys(FILE_PATH + 'Visuall_User_Profile.vall');
    await browser.sleep(ANIM_WAIT);
    return true;
  }

  private async click2saveUserProfile(isSaveSettings: boolean, isSaveFilteringRules: boolean, isSaveTimebarMetrics: boolean) {
    if (!isSaveSettings) {
      element(by.id('save-profile-cb0')).click();
    }
    if (!isSaveFilteringRules) {
      element(by.id('save-profile-cb1')).click();
    }
    if (!isSaveTimebarMetrics) {
      element(by.id('save-profile-cb2')).click();
    }
    getFirstDisplayed(by.cssContainingText('button.btn.btn-primary.va-text', 'OK')).click();
    await browser.sleep(ANIM_WAIT);
  }

  private async click2SaveAsPng(btn: 1 | 2) {
    await navbarAction('File', 'Save as PNG...')
    await browser.sleep(ANIM_WAIT);
    let b = 'save-png-btn' + btn;
    element(by.id(b)).click();
    await browser.sleep(ANIM_WAIT);
  }
}
