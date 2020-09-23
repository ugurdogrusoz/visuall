import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(false);
  });

  it('should have at least 7 buttons on navbar', async () => {
    page.navigateTo();
    const cnt = await page.getButtons().count();
    expect(cnt >= 7).toEqual(true);
  });

  it('"Data>Sample Data" should bring some visible data', async () => {
    page.navigateTo();
    expect(page.getSampleData()).toEqual(true);
  });

  it('Filter by "Person" Node Type: should hide all person nodes', async () => {
    page.navigateTo();
    expect(page.filterByNodeType()).toEqual(true);
  });

  it('Filter by "ACTOR" Edge Type: should hide all actor edges', async () => {
    page.navigateTo();
    expect(page.filterByEdgeType()).toEqual(true);
  });

  it('Query by AND rule birth > 1994 && death < 2020', async () => {
    page.navigateTo();
    expect(page.queryByAndRule()).toEqual(true);
  });

  it('Query by Condition get All Persons', async () => {
    page.navigateTo();
    expect(page.queryByConditionRuleGetAll('Person', false)).toEqual(true);
  });

  it('Query by Condition get All COMPOSER', async () => {
    page.navigateTo();
    expect(page.queryByConditionRuleGetAll('COMPOSER', true)).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
