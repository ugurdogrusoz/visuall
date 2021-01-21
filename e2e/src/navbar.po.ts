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
    await browser.sleep(ANIM_WAIT);
    return hasVisibleNodesAndEdges;
  }

  async saveSelectedAsJson() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    await element(by.buttonText('File')).click();
    await browser.executeScript('cy.$().select()');
    await element(by.buttonText('Save Selected Objects')).click();
    await browser.sleep(ANIM_WAIT);
    return hasVisibleNodesAndEdges;
  }

  async saveAsPNG() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    await this.click2SaveAsPng(1);
    await browser.executeScript('cy.zoom(3)');
    await this.click2SaveAsPng(2);
    return hasVisibleNodesAndEdges;
  }

  async saveUserProfile() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    await element(by.buttonText('File')).click();
    await element(by.buttonText('Save User Profile...')).click();
    await browser.sleep(ANIM_WAIT);
    return hasVisibleNodesAndEdges;
  }

  private async click2saveUserProfile(isSaveSettings: boolean, isSaveFilteringRules: boolean, isSaveTimebarMetrics: boolean) {
    await element(by.buttonText('File')).click();
    await element(by.buttonText('Save User Profile...')).click();
    await browser.sleep(ANIM_WAIT);
  }

  private async click2SaveAsPng(btn: 1 | 2) {
    await element(by.buttonText('File')).click();
    await element(by.buttonText('Save as PNG...')).click();
    await browser.sleep(ANIM_WAIT);
    let b = 'save-png-btn' + btn;
    element(by.id(b)).click();
    await browser.sleep(ANIM_WAIT);
  }
}
