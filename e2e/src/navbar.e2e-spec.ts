import { NavbarPage } from './navbar.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Navbar', () => {
  let page: NavbarPage;

  beforeEach(() => {
    page = new NavbarPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('should have at least 7 buttons on navbar', async () => {
    navigateTo();
    const cnt = await page.getButtons().count();
    expect(cnt >= 7).toEqual(true);
  });

  it('"Data>Sample Data" should bring some visible data', async () => {
    navigateTo();
    expect(page.getSampleData()).toEqual(true);
  });

  it('Can save as JSON', async () => {
    navigateTo();
    expect(page.saveAsJson()).toEqual(true);
  });
  
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
