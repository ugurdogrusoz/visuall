import { browser, by } from 'protractor';
import { ANIM_WAIT, getFirstDisplayed, getSampleData, openSubTab } from './test-helper';

export class CalcTheoreticPropPage {

  async resizeBasedOnDegreeCentrality() {
    const hasVisibleNodesAndEdges = await getSampleData();
    await openSubTab('Calculate Theoretic Property');
    getFirstDisplayed(by.cssContainingText('option', 'Degree Centrality')).click();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await browser.sleep(ANIM_WAIT);
    const hasFredWid60 = await browser.executeScript(`return cy.$id('n0').width() == 60;`);
    const hasIngridWid60 = await browser.executeScript(`return cy.$id('n4').width() > 45;`);
    return hasVisibleNodesAndEdges && hasFredWid60 && hasIngridWid60;
  }

}
