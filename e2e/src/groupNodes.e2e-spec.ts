import { GroupNodesPage } from './groupNodes.po';
import { browser, logging } from 'protractor';
import { navigateTo } from './test-helper';

describe('Group Nodes', () => {
  let page: GroupNodesPage;

  beforeEach(() => {
    page = new GroupNodesPage();
    // waiting for angular causes too long waits. (3-5 seconds after page loaded). Even if angular doesn't detect any changes it waits.
    browser.waitForAngularEnabled(false);
  });

  it('Can group with Louvain using compounds', async () => {
    navigateTo();
    expect(page.groupNodes()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
