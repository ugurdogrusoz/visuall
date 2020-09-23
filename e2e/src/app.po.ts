import { browser, by, element } from 'protractor';

export class AppPage {

  readonly SAMPLE_DATA_WAIT = 3000;
  readonly ANIM_WAIT = 250;

  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  async getSampleData() {
    element(by.buttonText('Data')).click();
    element(by.buttonText('Sample Data')).click();
    await browser.sleep(this.SAMPLE_DATA_WAIT);
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
    await browser.sleep(this.SAMPLE_DATA_WAIT * 1.5);
    const isAllInRange = await browser.executeScript('return cy.$("[birth_year<1994],[death_year>2020]").length == 0');
    return isAllInRange;
  }

  async queryByConditionRuleGetAll(type: string, isEdge: boolean) {
    await this.beginQueryByRule();

    element(by.buttonText('Condition')).click();
    await browser.sleep(this.ANIM_WAIT);
    element.all(by.tagName('select')).get(0).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.cssContainingText('option', type)).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('img[title="Add/Update"]')).click();
    await browser.sleep(this.ANIM_WAIT);

    element(by.css('input[value="Execute"]')).click();
    await browser.sleep(this.SAMPLE_DATA_WAIT * 1.5);
    if (isEdge) {
      const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0`);
      return isAllFromTheType;
    }
    const isAllFromTheType = await browser.executeScript(`return cy.$('.${type}').length > 0 && cy.$().not('.${type}').length == 0`);
    return isAllFromTheType;

  }

  async addPropertyRule(prop: string, op: string, inp: string) {
    element.all(by.tagName('select')).get(1).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.cssContainingText('option', prop)).click();
    await browser.sleep(this.ANIM_WAIT);
    element.all(by.tagName('select')).get(2).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.cssContainingText('option', op)).click();
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
    element(by.cssContainingText('b.va-heading2', 'Query by Rule')).click();
    await browser.sleep(this.ANIM_WAIT);
    element(by.css('img[alt="Add Rule"]')).click();
    await browser.sleep(this.ANIM_WAIT);
  }
}
