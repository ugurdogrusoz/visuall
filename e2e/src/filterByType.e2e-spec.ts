import { FilterByTypePage } from './filterByType.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Filter By Node/Edge Type', () => {
  let page: FilterByTypePage;

  beforeEach(() => {
    page = new FilterByTypePage();
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

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
