import { CalcTheoreticPropPage } from './calcTheoreticProp.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Calculate Theoretic Property', () => {
  let page: CalcTheoreticPropPage;

  beforeEach(() => {
    page = new CalcTheoreticPropPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('Can calculate degree centrality and set widths', async () => {
    navigateTo();
    expect(page.resizeBasedOnDegreeCentrality()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
