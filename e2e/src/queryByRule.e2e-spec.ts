import { QueryByRulePage } from './queryByRule.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Query By Rule', () => {
  let page: QueryByRulePage;

  beforeEach(() => {
    page = new QueryByRulePage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('rule for "birth > 1994 AND death < 2020"', async () => {
    navigateTo();
    expect(page.queryByAndRule()).toEqual(true);
  });

  it('Condition get All Persons', async () => {
    await navigateTo();
    expect(await page.queryByConditionRuleGetAll('Person', false)).toEqual(true);
  });

  it('Condition get All COMPOSER', async () => {
    navigateTo();
    expect(page.queryByConditionRuleGetAll('COMPOSER', true)).toEqual(true);
  });

  it('Edit Rule Condition', async () => {
    navigateTo();
    expect(page.editQueryByRule()).toEqual(true);
  });

  it('Should be able to delete rule and change class of the rule', async () => {
    navigateTo();
    expect(page.deleteQueryByRuleRule()).toEqual(true);
  });

  it('Should be able to run a nested rule', async () => {
    navigateTo();
    expect(page.nestedQueryByRuleRule()).toEqual(true);
  });

  it('Table of should work properly ', async () => {
    navigateTo();
    expect(page.testTableOfQueryByRuleRule()).toEqual(true);
  });

  it('Client-side filtering should work properly', async () => {
    navigateTo();
    expect(page.testClientSideFiltering()).toEqual(true);
  });

  it('Can add/remove query', async () => {
    navigateTo();
    expect(page.testAddRemoveRules2QueryByRule()).toEqual(true);
  });


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
