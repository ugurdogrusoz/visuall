import { browser, by, element } from 'protractor';
import { ANIM_WAIT, getFirstDisplayed, getSampleData, navigateTo, openSubTab, openTab, wait4Spinner } from './test-helper';

export class QueryByRulePage {
  async queryByAndRule() {
    await this.beginQueryByRule();
    element(by.buttonText('AND')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('birth_year', '≥', '1994');

    await getFirstDisplayed(by.css('img[title="Add"]')).click();
    await browser.sleep(ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('death_year', '≤', '2020');

    await this.click2graph();

    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    const isAllInRange = await browser.executeScript('return cy.$("[birth_year<1994],[death_year>2020]").length == 0 && cy.$("[birth_year>=1994],[death_year<=2020]").length > 0');
    return isAllInRange;
  }

  async beginQueryByRule() {
    await openSubTab('Query by Rule');
    await getFirstDisplayed(by.css('img[alt="Add Rule"]')).click();
    await browser.sleep(ANIM_WAIT);
  }

  async addPropertyRule(prop: string, op: string, inp: string) {
    await element(by.cssContainingText('option.prop-opt', prop)).click();
    await browser.sleep(ANIM_WAIT);
    await element(by.cssContainingText('option.prop-op-key', op)).click();
    await browser.sleep(ANIM_WAIT);
    await element(by.css('input[placeholder="Filter..."]')).clear();
    await browser.sleep(ANIM_WAIT);
    await element(by.css('input[placeholder="Filter..."]')).sendKeys(inp);
    await browser.sleep(ANIM_WAIT);
    await element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(ANIM_WAIT);
  }

  async queryByConditionRuleGetAll(type: string, isEdge: boolean) {
    await this.beginQueryByRule();
    await element(by.buttonText('Condition')).click();
    await this.selectClass4QueryRule(type);
    await element(by.css('img[title="Add/Update"]')).click();

    await this.click2graph();

    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();

    if (isEdge) {
      const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0`);
      return isAllFromTheType;
    }
    const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0 && cy.$().not('.${type}').length == 0`);
    return isAllFromTheType;
  }

  async editQueryByRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'John');
    await this.click2graph();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();

    const canGetAllJohns = await browser.executeScript(`return cy.$(".Person").filter("[primary_name *='John']").length  === cy.$().length`);

    element(by.css('img[title="Edit"]')).click();
    await this.addPropertyRule('primary_name', 'contains', 'Tom');
    getFirstDisplayed(by.css('input[value="Execute"]')).click();

    const canGetAllJohnsAndToms = await browser.executeScript(`return cy.$(".Person").filter("[primary_name *='John'],[primary_name *='Tom']").length === cy.$().length`);

    return canGetAllJohns && canGetAllJohnsAndToms;
  }

  async deleteQueryByRuleRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'John');
    element(by.css('img[title="Delete"]')).click();

    await this.selectClass4QueryRule('EDITOR');
    return true;
  }

  async nestedQueryByRuleRule() {
    await this.beginQueryByRule();
    element(by.buttonText('AND')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'Jo');

    // start inner OR
    await getFirstDisplayed(by.css('img[title="Add"]')).click();
    await browser.sleep(ANIM_WAIT);
    element(by.buttonText('OR')).click();
    await getFirstDisplayed(by.css('img[title="Add"]')).click();
    await browser.sleep(ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('ACTRESS', '>', '3');

    // second rule of inner OR
    await getFirstDisplayed(by.css('img[title="Add"]')).click();
    await browser.sleep(ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await this.addPropertyRule('ACTOR', '>', '3');

    await this.click2graph();
    getFirstDisplayed(by.css('input[value="Execute"]')).click();


    const canGetAllJos = await browser.executeScript(`return cy.$("[.Person][primary_name *='Jo']").length === cy.$().length`);
    return canGetAllJos;
  }

  async selectClass4QueryRule(type: string) {
    getFirstDisplayed(by.tagName('select')).click();
    await browser.sleep(ANIM_WAIT);
    getFirstDisplayed(by.cssContainingText('option', type)).click();
    await browser.sleep(ANIM_WAIT);
  }

  async testTableOfQueryByRuleRule() {
    await this.beginQueryByRule();
    await element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    // add empty rule
    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(ANIM_WAIT);

    await getFirstDisplayed(by.css('input[value="Execute"]')).click();
    await wait4Spinner();
    const el = element(by.css('input[placeholder="Search..."]'));
    el.clear();
    el.sendKeys('Tom');
    await wait4Spinner();

    // order by 
    element(by.cssContainingText('a.table-header', 'birth year')).click();
    await wait4Spinner();

    // merge selected to grahp
    element(by.css('input.cb-table-all')).click();
    element(by.css('img[title="Merge selected to graph"]')).click();
    await wait4Spinner();

    // download as CSV
    element(by.css('img[title="Download selected objects"]')).click();
    await browser.sleep(ANIM_WAIT);

    const cntElem1 = await browser.executeScript(`return cy.$().length`) as number;
    await this.click2graph();

    // load next page
    element.all(by.css('a.page-link')).last().click();
    await wait4Spinner();
    const cntElem2 = await browser.executeScript(`return cy.$().length`) as number;
    const hasAllToms = await browser.executeScript(`return cy.$("[primary_name *= 'Tom']").length > 0 && cy.$("[primary_name *= 'Tom']").length == cy.$().length`);

    // uncheck "Merge"
    element(by.css('input.cb-is-merge-graph')).click();
    await browser.sleep(ANIM_WAIT);
    // load next page
    element.all(by.css('a.page-link')).last().click();
    await wait4Spinner();
    const cntElem3 = await browser.executeScript(`return cy.$().length`) as number;

    return hasAllToms && (cntElem1 * 2) === cntElem2 && cntElem3 == cntElem1;
  }

  async testClientSideFiltering() {
    const isGotData = await getSampleData();
    await openTab('Settings');
    await this.setShowQueryResults(1);
    await openTab('Map');

    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await this.addPropertyRule('ACTOR', '>', '3');

    // uncheck database
    element(by.css('input.cb-is-on-db')).click();

    getFirstDisplayed(by.css('input[value="Execute"]')).click();

    const cntFiltered = await browser.executeScript(`return cy.$(':selected').filter(x => x.connectedEdges('.ACTOR').length > 3).length;`);
    const cntSelected = await browser.executeScript(`return cy.$(':selected').length;`);
    return isGotData && cntFiltered > 0 && cntSelected === cntFiltered;

  }

  async testAddRemoveRules2QueryByRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.css('input[value="Add"]')).click();
    await browser.sleep(ANIM_WAIT);

    // reload the page, the new rule should be also reloaded
    await navigateTo();

    await openSubTab('Query by Rule');
    element(by.css('img[title="Delete query rule"]')).click();
    return true;
  }

  async setShowQueryResults(idx: number) {
    element.all(by.css('input[name="optradio1"]')).get(idx).click();
    await browser.sleep(ANIM_WAIT);
  }

  /** clicks to "Graph" checkbox to load graph elements to cytoscape.js
   */
  async click2graph() {
    // uncheck graph
    element(by.css('input.cb-is-load-graph')).click();
    await browser.sleep(ANIM_WAIT);
  }
}
