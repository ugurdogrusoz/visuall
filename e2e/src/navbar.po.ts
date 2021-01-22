import { browser, by, element } from 'protractor';
import { ANIM_WAIT, getFirstDisplayed, navbarAction, wait4Spinner } from './test-helper';

export class NavbarPage {
  async getSampleData() {
    await navbarAction('Data', 'Sample Data');
    await wait4Spinner();
    return browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
  }

  getButtons() {
    return element.all(by.css('button.dropdown-toggle'));
  }

  async saveAsJson() {
    const hasVisibleNodesAndEdges = await this.getSampleData();
    await navbarAction('File', 'Save');
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
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          await navbarAction('File', 'Save User Profile...')
          await browser.sleep(ANIM_WAIT);
          await this.click2saveUserProfile(i == 0, j == 0, k == 0);
        }
      }
    }
    return true;
  }

  private async click2saveUserProfile(isSaveSettings: boolean, isSaveFilteringRules: boolean, isSaveTimebarMetrics: boolean) {
    if (!isSaveSettings) {
      element(by.id('save-profile-cb0')).click();
    }
    if (!isSaveFilteringRules) {
      element(by.id('save-profile-cb1')).click();
    }
    if (!isSaveTimebarMetrics) {
      element(by.id('save-profile-cb2')).click();
    }
    getFirstDisplayed(by.cssContainingText('button.btn.btn-primary.va-text', 'OK')).click();
    await browser.sleep(ANIM_WAIT);
  }

  private async click2SaveAsPng(btn: 1 | 2) {
    await navbarAction('File', 'Save as PNG...')
    await browser.sleep(ANIM_WAIT);
    let b = 'save-png-btn' + btn;
    element(by.id(b)).click();
    await browser.sleep(ANIM_WAIT);
  }
}
