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
    element.all(by.css('input.form-check-input')).filter(x => x.isDisplayed()).get(0).click();
    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    return hasElems && await browser.executeScript('return cy.nodes().length > 0') as boolean
  }

  async testGoIQuery() {
    const hasElems = await getSampleData();
    await openTab('Database');
    await element(by.cssContainingText('option', 'Get graph of interest')).click();
    await element(by.css('img[title="Select nodes to add"]')).click();
    await browser.executeScript('cy.$id("n1").select();');
    await browser.executeScript('cy.$id("n4").select();');
    await element(by.css('img[title="Complete selection"]')).click();
    await browser.sleep(ANIM_WAIT);
    await navbarAction('Data', 'Clear Data');
    await browser.sleep(ANIM_WAIT);
    await this.click2options();
    await getFirstDisplayed(by.css('input.form-control.inp-3-char')).clear();
    await getFirstDisplayed(by.css('input.form-control.inp-3-char')).sendKeys(4);
    // unchech directed
    await getFirstDisplayed(by.css('input.form-check-input')).click();
    await this.click2options();
    element.all(by.css('input.form-check-input')).filter(x => x.isDisplayed()).get(0).click();
    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    const hasNodes = await browser.executeScript('return cy.nodes().length > 0') as boolean;
    const hasEdges = await browser.executeScript('return cy.edges().length > 0') as boolean;
    return hasElems && hasNodes && hasEdges;
  }

  async testCommonTargetRegulatorQuery() {
    const hasElems = await getSampleData();
    await openTab('Database');
    await element(by.cssContainingText('option', 'Get common targets/regulators')).click();
    await element(by.css('img[title="Select nodes to add"]')).click();
    await browser.executeScript('cy.$id("n1").select();');
    await browser.executeScript('cy.$id("n4").select();');
    await element(by.css('img[title="Complete selection"]')).click();
    await browser.sleep(ANIM_WAIT);
    await navbarAction('Data', 'Clear Data');
    await browser.sleep(ANIM_WAIT);
    await this.click2options();
    // unchech directed
    await getFirstDisplayed(by.css('input[type="checkbox"].form-check-input')).click();
    await this.click2options();
    await element.all(by.css('input[type="checkbox"].form-check-input')).filter(x => x.isDisplayed()).get(0).click();
    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    const hasNodes = await browser.executeScript('return cy.nodes().length > 0') as boolean;
    const hasEdges = await browser.executeScript('return cy.edges().length > 0') as boolean;
    return hasElems && hasNodes && hasEdges;
  }

  async click2options() {
    element(by.cssContainingText('span.va-heading3', 'Options')).click();
    await browser.sleep(ANIM_WAIT);
  }
}
