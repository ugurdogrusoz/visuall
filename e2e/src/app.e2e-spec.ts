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

  it('Can show object properties by selecting', async () => {
    await navigateTo();
    expect(await page.showObjProps()).toEqual(true);
  });

  it('Should maintain settings when "Store user profile" is checked (true by default)', async () => {
    await navigateTo();
    expect(await page.maintainSettings()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
