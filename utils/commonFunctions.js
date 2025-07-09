import { expect } from '@playwright/test';



// ************************Handle Custom Checkboxes************************
// export async function handleGenericForm(page, formJson) {
//   const fields = formJson.fields || {};
//   const buttonText = formJson.buttonText;
//   const expectedToast = formJson.expectedToast || null;
//   const requiredError = formJson.requiredError || null;
//   const matchIndex = formJson.matchIndex || 1;

//   // 🔹 Step 1: Validate required error before filling
//   if (requiredError) { 
//     const submitBtn = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
//     if (await submitBtn.isVisible()) {
//       await expect(submitBtn).toBeEnabled();
//       await submitBtn.click();
//       console.log(`Clicked on action button (pre-submit): "${buttonText}"`);

//       const errorLocator = page.locator(`text=${requiredError}`);
//       try {
//         await expect(errorLocator).toBeVisible({ timeout: 6000 });
//         console.log(`Required validation message shown: "${requiredError}"`);
//       } catch {
//         console.warn(`Expected required error message not found.`);
//       }
//     }
//   }

//   // 🔹 Step 2: Fill form fields
//   for (const [label, config] of Object.entries(fields)) {
//     const { value } = config;

//     // Handle Date Picker
//     if (
//       value && config.type === "dateselection" &&
//       typeof value === 'object' &&
//       'id' in value &&
//       'day' in value &&
//       'index' in value
//     ) {

//       const datePickerTrigger = page.locator(`(//*[text()='${label}']//following::mobius-date-picker)[1]`);
//       // if (!(await datePickerTrigger.isVisible())) {
//       //   console.warn(`Date picker with id "${value.id}" not found for "${label}"`);
//       //   continue;
//       // }

//       await expect(datePickerTrigger).toBeVisible({ timeout: 7000 });
//       await page.waitForTimeout(1000); // slight wait for date picker to be ready
//       await datePickerTrigger.click({ force: true });
//       const dateLocator = page.locator(`(//div[contains(text(),'${value.day}')])[${value.index}]`);
//       await expect(dateLocator).toBeVisible({ timeout: 7000 });
//       await dateLocator.click();
//       console.log(`Picked date "${value.day}" for "${label}"`);
//       continue;
//     }

//     // Handle Checkbox Array
//     if (
//       Array.isArray(value) &&
//       value.every(v => typeof v === 'object' && 'text' in v && 'matchIndex' in v)
//     ) {
//       for (const valObj of value) {
//         const val = valObj.text;
//         const idx = valObj.matchIndex;
//         const checkbox = page.locator(
//           `xpath=(//*[contains(@*, 'checkbox')]//following::*[normalize-space(text())='${val}'])[${idx}]`
//         );

//         await expect(checkbox).toBeVisible({ timeout: 5000 });
//         await checkbox.click();
//         console.log(`Checked "${val}" under "${label}"`);
//       }
//       continue;
//     }

//     // Handle Tag Input (array of strings)
//     if (
//       Array.isArray(value) && config.type === "tag" &&
//       value.every(v => typeof v === 'string')
//     ) {
//       const tagInput = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[3])[1]`);
//       await expect(tagInput).toBeVisible();
//       for (const val of value) {
//         await tagInput.click();
//         await page.keyboard.type(val);
//         await page.keyboard.press('Enter');
//         console.log(`Entered tag "${val}" for "${label}"`);
//       }
//       continue;
//     }

//     // Handle Dropdown (array of strings)
//     // Handle Dropdown (array of strings with type dropdown)
//     if (
//       Array.isArray(value) &&
//       config.type === "dropdown"
//     ) {
//       const dropdownTrigger = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-dropdown-input-container)[1]`);

//       await expect(dropdownTrigger).toBeVisible({ timeout: 5000 });

//       // Always click to open dropdown first
//       await dropdownTrigger.click();
//       await page.waitForTimeout(1000);

//       for (const val of value) {
//         // Use a more specific locator to match only options inside the dropdown list
//         const optionLocator = page.locator(`xpath=(//mobius-list-item[text()='${val}'])[1]`);

//         if (await optionLocator.count() === 0) {
//           console.warn(`Option "${val}" not found for dropdown "${label}".`);
//           continue;
//         }

//         await expect(optionLocator).toBeVisible({ timeout: 5000 });
//         await optionLocator.scrollIntoViewIfNeeded();
//         await optionLocator.click(); // force click to ensure it works even if hidden
//         await page.waitForTimeout(300);
//       }

//       // Click label to close dropdown
//       const labelClickLocator = page.locator(`xpath=(//*[contains(text(),'${label}')])[1]`);
//       if (await labelClickLocator.count() > 0) {
//         await labelClickLocator.click();
//         await page.waitForTimeout(300);
//         console.log(`Closed dropdown by clicking label "${label}".`);
//       } else {
//         console.warn(`Could not find label "${label}" to close dropdown.`);
//       }

//       console.log(`Selected value(s) for "${label}": ${value.join(', ')}`);
//       continue;
//     }




//     // Handle Input Field
//     const inputLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[2])[1]`);
//     if (!(await inputLocator.isVisible())) {
//       console.warn(`Input field "${label}" not found.`);
//       continue;
//     }
//     await inputLocator.click();
//     await page.keyboard.type(value.toString());

//     // Masking sensitive values
//     let maskedValue = value;
//     if (label.toLowerCase().includes('password')) maskedValue = '****';
//     if (typeof value === 'string' && value.includes('@')) {
//       const [user, domain] = value.split('@');
//       maskedValue = '*'.repeat(user.length) + '@' + domain;
//     }

//     console.log(`Filled "${label}" with "${maskedValue}"`);
//   }

//   // 🔹 Step 3: Submit form
//   const actionButton = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
//   await expect(actionButton).toBeVisible({ timeout: 7000 });
//   await expect(actionButton).toBeEnabled();
//   await actionButton.click();
//   console.log(`Clicked action button: "${buttonText}"`);

//   // 🔹 Step 4: Toast validation
//   if (expectedToast) {
//     const toastLocator = page.locator(`text=${expectedToast}`);
//     await expect(toastLocator).toBeVisible({ timeout: 7000 });
//     console.log(`Toast message shown: "${expectedToast}"`);
//   }
// }12:02

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



//***********************Generic Table Validation ****************************************************
// export async function validateTableHeadersByColumnNames(page, expectedColumns) {
//   for (const columnName of expectedColumns) {
//     const xpath = `(//*[contains(text(),'${columnName}')])[1]`;
//     console.log(`**************`+xpath)

//     const columnLocator = page.locator(`xpath=${xpath}`);
//     await expect(columnLocator).toBeVisible({
//       timeout: 70000,
//     });
//     console.log(`✅ Visible: ${columnName}`);
//   }
// }


/**
 * Validates that each expected column name is visible using your custom XPath strategy.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string[]} expectedColumns - List of expected header names
 */
export async function validateTableHeadersByColumnNames(page, expectedColumns) {
  for (const columnName of expectedColumns) {
    const xpath = `(//*[contains(text(),'${columnName}')])[1]`;
   // console.log(`************** ${xpath}`);

    const columnLocator = page.locator(`xpath=${xpath}`);

    try {
      await columnLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(columnLocator).toBeVisible({
        timeout: 10000,
      });
      console.log(`✅ Visible: ${columnName}`);
    } catch (error) {
      console.error(`❌ Not visible: ${columnName} — Might be hidden or delayed in rendering.`);
      throw error;
    }
  }
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
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('load');        // Waits for the full load event
  await page.waitForLoadState('domcontentloaded'); // Waits until the DOM is parsed

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



//********************Generic invitation sender and email validator.*****************/
// utils/sendAndValidateInvites.js
// export async function sendAndValidateInvites(page, config) {
//   // Dynamically import ESM-compatible packages
//   const dotenv = await import('dotenv');
//   dotenv.config();

//   // Always get credentials
//   const imapUser = process.env.GMAIL_USER;
//   const imapPass = process.env.GMAIL_PASS;

//   const emailList = Array.isArray(config.emails) ? config.emails : [config.emails];
  
//   // Step 1: Fill email inputs
//   for (const email of emailList) {
    
//     const emailInputLocator = page.locator(`xpath=(//*[@data-placeholder="${config.labels.emailInput}"])[1]`);
//     await emailInputLocator.waitFor({ state: "visible", timeout: 10000 });
//     await emailInputLocator.fill(email);
//     await page.keyboard.press("Enter");
//     await page.waitForTimeout(500);
//     console.log(`Entered email: ${email}`);
//   }

//   // Step 2: Click send button
//   const sendButtonLocator = page.locator(`xpath=(//*[text() = "${config.labels.sendButton}"])[1]`);
//   await sendButtonLocator.waitFor({ state: "visible", timeout: 10000 });
//   await sendButtonLocator.click();
//   console.log(`Clicked send button`);

//   // Step 3: Wait for success modal
//   const successModalLocator = page.locator(`xpath=(//*[@*="${config.labels.successModal}"])[1]`);
//   await successModalLocator.waitFor({ state: "visible", timeout: 15000 });
//   console.log(`Success modal appeared`);

//   // Step 4: Decide whether to use Gmail IMAP or Mailinator
//   if (imapUser && imapPass) {
//     console.log(`Detected Gmail credentials, using IMAP...`);
//     const { default: Imap } = await import('imap');
//     const { simpleParser } = await import('mailparser');

//     const imap = new Imap({
//       user: imapUser,
//       password: imapPass,
//       host: "imap.gmail.com",
//       port: 993,
//       tls: true,
//       tlsOptions: { rejectUnauthorized: false },
//     });

//     function openInbox(cb) {
//       imap.openBox("INBOX", true, cb);
//     }

//     return new Promise((resolve, reject) => {
//       imap.once("ready", () => {
//         openInbox((err) => {
//           if (err) {
//             imap.end();
//             return reject(err);
//           }

//           console.log(`Searching inbox for subject: "${config.subject}"`);
//           const criteria = ["UNSEEN", ["SUBJECT", config.subject]];

//           imap.search(criteria, (err, results) => {
//             if (err) {
//               imap.end();
//               return reject(err);
//             }
//             if (!results.length) {
//               imap.end();
//               return reject(new Error(`No emails found with subject "${config.subject}"`));
//             }

//             const f = imap.fetch(results, { bodies: "" });
//             let found = false;

//             f.on("message", (msg) => {
//               msg.on("body", (stream) => {
//                 simpleParser(stream, (err, mail) => {
//                   if (err) return;
//                   console.log(`Email received: "${mail.subject}"`);
//                   found = true;
//                 });
//               });
//             });

//             f.once("end", () => {
//               imap.end();
//               if (found) {
//                 resolve(`Email with subject "${config.subject}" received.`);
//               } else {
//                 reject(new Error(`No matching email body parsed.`));
//               }
//             });
//           });
//         });
//       });

//       imap.once("error", (err) => reject(err));
//       imap.connect();
//     });
//   } else {
//     console.log(`No Gmail credentials found. Falling back to Mailinator...`);
// await new Promise((r) => setTimeout(r, 10000)); // Wait for delivery

// const recipient = emailList[0];
// const inbox = recipient.split("@")[0];
// const apiUrl = `https://www.mailinator.com/fetch_public?to=${inbox}`;

// const response = await fetch(apiUrl);
// if (!response.ok) {
//   throw new Error(`Mailinator fetch failed: ${response.status}`);
// }

// const data = await response.json();
// const messages = data?.messages;
// if (!Array.isArray(messages)) {
//   console.error('Invalid Mailinator response:', data);
//   throw new Error(`Mailinator did not return a messages array`);
// }

// const message = messages.find((msg) => msg.subject.includes(config.subject));
// if (!message) {
//   throw new Error(`No email found in Mailinator inbox "${inbox}" with subject containing "${config.subject}"`);
// }

// console.log(`Mailinator email received: "${message.subject}"`);
// return `Mailinator: Email with subject "${message.subject}" received.`;

//   }
// }
export async function sendAndValidateInvites(page, config) {
  const dotenv = await import('dotenv');
  dotenv.config();

  const { GMAIL_USER, GMAIL_PASS } = process.env;
  const emailList = Array.isArray(config.emails) ? config.emails : [config.emails];
  const subject = config.subject || "Invitation";
  const { emailInput, sendButton, successModal } = config.labels;

  // Step 1: Fill all email inputs
  for (const email of emailList) {
    const input = page.locator(`xpath=(//*[@data-placeholder="${emailInput}"])[1]`);
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill(email);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    console.log(`✅ Entered email: ${email}`);
  }

<<<<<<< HEAD
  // Step 2: Click Send Invites button
  const sendBtn = page.locator(`xpath=(//*[text() = "${sendButton}"])[1]`);
  await sendBtn.waitFor({ state: "visible", timeout: 10000 });
  await sendBtn.click();
  console.log("✅ Clicked send button");
=======














  // Step 2: Click send button
  const sendButtonLocator = page.locator(`xpath=(//*[contains(normalize-space(.), "${config.labels.sendButton}")]//ancestor::button)[1]`);
  await sendButtonLocator.waitFor({ state: "visible", timeout: 10000 });
  await sendButtonLocator.click();
  console.log(`✅ Clicked send button`);
>>>>>>> b8e9c73a6477e96ef9dea6af53513d939d877aa9

  // Step 3: Wait for success modal
  const modal = page.locator(`xpath=(//*[@*="${successModal}"])[1]`);
  await modal.waitFor({ state: "visible", timeout: 15000 });
  console.log("✅ Invite success modal appeared");

  // Step 4: Validate email delivery for each email
  for (const email of emailList) {
    console.log(`📨 Validating delivery for: ${email}`);

    if (GMAIL_USER && GMAIL_PASS && email.includes(GMAIL_USER)) {
      console.log("📬 Using Gmail IMAP...");
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

            const criteria = ["UNSEEN", ["SUBJECT", subject]];
            imap.search(criteria, (err, results) => {
              if (err || !results.length) return reject(new Error(`No emails found for subject: ${subject}`));

              const f = imap.fetch(results, { bodies: "" });
              let found = false;

              f.on("message", (msg) => {
                msg.on("body", (stream) => {
                  simpleParser(stream, (err, mail) => {
                    if (!err && mail.subject.includes(subject)) {
                      console.log(`✅ Gmail: Email received for ${email}: "${mail.subject}"`);
                      found = true;
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
    }

    else if (email.includes("@mailinator.com")) {
  console.log("📬 Using Mailinator fallback (HTML scrape)...");
  await new Promise((r) => setTimeout(r, 10000)); // wait for email to arrive

  const inbox = email.split("@")[0];
  const inboxUrl = `https://www.mailinator.com/v3/index.jsp?zone=public&query=${inbox}#/#inboxpane`;

  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(inboxUrl);
  await page.waitForSelector('table#inboxpane', { timeout: 15000 });

  const subjects = await page.$$eval('table#inboxpane tbody tr td:nth-child(3)', nodes =>
    nodes.map(n => n.innerText.trim())
  );

  await browser.close();

  const match = subjects.find(s => s.includes(subject));
  if (!match) {
    throw new Error(`❌ Mailinator: No message found with subject: "${subject}"`);
  }

  console.log(`✅ Mailinator: Email received with subject: "${match}"`);
}


    else {
      console.warn(`⚠️ Skipping validation for unsupported email domain: ${email}`);
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
