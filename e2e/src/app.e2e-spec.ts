import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(false);
  });

  it('should have 7 buttons on navbar', async () => {
    page.navigateTo();
    expect(page.getButtons().count()).toEqual(7);
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

  it('Query by rule', async () => {
    page.navigateTo();
    expect(page.queryByRule()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
