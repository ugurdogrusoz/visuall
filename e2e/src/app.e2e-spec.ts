import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(false);
  });

  it('should have 7 buttons', async () => {
    page.navigateTo();
    console.log('before wait 5 sec');
    await browser.sleep(5000);
    console.log('after wait 5 sec');
    expect(page.getButtons().count()).toEqual(7);
    console.log('asd');
    
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    // const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    // expect(logs).not.toContain(jasmine.objectContaining({
    //   level: logging.Level.SEVERE,
    // } as logging.Entry));
  });
});
