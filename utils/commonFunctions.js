import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { expect } from '@playwright/test';
export async function handleGenericForm(page, formJson) {
  await waitUntilpageload(page);
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
      await highlightElement(page, submitBtn);
      await submitBtn.click();
      waitUntilpagenetworkidle(page); // Ensure network is idle after click
      console.log(`Clicked action button (pre-submit): "${buttonText}"`);

      const errorLocator = page.locator(`text=${requiredError}`);
      try {
        await errorLocator.waitFor({ state: 'visible', timeout: 9000 });
        console.log(`Required validation message shown: "${requiredError}"`);
      } catch {
        console.warn(`Expected required error message not found.`);
      }
    }
  }

  //Fill form fields
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
        await highlightElement(page, datePickerTrigger);
        await datePickerTrigger.click({ force: true });

        const dateLocator = page.locator(`(//div[contains(text(),'${value.day}')])[${value.index}]`);
        await dateLocator.waitFor({ state: 'visible', timeout: 10000 });
        await highlightElement(page, dateLocator);
        await dateLocator.click();

        // Trigger blur by JS if Tab/click doesn't work
        const dateInputLocator = page.locator(`(//*[text()='${label}']//following::mobius-date-picker)[1]//input`);
        if (await dateInputLocator.count()) {
          const inputHandle = await dateInputLocator.first().elementHandle();
          if (inputHandle) {
            await inputHandle.evaluate(el => el.blur()); // force blur
            console.log(`Programmatically triggered blur on date input for "${label}"`);
          }
        }

        console.log(`Picked date "${value.day}" for "${label}"`);
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
          await highlightElement(page, checkbox);

          await checkbox.click();
          console.log(`Checked "${val}" under "${label}"`);
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
          await highlightElement(page, tagInput);

          await tagInput.click();
          await page.keyboard.type(val);
          await page.keyboard.press('Enter');
          console.log(`Entered tag "${val}" for "${label}"`);
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
        await highlightElement(page, dropdownTrigger);

        await dropdownTrigger.click();
        console.log(`Opened dropdown for "${label}".`);

        for (const val of value) {
          // Wait for options to be present
          await page.waitForTimeout(200);

          const optionLocator = page.locator(`xpath=(//mobius-list-item[normalize-space(text())='${val}'])[1]`);
          console.log(`Looking for option "${val}" in dropdown "${label}"...`);
          await highlightElement(page, optionLocator);

          // Click the option
          await optionLocator.click({ force: true });
          console.log(`Selected option "${val}" for "${label}".`);

          // Re-open the dropdown if there are more options to select
          if (value.indexOf(val) < value.length - 1) {
            await highlightElement(page, dropdownTrigger);
            await dropdownTrigger.click();
            console.log(`Re-opened dropdown for next selection.`);
          }

          await page.waitForTimeout(300);
        }

        // Optional: Close the dropdown by clicking the label
        const labelClickLocator = page.locator(`xpath=(//*[normalize-space(text())='${label}'])[1]`);
        await highlightElement(page, labelClickLocator);

        await labelClickLocator.click({ force: true });
        console.log(`Closed dropdown by clicking label "${label}".`);

        console.log(`Completed dropdown selection for "${label}".`);
        continue;
      }

      // Handle Input Field
      const inputLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[2])[1]`);
      await inputLocator.waitFor({ state: 'visible', timeout: 30000 });
      await highlightElement(page, inputLocator);

      await inputLocator.click();

      await waitUntilpagedomcontentloaded(page);
      await page.keyboard.type(value.toString());

      let maskedValue = value;
      if (label.toLowerCase().includes('password')) maskedValue = '****';
      if (typeof value === 'string' && value.includes('@')) {
        const [user, domain] = value.split('@');
        maskedValue = '*'.repeat(user.length) + '@' + domain;
      }

      console.log(`Filled "${label}" with "${maskedValue}"`);
    } catch (err) {
      console.error(`Failed to process field "${label}": ${err.message}`);
      continue;
    }
  }

  // 🔹 Submit form
  const actionButton = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
  console.log(buttonText);
  await actionButton.waitFor({ state: 'visible', timeout: 10000 });
  await expect(actionButton).toBeEnabled();
  await highlightElement(page, actionButton);

  await actionButton.click();
  console.log(`Clicked action button: "${buttonText}"`);

  // 🔹 Toast validation
  if (expectedToast) {
    const toastLocator = page.locator(`text=${expectedToast}`);
    await toastLocator.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`Toast message shown: "${expectedToast}"`);
  }
}




export async function interceptAndValidateApi(page, config) {
  const {
    urlPattern,
    method,
    expectedRequestBody, // Optional
    expectedResponse,   // Optional
    validateRequestBody = true, // Default true if not specified
    validateResponse = true     // Default true if not specified
  } = config;

  if (!urlPattern) {
    throw new Error('❌ urlPattern is required for API validation');
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`❌ Timed out waiting for API call: ${urlPattern}`));
    }, 20000);

    const requestHandler = async (request) => {
      if (
        request.url().includes(urlPattern) &&
        (!method || request.method().toLowerCase() === method.toLowerCase())
      ) {
        try {
          page.off('request', requestHandler);

          const postData = request.postData();
          const parsedBody = postData ? JSON.parse(postData) : null;

          console.log('📤 Request:', request.url(), parsedBody);

          // Validate request body if configured to do so
          if (validateRequestBody && expectedRequestBody) {
            for (const key in expectedRequestBody) {
              if (typeof expectedRequestBody[key] === 'object') {
                const expectedStr = JSON.stringify(expectedRequestBody[key]);
                const actualStr = JSON.stringify(parsedBody?.[key]);
                if (expectedStr !== actualStr) {
                  console.log('Detailed Request Body Comparison:');
                  console.log('Expected:', expectedRequestBody[key]);
                  console.log('Actual:', parsedBody?.[key]);
                  clearTimeout(timeout);
                  return reject(
                    new Error(
                      `❌ Request body mismatch for "${key}" - Expected: ${expectedStr}, Got: ${actualStr}`
                    )
                  );
                }
              } else if (parsedBody?.[key] !== expectedRequestBody[key]) {
                clearTimeout(timeout);
                return reject(
                  new Error(
                    `❌ Request body mismatch for "${key}" - Expected: ${expectedRequestBody[key]}, Got: ${parsedBody?.[key]}`
                  )
                );
              }
            }
          }

          // Wait for response
          const response = await page.waitForResponse(
            (res) => res.url().includes(urlPattern),
            { timeout: 10000 }
          );

          const json = await response.json();
          console.log('📥 Response:', json);

          // Validate response body if configured to do so
          if (validateResponse && expectedResponse) {
            // Function to recursively check for matching keys and values in response
            const validateObject = (actual, expected, path = '') => {
              for (const key in expected) {
                const currentPath = path ? `${path}.${key}` : key;

                // Check if it's an object (not an array or primitive value)
                if (typeof expected[key] === 'object' && expected[key] !== null) {
                  validateObject(actual?.[key], expected[key], currentPath);
                } else {
                  // Match the field value
                  if (actual?.[key] !== expected[key]) {
                    console.log('Detailed Response Comparison:');
                    console.log('Expected:', expected[key]);
                    console.log('Actual:', actual?.[key]);
                    clearTimeout(timeout);
                    return reject(
                      new Error(
                        `❌ Response mismatch for "${currentPath}" - Expected: ${expected[key]}, Got: ${actual?.[key]}`
                      )
                    );
                  }
                }
              }
            };

            // Start validating
            validateObject(json, expectedResponse);
          }

          clearTimeout(timeout);
          resolve({
            request: parsedBody,
            response: json,
            statusCode: response.status()
          });

        } catch (err) {
          clearTimeout(timeout);
          reject(new Error(`❌ Error processing API call: ${err.message}`));
        }
      }
    };

    page.on('request', requestHandler);
  });
}


//************************Generic switchToTab()/Module Function************************
// export async function switchToTabOrModule(page, config) {
//   await waitUntilpagedomcontentloaded(page);
//   let tabArray = [];
//   // Accept either: [{name: 'tab'}] or {name: 'tab'}
//   if (Array.isArray(config)) {
//     tabArray = config.map(t => t.name);
//   } else if (config?.name) {
//     tabArray = [config.name]; // single tab
//   } else if (config?.tabs) {
//     tabArray = config.tabs.map(t => t.name);
//   } else {
//     console.warn('"tabName" or "tabs" not found or invalid in JSON');
//     return;
//   }

//   for (const tabText of tabArray) {
//     if (!tabText || typeof tabText !== 'string') {
//       console.warn(`Invalid tab name: ${tabText}`);
//       continue;
//     }

//     const tabLocator = page.locator(`xpath=(//*[text()='${tabText}'])[1]`);
//       console.log(`Switching to tab/module: "${tabLocator}"`);

//     if (await tabLocator.count() === 0) {
//       console.warn(`Tab/module "${tabText}" not found`);
//       continue;
//     }

//     if (await tabLocator.isVisible()) {
//       await highlightElement(page, tabLocator);
//       await waitUntilpagenetworkidle(page);

//       console.log(`Switching to tab/module: "${tabLocator}"`);
//       await tabLocator.click();
//          await waitUntilpageload(page);
//       console.log(`Switched to tab/module: "${tabText}"`);
//     } else {
//       console.warn(`Tab/module "${tabText}" is present but not visible.`);
//     }
//   }
// }

export async function switchToTabOrModule(page, config) {
  await waitUntilpagedomcontentloaded(page);
  let tabArray = [];

  // Handle different config formats
  if (Array.isArray(config)) {
    tabArray = config.map(t => t.name);
  } else if (config?.name) {
    tabArray = [config.name];
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

    try {
      // More flexible locator that handles different cases
      const tabLocator = page.locator(`xpath=//*[contains(text(), '${tabText}')]`).first();

      console.log(`Attempting to switch to tab/module: "${tabText}"`);

      // Wait for the tab to be present and visible
      await tabLocator.waitFor({ state: 'visible', timeout: 10000 });

      await highlightElement(page, tabLocator);
      await waitUntilpagenetworkidle(page);

      console.log(`Clicking tab/module: "${tabText}"`);
      await tabLocator.click();
      await waitUntilpageload(page);

      console.log(`Successfully switched to tab/module: "${tabText}"`);
    } catch (error) {
      console.error(`Failed to switch to tab/module "${tabText}":`, error.message);
      throw error; // Re-throw to fail the test
    }
  }
}

/**
 * Validates headers and checks that at least one row is present in the table.
 * @param {import('@playwright/test').Page} page
 * @param {string[]} expectedHeaders
 */
export async function validateTableHeadersAndRow(page, expectedHeaders) {
  console.log(`Validating Headers...`);

  for (const header of expectedHeaders) {
    const xpath = `(//table//*[normalize-space(text())='${header}'])[1]`;
    const locator = page.locator(`xpath=${xpath}`);

    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(locator).toBeVisible();
      console.log(`Visible Header: ${header}`);
    } catch (error) {
      console.error(`Header not visible: ${header}`);
      throw error;
    }
  }

  console.log(`Validating Row Presence...`);

  const rowLocator = page.locator('//table//tbody//mobius-tr');
  const rowCount = await rowLocator.count();

  if (rowCount === 0) {
    throw new Error('No table rows found');
  }

  console.log(`Found ${rowCount} row(s) in the table`);
}




//************************Click Button Function************************
export async function clickButton(page, buttonConfig) {
  const label = buttonConfig?.label;

  if (!label || typeof label !== 'string') {
    console.warn('Invalid or missing "label" in button config');
    return;
  }

  const button = page.locator(`xpath=(//*[normalize-space(text())='${label}'])[1]`);
  //await this.page.locator(button).waitFor({ state: 'visible' });

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
    await highlightElement(page, button);

    await button.click();

    console.log(`Clicked on button: "${label}"`);
  } catch (error) {
    console.error(`Failed to click button "${label}":`, error.message);
    throw error;
  }
}

/**
 * Highlights an element on the page by applying a flashing outline.
 * @param {import('@playwright/test').Page} page - The Playwright page instance.
 * @param {string} selector - The selector of the element to highlight.
 */
export async function highlightElement(page, locator) {
  const elementHandle = await locator.elementHandle();
  if (!elementHandle) {
    console.warn('Element handle not found for highlight.');
    return;
  }

  await page.evaluate(el => {
    const originalOutline = el.style.outline;
    el.style.transition = 'outline 0.2s ease-in-out';
    el.style.outline = '2px solid pink';
    setTimeout(() => {
      el.style.outline = originalOutline;
    }, 1000);
  }, elementHandle);
}


//*************************Wait Until Page is Ready************************


export async function waitUntilPageIsReady(page) {
  await page.waitForLoadState('networkidle', { timeout: 50000 });
  await page.waitForLoadState('load', { timeout: 50000 });       // Waits for the full load event
  await page.waitForLoadState('domcontentloaded', { timeout: 50000 }); // Waits until the DOM is parsed

}
export async function waitUntilpageload(page) {
  await page.waitForLoadState('load', { timeout: 50000 });       // Waits for the full load event

}
export async function waitUntilpagenetworkidle(page) {
  await page.waitForLoadState('networkidle', { timeout: 50000 });

}
export async function waitUntilpagedomcontentloaded(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 50000 }); // Waits until the DOM is parsed

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
      await waitUntilpagenetworkidle(page);
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
  await highlightElement(page, sendBtn);

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
      const context = await browser.newContext({
        viewport: { width: 2000, height: 2000 }
      });

      const dummyPage = await context.newPage();

      try {
        console.log(`Navigating to inbox: ${inboxUrl}`);
        await dummyPage.goto(inboxUrl, { waitUntil: 'domcontentloaded' });
        await dummyPage.waitForTimeout(3000);

        const inboxVisible = await dummyPage.locator(inboxRowSelector).isVisible().catch(() => false);

        if (inboxVisible) {
          console.log("Inbox found. Clicking latest email...");
          await highlightElement(page, inboxRowSelector);

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

//********************Generic tooltip hover and validator*****************/
// utils/verifyTooltip.js

async function verifyTooltip(page, config) {
  const xpath = `(//*[text()="${config.targetText}"])[1]`;
  const hoverTarget = page.locator(`xpath=${xpath}`);

  console.log(`⏳ Waiting for target to be visible: ${config.targetText}`);
  await hoverTarget.waitFor({ state: "visible", timeout: 10000 });

  console.log(`👁️ Scrolling into view...`);
  await hoverTarget.scrollIntoViewIfNeeded();

  console.log(`🖱️ Hovering on: ${config.label}`);
  await hoverTarget.hover({ force: true });

  // ✅ Use CSS selector syntax instead of invalid XPath
  const tooltipSelector = config.tooltipSelector || `mobius-router[title*="${config.targetText}"]`;
  const tooltipLocator = page.locator(tooltipSelector);

  console.log(`⏳ Waiting for tooltip to appear...`);
  await tooltipLocator.waitFor({ state: "visible", timeout: 5000 });

  const actualTooltipText = (await tooltipLocator.textContent())?.trim();
  console.log(`🔍 Tooltip text: ${actualTooltipText}`);

  if (actualTooltipText !== config.expectedText) {
    throw new Error(`❌ Tooltip mismatch. Expected: "${config.expectedText}", Got: "${actualTooltipText}"`);
  }

  console.log(`✅ Tooltip validation passed`);
}

//********************Generic expand and Collapse validator*****************/
// utils/expandCollapseUtils.js

async function openTriggerIfPresent(page, selector) {
  if (!selector) return;
  const element = page.locator(selector);
  const count = await element.count();
  if (count > 0 && await element.isVisible()) {
    console.log(`🔘 Clicking: ${selector}`);
    await element.click({ force: true });  // Use force to click even if covered by other elements
  } else {
    console.log(`Element not visible or does not exist: ${selector}`);
  }
}

async function expandSection(page, label) {
  const toggle = page.locator(`text=${label} >> xpath=../..//button[contains(@aria-label, "Expand")]`);
  await toggle.waitFor({ state: 'visible', timeout: 10000 });  // Wait for the element to become visible
  await toggle.scrollIntoViewIfNeeded();  // Ensure it's in view
  if (await toggle.isEnabled()) {
    console.log(`🔘 Expanding section: ${label}`);
    await toggle.click({ force: true });  // Use force click to bypass overlays
  } else {
    console.log(`Element not enabled for expanding: ${label}`);
  }
}

async function collapseSection(page, label) {
  const toggle = page.locator(`text=${label} >> xpath=../..//button[contains(@aria-label, "Collapse")]`);
  await toggle.waitFor({ state: 'visible', timeout: 10000 });  // Wait for the element to become visible
  await toggle.scrollIntoViewIfNeeded();  // Ensure it's in view
  if (await toggle.isEnabled()) {
    console.log(`🔘 Collapsing section: ${label}`);
    await toggle.click({ force: true });  // Use force click to bypass overlays
  } else {
    console.log(`Element not enabled for collapsing: ${label}`);
  }
}

async function isSectionExpanded(page, label) {
  const section = page.locator(`text=${label} >> xpath=../..`);
  await section.waitFor({ state: 'visible', timeout: 10000 });  // Wait for section to become visible
  const expanded = await section.getAttribute('aria-expanded');
  return expanded === 'true';
}

// ******************** Navigate to Infra Page ********************/
async function goToInfraSection(page, sectionName, infraName) {
  await page.click(`text=${sectionName}`);
  await page.waitForSelector(`text=${infraName}`, { timeout: 10000 });

  const row = page.locator(`xpath=//tbody//mobius-tr[.//text()[contains(., "${infraName}")]]`);
  await row.waitFor({ state: 'visible', timeout: 10000 });

  const moreOptionsIcon = row.locator('img.cursor-pointer').first();
  await moreOptionsIcon.waitFor({ state: 'visible', timeout: 10000 });
  await moreOptionsIcon.click();

  const viewInfraBtn = row.locator(`xpath=.//mobius-div[contains(text(), "View Infrastructure")]`);
  await viewInfraBtn.waitFor({ state: 'visible', timeout: 10000 });
  await viewInfraBtn.click();

  console.log(`✅ Navigated to Infrastructure: ${infraName}`);
}

// ******************** Open Storage Tab and Model ********************/
async function openStorageModelOptions(page, tabName, modelName) {
  await page.click(`text=${tabName}`);
  await page.waitForSelector(`text=${modelName}`, { timeout: 10000 });

  const row = page.locator(`xpath=//tbody//mobius-tr[.//text()[contains(., "${modelName}")]]`);
  await row.waitFor({ state: 'visible', timeout: 10000 });

  const moreOptionsBtn = row.locator(`img.cursor-pointer`);
  await moreOptionsBtn.first().click();
  console.log(`✅ Clicked 3-dot options button for model "${modelName}"`);

  const editButton = row.locator(`mobius-div:has-text("Edit Storage")`).filter({
    hasNot: page.locator('[class*="cursor-not-allowed"]'),
  });

  await editButton.first().waitFor({ state: 'visible', timeout: 10000 });
  await editButton.first().click();
  console.log(`✅ Clicked "Edit Storage" button for model "${modelName}"`);
}

// ******************** Generic Edit Storage Form Handler ********************/
async function editStorageForm(page, formJson) {
  const fields = formJson.fields || {};
  const buttonText = formJson.buttonText || "Update";
  const expectedToast = formJson.expectedToast || "Storage is updated Successfully";
  const matchIndex = formJson.matchIndex || 1;

  for (const [label, config] of Object.entries(fields)) {
    const value = config.value;
    const type = config.type || 'input';

    try {
      console.log(`👉 Processing field: ${label}, type: ${type}`);

      if (type === 'dropdown') {
        // Find dropdown label and its nearest dropdown container
        const labelLocator = page.locator(`xpath=//label[contains(text(), "${label}")]`);
        await labelLocator.waitFor({ state: 'visible', timeout: 10000 });

        const dropdown = labelLocator.locator(`xpath=following::mobius-dropdown-input-container[@id='dropdown-input-container'][1]`);
        await dropdown.waitFor({ state: 'visible', timeout: 10000 });
        await dropdown.click();

        const option = page.locator(`xpath=//mobius-listbox-option[normalize-space(.)="${value}"]`);
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();

        console.log(`✅ Selected "${value}" in dropdown "${label}"`);
        continue;
      }

      if (type === 'input') {
        const input = page.locator(`xpath=(//*[text()='${label}']//following::input)[1]`);
        await input.waitFor({ state: 'visible', timeout: 10000 });

        const existingValue = await input.inputValue();
        if (!existingValue?.trim()) {
          await input.fill(value.toString());
          console.log(`📝 Filled "${label}" with "${value}"`);
        } else {
          console.log(`⏭️ Skipped "${label}", already has value: "${existingValue}"`);
        }
        continue;
      }

      console.warn(`⚠️ Unsupported field type "${type}" for "${label}"`);
    } catch (err) {
      console.error(`❌ Error in field "${label}": ${err.message}`);
    }
  }

  // 🔽 Scroll down and submit
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  const submitBtn = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
  await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
  await submitBtn.click();
  console.log(`🚀 Clicked "${buttonText}" button`);

  // ✅ Verify toast
  const toastLocator = page.locator(`text=${expectedToast}`);
  await toastLocator.waitFor({ state: 'visible', timeout: 5000 });
  console.log(`✅ Toast appeared: "${expectedToast}"`);
}
//************************Assertions for expected text labels or placeholders************************
async function handleAssertions(page, expectedArray) {
  for (const item of expectedArray) {
    const expectedText = typeof item === 'string'
      ? item
      : item?.expectedName || item?.text || JSON.stringify(item);

    const locator = page.locator(`text=${expectedText}`);
    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      console.log(`✅ Verified text on screen: "${expectedText}"`);
    } catch (err) {
      console.error(`❌ Could not find expected text: "${expectedText}"`);
      throw err;
    }
  }
}
   