import { browser, by, element } from 'protractor';
import { ANIM_WAIT, wait4Spinner } from './test-helper';

export class NavbarPage {
  async getSampleData() {
    await element(by.buttonText('Data')).click();
    await element(by.buttonText('Sample Data')).click();
    await wait4Spinner();
    return browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
  }

  getButtons() {
    return element.all(by.css('button.dropdown-toggle'));
  }

  async saveAsJson() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    await element(by.buttonText('File')).click();
    await element(by.buttonText('Save')).click();
    return hasVisibleNodesAndEdges;
  }
}
