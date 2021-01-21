import { browser, by, element } from 'protractor';
import { addPropertyRule, ANIM_WAIT, getFirstDisplayed, getSampleData, openSubTab } from './test-helper';

export class GroupNodesPage {

  async groupNodes() {
    const hasVisibleNodesAndEdges = await getSampleData();
    await openSubTab('Group Nodes');
    getFirstDisplayed(by.cssContainingText('label', 'By the Louvain modularity algorithm')).click();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();
    const hasCompounds = await browser.executeScript(`return cy.$(':parent').length > 0;`);
    return hasVisibleNodesAndEdges && hasCompounds;
  }

}
