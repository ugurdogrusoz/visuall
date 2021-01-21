import { TimebarPage } from './timebar.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Timebar', () => {
  let page: TimebarPage;

  beforeEach(() => {
    page = new TimebarPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('Timebar metric as AND rule birth > 1994 && death < 2020', async () => {
    navigateTo();
    expect(page.timebarMetricAndRule()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
