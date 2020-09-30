import { browser, by, element } from 'protractor';

export class AppPage {

  readonly DATA_WAIT = 3000;
  readonly ANIM_WAIT = 500;

  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  async getSampleData() {
    element(by.buttonText('Data')).click();
    element(by.buttonText('Sample Data')).click();
    await browser.waitForAngular();
    const hasVisibleNodesAndEdges = await browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
    return hasVisibleNodesAndEdges;
  }

  async filterByNodeType() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    element.all(by.css('a.filter-node-class')).first().click();
    const hasVisiblePerson = await browser.executeScript('return cy.$("node:visible").filter(".Person").length > 0');
    return hasVisibleNodesAndEdges && !hasVisiblePerson;
  }

  async filterByEdgeType() {
    const hasVisibleNodesAndEdges = await this.getSampleData();

    element.all(by.css('a.filter-edge-class')).first().click();
    const hasVisibleActor = await browser.executeScript('return cy.$("edge:visible").filter(".ACTOR").length > 0');
    return hasVisibleNodesAndEdges && !hasVisibleActor;
  }

  async queryByAndRule() {
    await this.beginQueryByRule();
    element(by.buttonText('AND')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('birth_year', '≥', '1994');

    element(by.css('img[title="Add"]')).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('death_year', '≤', '2020');

    element(by.css('input[value="Execute"]')).click();
    await browser.sleep(this.DATA_WAIT * 1.5);
    const isAllInRange = await browser.executeScript('return cy.$("[birth_year<1994],[death_year>2020]").length == 0 && cy.$("[birth_year>=1994],[death_year<=2020]").length > 0');
    return isAllInRange;
  }

  async queryByConditionRuleGetAll(type: string, isEdge: boolean) {
    await this.beginQueryByRule();

    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.selectClass4QueryRule(type);

    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('input[value="Execute"]')).click();
    await browser.sleep(this.ANIM_WAIT);
    await browser.waitForAngular();
    if (isEdge) {
      const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0`);
      return isAllFromTheType;
    }
    const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0 && cy.$().not('.${type}').length == 0`);
    return isAllFromTheType;
  }

  async addPropertyRule(prop: string, op: string, inp: string) {
    element(by.cssContainingText('option.prop-opt', prop)).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.cssContainingText('option.prop-op-key', op)).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.css('input[placeholder="Filter..."]')).clear();
    await browser.sleep(this.ANIM_WAIT);
    element(by.css('input[placeholder="Filter..."]')).sendKeys(inp);
    await browser.sleep(this.ANIM_WAIT);
    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(this.ANIM_WAIT);
  }

  getButtons() {
    return element.all(by.css('button.dropdown-toggle'));
  }

  async beginQueryByRule() {
    await this.openQueryByRuleSubTab();
    element(by.css('img[alt="Add Rule"]')).click();
    await browser.sleep(this.ANIM_WAIT);
  }

  async openQueryByRuleSubTab() {
    element(by.cssContainingText('b.va-heading2', 'Query by Rule')).click();
    await browser.sleep(this.ANIM_WAIT);
  }

  async editQueryByRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'John');
    element(by.css('input[value="Execute"]')).click();
    await browser.waitForAngular();
    const canGetAllJohns = await browser.executeScript(`return cy.$("[.Person][primary_name *='John']").length === cy.$().length`);

    element(by.css('img[title="Edit"]')).click();
    await this.addPropertyRule('primary_name', 'contains', 'Tom');
    element(by.css('input[value="Execute"]')).click();
    await browser.waitForAngular();
    const canGetAllJohnsAndToms = await browser.executeScript(`return cy.$("[.Person][primary_name *='John'],[primary_name *='Tom']").length === cy.$().length`);

    return canGetAllJohns && canGetAllJohnsAndToms;
  }

  async deleteQueryByRuleRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'John');
    element(by.css('img[title="Delete"]')).click();

    await this.selectClass4QueryRule('EDITOR');
    return true;
  }

  async nestedQueryByRuleRule() {
    await this.beginQueryByRule();
    element(by.buttonText('AND')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('primary_name', 'contains', 'Jo');

    // start inner OR
    element(by.css('img[title="Add"]')).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.buttonText('OR')).click();
    element(by.css('img[title="Add"]')).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('ACTRESS', '>', '3');

    // second rule of inner OR
    element(by.css('img[title="Add"]')).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('ACTOR', '>', '3');

    element(by.css('input[value="Execute"]')).click();
    await browser.waitForAngular();

    const canGetAllJos = await browser.executeScript(`return cy.$("[.Person][primary_name *='Jo']").length === cy.$().length`);
    return canGetAllJos;
  }

  async selectClass4QueryRule(type: string) {
    element.all(by.tagName('select')).get(0).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.cssContainingText('option', type)).click();
    await browser.sleep(this.ANIM_WAIT);
  }

  async testTableOfQueryByRuleRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    // add empty rule
    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    // uncheck graph
    element(by.css('input.cb-is-load-graph')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('input[value="Execute"]')).click();
    await browser.sleep(this.DATA_WAIT);

    const el = element(by.css('input[placeholder="Search..."]'));
    el.clear();
    el.sendKeys('Tom');
    await browser.sleep(this.DATA_WAIT);

    // order by 
    element(by.cssContainingText('a.table-header', 'birth year')).click();
    await browser.sleep(this.DATA_WAIT * 1.5);

    // merge selected to grahp
    element(by.css('input.cb-table-all')).click();
    element(by.css('img[title="Merge selected to graph"]')).click();
    await browser.sleep(this.DATA_WAIT);

    // download as CSV
    element(by.css('img[title="Download selected objects"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    // check "Graph"
    element(by.css('input.cb-is-load-graph')).click();
    await browser.sleep(this.ANIM_WAIT);

    const cntElem1 = await browser.executeScript(`return cy.$().length`) as number;

    // load next page
    element.all(by.css('a.page-link')).last().click();
    await browser.sleep(this.DATA_WAIT);
    const cntElem2 = await browser.executeScript(`return cy.$().length`) as number;
    const hasAllToms = await browser.executeScript(`return cy.$("[primary_name *= 'Tom']").length > 0 && cy.$("[primary_name *= 'Tom']").length == cy.$().length`);

    // uncheck "Merge"
    element(by.css('input.cb-is-merge-graph')).click();
    await browser.sleep(this.ANIM_WAIT);
    // load next page
    element.all(by.css('a.page-link')).last().click();
    await browser.sleep(this.DATA_WAIT);
    const cntElem3 = await browser.executeScript(`return cy.$().length`) as number;

    return hasAllToms && (cntElem1 * 2) === cntElem2 && cntElem3 == cntElem1;
  }

  async testClientSideFiltering() {
    const isGotData = await this.getSampleData();
    await this.openTab('Settings');
    await this.setShowQueryResults(1);
    await this.openTab('Map');

    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    await this.addPropertyRule('ACTOR', '>', '3');

    // check database
    element(by.css('input.cb-is-on-db')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('input[value="Execute"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    const cntFiltered = await browser.executeScript(`return cy.$(':selected').filter(x => x.connectedEdges('.ACTOR').length > 3).length;`);
    const cntSelected = await browser.executeScript(`return cy.$(':selected').length;`);
    return isGotData && cntFiltered > 0 && cntSelected === cntFiltered;

  }

  async testAddRemoveRules2QueryByRule() {
    await this.beginQueryByRule();
    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('input[value="Add"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    // reload the page, the new rule should be also reloaded
    await this.navigateTo();

    await this.openQueryByRuleSubTab();
    element(by.css('img[title="Delete query rule"]')).click();
    return true;
  }

  async openTab(s: string) {
    element(by.cssContainingText('a.nav-link', s)).click();
    await browser.sleep(this.ANIM_WAIT);
  }

  async setShowQueryResults(idx: number) {
    element.all(by.css('input[name="optradio1"]')).get(idx).click();
    await browser.sleep(this.ANIM_WAIT);
  }
}
