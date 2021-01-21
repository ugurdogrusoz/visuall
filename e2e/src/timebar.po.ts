import { browser, by, element } from 'protractor';
import { addPropertyRule, ANIM_WAIT } from './test-helper';

export class TimebarPage {

  async timebarMetricAndRule() {
    element(by.cssContainingText('a.nav-link', 'Settings')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.cssContainingText('b.va-heading2', 'Timebar')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.cssContainingText('span.va-heading3', 'Configure Statistics')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.cssContainingText('b.timebar-metric-name', 'new')).click();
    await browser.sleep(ANIM_WAIT);

    element(by.cssContainingText('option.tbme-class-opt', 'Person')).click();
    await browser.sleep(ANIM_WAIT);

    element.all(by.css('img[alt="Add Rule"]')).get(1).click();
    await browser.sleep(ANIM_WAIT);

    element(by.buttonText('AND')).click();
    await browser.sleep(ANIM_WAIT);
    await addPropertyRule('birth_year', '≥', '1994');

    element.all(by.css('img[title="Add"]')).get(1).click();
    await browser.sleep(ANIM_WAIT);
    element(by.buttonText('Condition')).click();
    await browser.sleep(ANIM_WAIT);
    await addPropertyRule('death_year', '≤', '2020');

    element(by.css('input[value="Add"]')).click();

    return true;
  }
}
