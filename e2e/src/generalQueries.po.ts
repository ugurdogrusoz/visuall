import { browser, by, element } from 'protractor';
import { ANIM_WAIT, getFirstDisplayed, getSampleData, navbarAction, openTab, wait4Spinner } from './test-helper';

export class GeneralQueriesPage {

  async testNeighoodQuery() {
    const hasElems = await getSampleData();
    await openTab('Database');
    await element(by.cssContainingText('option', 'Get neighborhood')).click();
    await element(by.css('img[title="Select nodes to add"]')).click();
    await browser.executeScript('cy.nodes()[0].select();');
    await element(by.css('img[title="Complete selection"]')).click();
    await browser.sleep(ANIM_WAIT);
    await navbarAction('Data', 'Clear Data');
    await browser.sleep(ANIM_WAIT);
    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await browser.sleep(ANIM_WAIT * 2);
    await getFirstDisplayed(by.css('input.cb-table-all')).click();
    await getFirstDisplayed(by.css('img[title="Merge selected to graph"]')).click();
    await wait4Spinner();

    return hasElems && await browser.executeScript('return cy.nodes().length > 0') as boolean
  }
}
