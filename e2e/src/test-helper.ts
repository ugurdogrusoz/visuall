import { browser, by, element, ExpectedConditions, Locator } from 'protractor';

export const ANIM_WAIT = 250;

export function navigateTo() {
  return browser.get(browser.baseUrl) as Promise<any>;
}

export async function wait4Spinner() {
  await isLoading(4, ANIM_WAIT);
  await browser.sleep(ANIM_WAIT);
}

async function isLoading(CHECK_COUNT: number, WAIT_MS:number) {
  let notLoadingCnt = 0;

  while (notLoadingCnt <= CHECK_COUNT) {
    const isL = await browser.executeScript(`return window['IsVisuallLoading']`);
    if (isL) {
      notLoadingCnt--;
    } else {
      notLoadingCnt++;
    }
    await awaiter(WAIT_MS);
  }
  return true;
}

async function awaiter(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  })
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
  await element.all(by.buttonText(dropdownBtn)).first().click();
  await element.all(by.buttonText(actionBtn)).first().click();
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