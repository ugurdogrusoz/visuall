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
  await navbarAction('Data', 'Sample Data');
  await wait4Spinner();
  return browser.executeScript('return cy.$("node:visible").length > 0 && cy.$("edge:visible").length > 0');
}

export async function navbarAction(dropdownBtn: string, actionBtn: string) {
  await element(by.buttonText(dropdownBtn)).click();
  await element(by.buttonText(actionBtn)).click();
}

export async function openTab(s: string) {
  element(by.cssContainingText('a.nav-link', s)).click();
  await browser.sleep(ANIM_WAIT);
}

export async function addPropertyRule(prop: string, op: string, inp: string) {
  await element(by.cssContainingText('option.prop-opt', prop)).click();
  await browser.sleep(ANIM_WAIT);
  await element(by.cssContainingText('option.prop-op-key', op)).click();
  await browser.sleep(ANIM_WAIT);
  await element(by.css('input[placeholder="Filter..."]')).clear();
  await browser.sleep(ANIM_WAIT);
  await element(by.css('input[placeholder="Filter..."]')).sendKeys(inp);
  await browser.sleep(ANIM_WAIT);
  await element(by.css('img[title="Add/Update"]')).click();
  await browser.sleep(ANIM_WAIT);
}

export async function openSubTab(subTab: string) {
  element(by.cssContainingText('b.va-heading2', subTab)).click();
  await browser.sleep(ANIM_WAIT);
}