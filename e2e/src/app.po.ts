import { browser, by, element } from 'protractor';
import { ANIM_WAIT, getSampleData } from './test-helper';

export class AppPage {

  async showObjProps() {
    const hasVisibleNodesAndEdges = await getSampleData();
    await browser.executeScript(`cy.nodes()[0].select();`);
    await browser.sleep(ANIM_WAIT);
    const hasDiv = element(by.id('prop-tab')).isPresent();
    expect(element(by.id('prop-tab')).getAttribute('class')).toContain('collapse show text-center m-1');
    return hasVisibleNodesAndEdges && hasDiv;
  }

  async maintainSettings() {
    element(by.cssContainingText('a.nav-link', 'Settings')).click();
    await element.all(by.css('input[type="checkbox"]')).filter(x => x.isDisplayed()).get(2).click()
    await browser.refresh();
    element(by.cssContainingText('a.nav-link', 'Settings')).click();
    return await element.all(by.css('input[type="checkbox"]')).filter(x => x.isDisplayed()).get(2).isSelected();
  }

}
