import { browser, by, element, ExpectedConditions, Locator } from 'protractor';

export const ANIM_WAIT = 250;

export function navigateTo() {
  return browser.get(browser.baseUrl) as Promise<any>;
}

export async function wait4Spinner() {
  const EC = ExpectedConditions;
  await browser.wait(EC.presenceOf(getFirstDisplayed(by.css('.loading-div'))));
  await browser.wait(EC.invisibilityOf(getFirstDisplayed(by.css('.loading-div'))));
}

export function getFirstDisplayed(locator: Locator) {
  return element.all(locator).filter(x => x.isDisplayed()).first();
}

export async function getSampleData() {
  await element(by.buttonText('Data')).click();
  await element(by.buttonText('Sample Data')).click();
  await wait4Spinner();
  return browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
}