import { AppPage } from './app.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Visuall', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('Filter by "Person" Node Type: should hide all person nodes', async () => {
    navigateTo();
    expect(page.filterByNodeType()).toEqual(true);
  });

  it('Filter by "ACTOR" Edge Type: should hide all actor edges', async () => {
    navigateTo();
    expect(page.filterByEdgeType()).toEqual(true);
  });

  it('Query by AND rule birth > 1994 && death < 2020', async () => {
    navigateTo();
    expect(page.queryByAndRule()).toEqual(true);
  });

  it('Timebar metric as AND rule birth > 1994 && death < 2020', async () => {
    navigateTo();
    expect(page.timebarMetricAndRule()).toEqual(true);
  });

  it('Query by Condition get All Persons', async () => {
    await navigateTo();
    expect(await page.queryByConditionRuleGetAll('Person', false)).toEqual(true);
  });

  it('Query by Condition get All COMPOSER', async () => {
    navigateTo();
    expect(page.queryByConditionRuleGetAll('COMPOSER', true)).toEqual(true);
  });

  it('Edit Query by Rule Condition', async () => {
    navigateTo();
    expect(page.editQueryByRule()).toEqual(true);
  });

  it('Should be able to delete rule and change class of the rule in Query by Rule Condition', async () => {
    navigateTo();
    expect(page.deleteQueryByRuleRule()).toEqual(true);
  });

  it('Should be able to run a nested rule in Query by Rule', async () => {
    navigateTo();
    expect(page.nestedQueryByRuleRule()).toEqual(true);
  });

  it('Table of Query By Rule should work properly ', async () => {
    navigateTo();
    expect(page.testTableOfQueryByRuleRule()).toEqual(true);
  });

  it('Client-side filtering should work properly on Query By Rule', async () => {
    navigateTo();
    expect(page.testClientSideFiltering()).toEqual(true);
  });

  it('Can add/remove Query By Rule', async () => {
    navigateTo();
    expect(page.testAddRemoveRules2QueryByRule()).toEqual(true);
  });

  it('Can show object properties by selecting', async () => {
    navigateTo();
    expect(page.showObjProps()).toEqual(true);
  });

  it('Can group with Louvain using compounds', async () => {
    navigateTo();
    expect(page.groupNodes()).toEqual(true);
  });

  it('Can calculate degree centrality and set widths', async () => {
    navigateTo();
    expect(page.resizeBasedOnDegreeCentrality()).toEqual(true);
  });

  it('Should maintain settings when "Store user profile" is checked (true by default)', async () => {
    navigateTo();
    expect(page.maintainSettings()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
