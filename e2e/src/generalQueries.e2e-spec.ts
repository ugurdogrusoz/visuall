import { GeneralQueriesPage } from './generalQueries.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Timebar', () => {
  let page: GeneralQueriesPage;

  beforeEach(() => {
    page = new GeneralQueriesPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('"Get Neigborhood" query should bring some nodes and edges', async () => {
    navigateTo();
    expect(page.testNeighoodQuery()).toEqual(true);
  });

  it('"Get graph of interest" query should bring some nodes and edges', async () => {
    navigateTo();
    expect(page.testGoIQuery()).toEqual(true);
  });

  it('"Get common targets/regulators" query should bring some nodes and edges', async () => {
    navigateTo();
    expect(page.testCommonTargetRegulatorQuery()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
