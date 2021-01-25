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

  it('Can save selected as JSON', async () => {
    navigateTo();
    expect(page.saveSelectedAsJson()).toEqual(true);
  });

  it('Can save as PNG', async () => {
    navigateTo();
    expect(page.saveAsPNG()).toEqual(true);
  });

  it('Can save user profile', async () => {
    navigateTo();
    expect(page.saveUserProfile()).toEqual(true);
  });

  it('Can add group and remove groups manually', async () => {
    navigateTo();
    expect(page.addRemoveGroupsManually()).toEqual(true);
  });

  it('Can delete selected', async () => {
    navigateTo();
    expect(page.deleteSelected()).toEqual(true);
  });

  it('Use history to go back and forth', async () => {
    navigateTo();
    expect(page.useHistory()).toEqual(true);
  });

  it('Hide and/or show elements', async () => {
    navigateTo();
    expect(page.hideShowElems()).toEqual(true);
  });

  it('Expand/collapse nodes and edges', async () => {
    navigateTo();
    expect(page.expandCollapseElems()).toEqual(true);
  });

  it('Can highlight by seleting or searching', async () => {
    navigateTo();
    expect(page.highlightElems()).toEqual(true);
  });

  it('Can show help modals', async () => {
    navigateTo();
    expect(page.showHelpModals()).toEqual(true);
  });

  it('Can clear data', async () => {
    navigateTo();
    expect(page.clearData()).toEqual(true);
  });
  
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
