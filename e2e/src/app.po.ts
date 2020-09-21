import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  getSampleData() {
    console.log('before get sample data');
    element(by.id('file-dropdown6')).click();
    console.log('after click to data');
    element(by.buttonText('Sample Data')).click();
    console.log('after click to sample data');
    return '';
  }
}
