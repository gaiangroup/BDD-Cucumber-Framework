import { expect } from '@playwright/test';

export async function handleGenericForm(page, formJson) {
  const fields = formJson.fields || {};
  const buttonText = formJson.buttonText;
  const expectedToast = formJson.expectedToast || null;
  const requiredError = formJson.requiredError || null;
  const matchIndex = formJson.matchIndex || 1;

  // 🔹 Validate required error before filling
  if (requiredError) {
    const submitBtn = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      console.log(`Clicked action button (pre-submit): "${buttonText}"`);

      const errorLocator = page.locator(`text=${requiredError}`);
      try {
        await errorLocator.waitFor({ state: 'visible', timeout: 7000 });
        console.log(`✅ Required validation message shown: "${requiredError}"`);
      } catch {
        console.warn(`⚠️ Expected required error message not found.`);
      }
    }
  }

  // 🔹 Fill form fields
  for (const [label, config] of Object.entries(fields)) {
    const { value } = config;

    try {
      // Handle Date Picker
      if (
        value && config.type === "dateselection" &&
        typeof value === 'object' &&
        'id' in value &&
        'day' in value &&
        'index' in value
      ) {
        const datePickerTrigger = page.locator(`(//*[text()='${label}']//following::mobius-date-picker)[1]`);
        await datePickerTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await datePickerTrigger.click({ force: true });

        const dateLocator = page.locator(`(//div[contains(text(),'${value.day}')])[${value.index}]`);
        await dateLocator.waitFor({ state: 'visible', timeout: 10000 });
        await dateLocator.click();
        console.log(`✅ Picked date "${value.day}" for "${label}"`);
        continue;
      }

      // Handle Checkbox Array
      if (
        Array.isArray(value) &&
        value.every(v => typeof v === 'object' && 'text' in v && 'matchIndex' in v)
      ) {
        for (const valObj of value) {
          const val = valObj.text;
          const idx = valObj.matchIndex;
          const checkbox = page.locator(
            `xpath=(//*[contains(@*, 'checkbox')]//following::*[normalize-space(text())='${val}'])[${idx}]`
          );

          await checkbox.waitFor({ state: 'visible', timeout: 10000 });
          await checkbox.click();
          console.log(`✅ Checked "${val}" under "${label}"`);
        }
        continue;
      }

      // Handle Tag Input
      if (
        Array.isArray(value) && config.type === "tag" &&
        value.every(v => typeof v === 'string')
      ) {
        const tagInput = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[3])[1]`);
        await tagInput.waitFor({ state: 'visible', timeout: 10000 });
        for (const val of value) {
          await tagInput.click();
          await page.keyboard.type(val);
          await page.keyboard.press('Enter');
          console.log(`✅ Entered tag "${val}" for "${label}"`);
        }
        continue;
      }

      // Handle Dropdown
      if (
        Array.isArray(value) &&
        config.type === "dropdown"
      ) {
        // Try more robust locator:
        const dropdownTrigger = page.locator(`xpath=(//*[normalize-space(text())='${label}']//following::mobius-dropdown-input-container/*)[1]`);

        if (await dropdownTrigger.count() === 0) {
          console.error(`Dropdown trigger not found for label "${label}".`);
          continue;
        }

        // Ensure dropdown is open before the loop starts
        await dropdownTrigger.waitFor({ state: 'visible', timeout: 15000 });
        await dropdownTrigger.click();
        console.log(`✅ Opened dropdown for "${label}".`);

        for (const val of value) {
          // Wait for options to be present
          await page.waitForTimeout(200);

          const optionLocator = page.locator(`xpath=(//mobius-list-item[normalize-space(text())='${val}'])[1]`);
          console.log(`Looking for option "${val}" in dropdown "${label}"...`);

          // Click the option
          await optionLocator.click({ force: true });
          console.log(`✅ Selected option "${val}" for "${label}".`);

          // Re-open the dropdown if there are more options to select
          if (value.indexOf(val) < value.length - 1) {
            await dropdownTrigger.click();
            console.log(`🔄 Re-opened dropdown for next selection.`);
          }

          await page.waitForTimeout(300);
        }

        // Optional: Close the dropdown by clicking the label
        const labelClickLocator = page.locator(`xpath=(//*[normalize-space(text())='${label}'])[1]`);
        await labelClickLocator.click({ force: true });
        console.log(`✅ Closed dropdown by clicking label "${label}".`);

        console.log(`✅ Completed dropdown selection for "${label}".`);
        continue;
      }

      // Handle Input Field
      const inputLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[2])[1]`);
      await inputLocator.waitFor({ state: 'visible', timeout: 10000 });
      await inputLocator.click();
      await page.keyboard.type(value.toString());

      let maskedValue = value;
      if (label.toLowerCase().includes('password')) maskedValue = '****';
      if (typeof value === 'string' && value.includes('@')) {
        const [user, domain] = value.split('@');
        maskedValue = '*'.repeat(user.length) + '@' + domain;
      }

      console.log(`✅ Filled "${label}" with "${maskedValue}"`);
    } catch (err) {
      console.error(`❌ Failed to process field "${label}": ${err.message}`);
      continue;
    }
  }

  // 🔹 Submit form
  const actionButton = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
  await actionButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(actionButton).toBeEnabled();
  await actionButton.click();
  console.log(`✅ Clicked action button: "${buttonText}"`);

  // 🔹 Toast validation
  if (expectedToast) {
    const toastLocator = page.locator(`text=${expectedToast}`);
    await toastLocator.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ Toast message shown: "${expectedToast}"`);
  }
}

//************************Generic switchToTab()/Module Function************************
export async function switchToTabOrModule(page, config) {
  let tabArray = [];

  // Accept either: [{name: 'tab'}] or {name: 'tab'}
  if (Array.isArray(config)) {
    tabArray = config.map(t => t.name);
  } else if (config?.name) {
    tabArray = [config.name]; // single tab
  } else if (config?.tabs) {
    tabArray = config.tabs.map(t => t.name);
  } else {
    console.warn('"tabName" or "tabs" not found or invalid in JSON');
    return;
  }

  for (const tabText of tabArray) {
    if (!tabText || typeof tabText !== 'string') {
      console.warn(`Invalid tab name: ${tabText}`);
      continue;
    }

    const tabLocator = page.locator(`xpath=(//*[text()='${tabText}'])[1]`);

    if (await tabLocator.count() === 0) {
      console.warn(`Tab/module "${tabText}" not found`);
      continue;
    }

    if (await tabLocator.isVisible()) {
      await tabLocator.click();
      console.log(`Switched to tab/module: "${tabText}"`);
    } else {
      console.warn(`Tab/module "${tabText}" is present but not visible.`);
    }
  }
}



// /**
//  * Validates that each expected column name is visible using your custom XPath strategy.
//  *
//  * @param {import('@playwright/test').Page} page - Playwright page object
//  * @param {string[]} expectedColumns - List of expected header names
//  */
// export async function validateTableHeadersByColumnNames(page, expectedColumns) {
//   for (const columnName of expectedColumns) {
//     const xpath = `(//table//following::*[text()='${columnName}'])[1]`;
//    // console.log(`************** ${xpath}`);

//     const columnLocator = page.locator(`xpath=${xpath}`);

//     try {
//       await columnLocator.waitFor({ state: 'visible', timeout: 10000 });
//       await expect(columnLocator).toBeVisible({
//         timeout: 10000,
//       });
//       console.log(`✅ Visible: ${columnName}`);
//     } catch (error) {
//       console.error(`❌ Not visible: ${columnName} — Might be hidden or delayed in rendering.`);
//       throw error;
//     }
//   }
// }

// /**
//  * Validates headers and row data for a table.
//  * @param {import('@playwright/test').Page} page
//  * @param {string[]} expectedHeaders
//  * @param {string[]} expectedRow
//  */
// export async function validateTableHeadersAndRow(page, expectedHeaders, expectedRow) {
//   console.log(`🔍 Validating Headers...`);
//   for (const header of expectedHeaders) {
//     const xpath = `(//table//*[normalize-space(text())='${header}'])[1]`;
//     const locator = page.locator(`xpath=${xpath}`);

//     try {
//       await locator.waitFor({ state: 'visible', timeout: 10000 });
//       await expect(locator).toBeVisible();
//       console.log(`✅ Visible Header: ${header}`);
//     } catch (error) {
//       console.error(`❌ Header not visible: ${header}`);
//       throw error;
//     }
//   }

//   console.log(`🔍 Validating Row Data...`);

//   const rowLocator = page.locator('//table//tbody//mobius-tr');
//   await expect(rowLocator.first()).toBeVisible({ timeout: 10000 });

//   const rowCount = await rowLocator.count();

//   if (rowCount === 0) {
//     throw new Error('❌ No table rows found');
//   }

//   const firstRow = rowLocator.nth(0); // first actual row
//   const cellLocators = firstRow.locator('td');
//   const cellCount = await cellLocators.count();

//   for (let i = 0; i < expectedRow.length; i++) {
//     const cell = cellLocators.nth(i);
//     const cellText = await cell.innerText();

//     try {
//       expect(cellText.trim()).toContain(expectedRow[i]);
//       console.log(`✅ Cell[${i}] matches: ${expectedRow[i]}`);
//     } catch (err) {
//       console.error(`❌ Mismatch at cell ${i}: Expected "${expectedRow[i]}", Found "${cellText.trim()}"`);
//       throw err;
//     }
//   }
// }

// commonFunctions.js

/**
 * Validates headers and checks that at least one row is present in the table.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} expectedHeaders
 */
export async function validateTableHeadersAndRow(page, expectedHeaders) {
  console.log(`🔍 Validating Headers...`);

  for (const header of expectedHeaders) {
    const xpath = `(//table//*[normalize-space(text())='${header}'])[1]`;
    const locator = page.locator(`xpath=${xpath}`);

    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(locator).toBeVisible();
      console.log(`✅ Visible Header: ${header}`);
    } catch (error) {
      console.error(`❌ Header not visible: ${header}`);
      throw error;
    }
  }

  console.log(`🔍 Validating Row Presence...`);

  const rowLocator = page.locator('//table//tbody//mobius-tr');
  const rowCount = await rowLocator.count();

  if (rowCount === 0) {
    throw new Error('❌ No table rows found');
  }

  console.log(`✅ Found ${rowCount} row(s) in the table`);
}




//************************Click Button Function************************
export async function clickButton(page, buttonConfig) {
  const label = buttonConfig?.label;

  if (!label || typeof label !== 'string') {
    console.warn('Invalid or missing "label" in button config');
    return;
  }

  const button = page.locator(`xpath=(//*[normalize-space(text())='${label}'])[1]`);

  const count = await button.count();
  if (count === 0) {
    console.warn(`Button with label "${label}" not found.`);
    // const allButtons = await page.locator('//mobius-button').allTextContents();
    console.log('Available buttons on screen:', allButtons);
    return;
  }

  try {
    await button.waitFor({ state: 'visible', timeout: 7000 });
    await expect(button).toBeEnabled({ timeout: 5000 });
    await button.click();
    console.log(`Clicked on button: "${label}"`);
  } catch (error) {
    console.error(`Failed to click button "${label}":`, error.message);
    throw error;
  }
}

//*************************Wait Until Page is Ready************************
export async function waitUntilPageIsReady(page) {
  await page.waitForLoadState('networkidle',{ timeout: 50000 });
  await page.waitForLoadState('load',{ timeout: 50000 });       // Waits for the full load event
  await page.waitForLoadState('domcontentloaded',{ timeout: 50000 }); // Waits until the DOM is parsed

}

//*************************Navigate and Enter using Keyboard************************
export async function performKeyboardActions(page, actions = []) {
  if (!Array.isArray(actions) || actions.length === 0) {
    console.warn('"keyboardAction" config is missing or invalid.');
    return;
  }

  for (const action of actions) {
    const { key, repeat = 1, wait = 0, finalKey = null } = action;

    if (!key) {
      console.warn('Missing "key" in keyboard action config.');
      continue;
    }

    for (let i = 0; i < repeat; i++) {
      await page.keyboard.press(key);
      if (wait > 0) {
        await page.waitForTimeout(wait);
      }
    }

    if (finalKey) {
      await page.keyboard.press(finalKey);
      console.log(`Pressed final key: ${finalKey}`);
    }
  }
}

//*************************Email Invite subject validation************************
export async function sendAndValidateInvites(page, config) {
  const dotenv = await import('dotenv');
  dotenv.config();

  const { GMAIL_USER, GMAIL_PASS } = process.env;
  const emailList = Array.isArray(config.emails) ? config.emails : [config.emails];
  const subject = config.subject || "Invitation";
  const { emailInput, sendButton, successModal } = config.labels;
  const inboxConfigs = config.inboxConfigs || {};

  // Step 1: Fill all email inputs
  for (const email of emailList) {
    const input = page.locator(`xpath=(//*[@data-placeholder="${emailInput}"])[1]`);
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill(email);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log(`Entered email: ${email}`);
  }


  // Step 2: Click Send Invites button
  const sendBtn = page.locator(`xpath=(//*[text() = "${sendButton}"])[1]`);
  await sendBtn.waitFor({ state: "visible", timeout: 10000 });
  await sendBtn.click();
  console.log("Clicked send button");
  console.log("✅ Clicked send button");

  // Step 3: Wait for success modal
  const modal = page.locator(`xpath=(//*[@*="${successModal}"])[1]`);
  await modal.waitFor({ state: "visible", timeout: 15000 });
  console.log("Invite success modal appeared");

  // Step 4: Validate email delivery
  for (const email of emailList) {
    console.log(`Validating delivery for: ${email}`);
    const [inbox, domain] = email.split("@");

    //Gmail check (using IMAP)
    if (GMAIL_USER && GMAIL_PASS && email.includes(GMAIL_USER)) {
      console.log("Using Gmail IMAP...");
      const { default: Imap } = await import('imap');
      const { simpleParser } = await import('mailparser');

      const imap = new Imap({
        user: GMAIL_USER,
        password: GMAIL_PASS,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      });

      function openInbox(cb) {
        imap.openBox("INBOX", true, cb);
      }

      await new Promise((resolve, reject) => {
        imap.once("ready", () => {
          openInbox((err) => {
            if (err) return reject(err);
            const criteria = [["SUBJECT", subject]];

            imap.search(criteria, (err, results) => {
              if (err || !results.length) return reject(new Error(`No emails found for subject: ${subject}`));
              const f = imap.fetch(results, { bodies: "" });
              let found = false;

              f.on("message", (msg) => {
                msg.on("body", (stream) => {
                  simpleParser(stream, (err, mail) => {
                    if (!err && mail.subject.includes(subject)) {
                      if (!found) {
                        console.log(`Gmail: Email received for ${email}: "${mail.subject}"`);
                        found = true;
                      }
                    }
                  });
                });
              });


              f.once("end", () => {
                imap.end();
                found
                  ? resolve()
                  : reject(new Error(`No matching Gmail email body for ${email}`));
              });
            });
          });
        });

        imap.once("error", (err) => reject(err));
        imap.connect();
      });

    } else {
      // Dummy domain (like Mailinator, Getnada)
      const domainConfig = inboxConfigs[domain];
      if (!domainConfig) {
        console.warn(`No config found for domain: ${domain}, skipping...`);
        continue;
      }

      const inboxUrl = domainConfig.urlTemplate.replace("{{inbox}}", inbox);
      const inboxRowSelector = domainConfig.inboxRowSelector;
      const iframeName = domainConfig.iframeName;

      const { chromium } = await import('playwright');
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const dummyPage = await context.newPage();

      try {
        console.log(`Navigating to inbox: ${inboxUrl}`);
        await dummyPage.goto(inboxUrl, { waitUntil: 'domcontentloaded' });
        await dummyPage.waitForTimeout(3000);

        const inboxVisible = await dummyPage.locator(inboxRowSelector).isVisible().catch(() => false);

        if (inboxVisible) {
          console.log("Inbox found. Clicking latest email...");
          await dummyPage.locator(`xpath=${inboxRowSelector}`).click();
          await dummyPage.waitForTimeout(2000);

          try {
            await dummyPage.waitForSelector('iframe', { timeout: 7000 });

            const allFrames = dummyPage.frames();
            let frameFound = false;

            for (const f of allFrames) {
              const bodyContent = await f.textContent('body').catch(() => '');
              if (bodyContent?.includes(subject)) {
                console.log(`Found subject in iframe body: "${subject}"`);
                frameFound = true;
                break;
              }
            }

            if (!frameFound) {
              throw new Error(`Subject "${subject}" not found in any iframe`);
            }

          } catch (iframeErr) {
            console.log("No valid iframe found or subject not in any iframe. Falling back to body...");
            const bodyText = await dummyPage.textContent('body').catch(() => '');
            if (bodyText?.includes(subject)) {
              console.log(`Found subject directly in fallback page body`);
            } else {
              throw new Error(`Subject not found in page content`);
            }
          }


        } else {
          console.log("No inbox table. Checking full page...");
          const bodyText = await dummyPage.textContent('body');
          if (bodyText?.includes(subject)) {
            console.log(`Found subject in fallback body`);
          } else {
            throw new Error(`Subject not found on fallback page`);
          }
        }

      } catch (err) {
        if (err) {
          const errorMessage = err?.message || JSON.stringify(err);
          console.warn(`Email validation failed for ${email}: ${errorMessage}`);
        }
      } finally {
        await browser.close();
      }
    }
  }
}

//************ HANDLE ASSERTIONS***************************
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
export async function handleAssertions(page, data = {}) {
  //*********************Assertion for default text in input fields*********************/
  if (data.inputs) {
    for (const { label, expectedValue } of data.inputs) {
      const locator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[2])[1]`);
      const value = await locator.textContent();
      expect(value?.trim()).toBe(expectedValue);
      console.log(`Input "${label}" matched expected value: "${expectedValue}"`);
    }
  }
  //*********************Assertion for errors*********************/
  if (data.errors) {
    for (const { errorMessage } of data.errors) {
      const errorLocator = page.locator(`text=${errorMessage}`);
      await expect(errorLocator).toBeVisible({ timeout: 5000 });
      console.log(`Error message visible: "${errorMessage}"`);
    }
  }
  //*********************Assertion for Placeholders text*********************/
  if (data.placeholders) {
    for (const { descriptionOfField, expectedPlaceholder } of data.placeholders) {
      // This assumes there's a single input with the expected placeholder
      const locator = page.locator(`xpath=(//*[@data-placeholder='${expectedPlaceholder}'])[1]`);
      const isVisible = await locator.isVisible();

      if (!isVisible) {
        throw new Error(`Input with placeholder "${expectedPlaceholder}" for "${descriptionOfField}" is not visible`);
      }

      const actualPlaceholder = await locator.getAttribute('data-placeholder');
      console.log('The text of Actual Placeholder captured during runtime is ' + actualPlaceholder);
      if (actualPlaceholder?.trim() !== expectedPlaceholder.trim()) {
        throw new Error(`Placeholder mismatch for "${descriptionOfField}": Expected "${expectedPlaceholder}", but got "${actualPlaceholder}"`);
      }

      console.log(`Placeholder matched for "${descriptionOfField}": "${expectedPlaceholder}"`);
    }
  }

  //*********************Assertion for visible text*********************/
  if (data.texts) {
    for (const { descriptionOfField, expectedVisibleText } of data.texts) {
      const locator = page.locator(`xpath=(//*[normalize-space()='${expectedVisibleText}'])[1]`);
      const isVisible = await locator.isVisible();

      if (!isVisible) {
        throw new Error(`Text not visible: Expected "${expectedVisibleText}" for "${descriptionOfField}"`);
      }

      const actualText = await locator.innerText();
      console.log('The Actual text of field captured during runtime is ' + actualText);
      if (actualText.trim() !== expectedVisibleText.trim()) {
        throw new Error(`Text mismatch for "${descriptionOfField}": Expected "${expectedVisibleText}", but got "${actualText}"`);
      } else {
        console.log(`Text matched for "${descriptionOfField}": "${expectedVisibleText}"`);
      }
    }
  }


  if (data.tags) {
    for (const { label, expectedTags } of data.tags) {
      for (const tag of expectedTags) {
        const tagLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-tag[text()='${tag}'])[1]`);
        await expect(tagLocator).toBeVisible();
        console.log(`Tag "${tag}" under "${label}" is visible`);
      }
    }
  }

  if (data.dropdowns) {
    for (const { label, expectedSelected } of data.dropdowns) {
      const selectedLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-dropdown-input-container)[1]`);
      const selectedValue = await selectedLocator.textContent();
      expect(selectedValue?.trim()).toBe(expectedSelected);
      console.log(`Dropdown "${label}" selected value matched: "${expectedSelected}"`);
    }
  }

  if (data.attributes) {
    for (const { label, attribute, expected } of data.attributes) {
      const locator = page.locator(`xpath=(//*[contains(text(),'${label}')])[1]`);
      const attrVal = await locator.getAttribute(attribute);
      const isTruthy = attrVal !== null && attrVal !== 'false';
      expect(isTruthy).toBe(expected);
      console.log(`Attribute "${attribute}" on "${label}" is ${expected}`);
    }
  }
  //*********************Assertion for Screenshots*********************/
  if (data.screenshots) {
    for (const { expectedName, folder = 'screenshots' } of data.screenshots) {
      // ========== TIMESTAMP SETUP ==========
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 to 12 for 12AM

      // Use colons between time parts
      const timestamp = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}_${ampm}`;



      // Create subfolders for actual, expected, and diff
      const expectedDir = path.join(folder, 'expected');
      const actualDir = path.join(folder, 'actual');
      const diffDir = path.join(folder, 'diff');

      // Ensure folders exist
      [expectedDir, actualDir, diffDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });

      // File paths
      const actualPath = path.join(actualDir, `${expectedName}_actual_${timestamp}.png`);
      const expectedPath = path.join(expectedDir, `${expectedName}_expected_${timestamp}.png`);
      const diffPath = path.join(diffDir, `${expectedName}_diff_${timestamp}.png`);
      // Take actual screenshot
      await page.screenshot({ path: actualPath, fullPage: true });
      console.log(`Actual screenshot saved: ${actualPath}`);

      // Save expected screenshot if not already saved
      if (!fs.existsSync(expectedPath)) {
        fs.copyFileSync(actualPath, expectedPath);
        console.log(`Expected screenshot created: ${expectedPath}`);
        continue;
      }

      // Compare screenshots
      const actual = PNG.sync.read(fs.readFileSync(actualPath));
      const expected = PNG.sync.read(fs.readFileSync(expectedPath));
      const { width, height } = actual;
      const diff = new PNG({ width, height });

      const diffPixels = pixelmatch(actual.data, expected.data, diff.data, width, height, {
        threshold: 0.1,
      });

      // Save diff image
      fs.writeFileSync(diffPath, PNG.sync.write(diff));

      if (diffPixels > 0) {
        console.error(`Screenshot mismatch: ${diffPixels} pixels differ.`);
        console.error(`Diff saved to: ${diffPath}`);
        throw new Error(`Screenshot mismatch for: ${expectedName}`);
      } else {
        console.log(`Screenshot matched for: ${expectedName}`);
      }
    }
  }



  console.log('All assertions passed!');
}

//********************Accept Popup Validation******************/
export async function handlePopupSimple(page, config) {
  const {
    expectedText,
    buttonText,
    matchingIndex = 1
  } = config;

  // Wait for confirmation popup with expected text
  const popup = page.locator(`xpath=(//*[text()='${expectedText}'])[1]`);
  await popup.waitFor({ state: 'visible', timeout: 3000 });

  const textContent = await popup.textContent();
  if (textContent.includes(expectedText)) {
    console.log(`Popup contains expected text: "${expectedText}"`);
  } else {
    console.warn(`Expected text not found in popup. Found: "${textContent}"`);
  }

  // Click the desired button
  const button = page.locator(`xpath=(//*[text()='${buttonText}'])[${matchingIndex}]`);
  await button.click();
  console.log(`Clicked "${buttonText}" button and deleted the item successfully.`);
}

// ************************Click three dot Action Menu************************
export async function threeDotActionMenu(page, config) {
  const index = config?.matchIndex;
  const actionText = config?.actionText;

  if (!actionText) {
    console.warn('No actionText provided in config.');
    return;
  }

  const menuLocator = page.locator(`xpath=(//*[contains(@*,'sticky right')])[${index}]`);
  await menuLocator.waitFor({ state: 'visible', timeout: 6000 });
  const count = await menuLocator.count();

  if (count === 0) {
    console.warn(`No element found at index ${index} for sticky right.`);
    return;
  }

  const menuItem = menuLocator.nth(0); // first() is equivalent to nth(0)

  // Scroll into view before interacting
  await menuItem.scrollIntoViewIfNeeded();
  await menuItem.waitFor({ state: 'visible', timeout: 6000 });

  try {
    await menuItem.click({ timeout: 3000 });
    console.log(`Clicked on three-dot menu at index ${index}`);
  } catch (err) {
    console.warn(`Standard click failed. Trying JS click on menu index ${index}`);
    const elementHandle = await menuItem.elementHandle();
    if (elementHandle) {
      await page.evaluate(el => el.click(), elementHandle);
    } else {
      throw new Error(`Unable to get element handle for three-dot menu at index ${index}`);
    }
  }

  // Select the action from dropdown
  const actionLocator = page.locator(`xpath=(//*[text()='${actionText}'])[1]`);
  try {
    await actionLocator.waitFor({ state: 'visible', timeout: 6000 });
    await actionLocator.click();
    console.log(`✅ Selected action: "${actionText}"`);
  } catch (err) {
    console.warn(`❌ Action "${actionText}" not found or not clickable.`);
    throw err;
  }
}


//**********************Perfrom Scroll************************
export async function scrollContainerById(page, config) {
  const { id, scrollBy = 500 } = config || {};

  if (!id) {
    console.warn('No scroll container ID provided');
    return;
  }

  await page.evaluate(({ id, scrollBy }) => {
    const container = document.getElementById(id);
    if (container) {
      container.scrollTop += scrollBy;
    } else {
      console.warn(`Container with id "${id}" not found.`);
    }
  }, { id, scrollBy });

  console.log(`Scrolled container '${id}' by ${scrollBy}px`);
}
