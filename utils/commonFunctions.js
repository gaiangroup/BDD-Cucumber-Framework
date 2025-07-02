import { expect } from '@playwright/test';



// ************************Handle Custom Checkboxes************************
export async function handleGenericForm(page, formJson) {
  const fields = formJson.fields || {};
  const buttonText = formJson.buttonText;
  const expectedToast = formJson.expectedToast || null;
  const requiredError = formJson.requiredError || null;
  const matchIndex = formJson.matchIndex || 1;

  // 🔹 Step 1: Validate required error before filling
  if (requiredError) { 
    const submitBtn = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      console.log(`Clicked on action button (pre-submit): "${buttonText}"`);

      const errorLocator = page.locator(`text=${requiredError}`);
      try {
        await expect(errorLocator).toBeVisible({ timeout: 3000 });
        console.log(`Required validation message shown: "${requiredError}"`);
      } catch {
        console.warn(`Expected required error message not found.`);
      }
    }
  }

  // 🔹 Step 2: Fill form fields
  for (const [label, config] of Object.entries(fields)) {
    const { value } = config;

    // Handle Date Picker
    if (
      value && config.type === "dateselection" &&
      typeof value === 'object' &&
      'id' in value &&
      'day' in value &&
      'index' in value
    ) {

      const datePickerTrigger = page.locator(`(//*[text()='${label}']//following::mobius-date-picker)[1]`);
      // if (!(await datePickerTrigger.isVisible())) {
      //   console.warn(`Date picker with id "${value.id}" not found for "${label}"`);
      //   continue;
      // }

      await expect(datePickerTrigger).toBeVisible({ timeout: 7000 });
      await page.waitForTimeout(1000); // slight wait for date picker to be ready
      await datePickerTrigger.click({ force: true });
      const dateLocator = page.locator(`(//div[contains(text(),'${value.day}')])[${value.index}]`);
      await expect(dateLocator).toBeVisible({ timeout: 7000 });
      await dateLocator.click();
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

        await expect(checkbox).toBeVisible({ timeout: 5000 });
        await checkbox.click();
        console.log(`Checked "${val}" under "${label}"`);
      }
      continue;
    }

    // Handle Tag Input (array of strings)
    if (
      Array.isArray(value) && config.type === "tag" &&
      value.every(v => typeof v === 'string')
    ) {
      const tagInput = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[3])[1]`);
      await expect(tagInput).toBeVisible();
      for (const val of value) {
        await tagInput.click();
        await page.keyboard.type(val);
        await page.keyboard.press('Enter');
        console.log(`Entered tag "${val}" for "${label}"`);
      }
      continue;
    }

    // Handle Dropdown (array of strings)
    // Handle Dropdown (array of strings with type dropdown)
    if (
      Array.isArray(value) &&
      config.type === "dropdown"
    ) {
      const dropdownTrigger = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-dropdown-input-container)[1]`);

      await expect(dropdownTrigger).toBeVisible({ timeout: 5000 });

      // Always click to open dropdown first
      await dropdownTrigger.click();
      //await page.waitForTimeout(500);

      for (const val of value) {
        // Use a more specific locator to match only options inside the dropdown list
        const optionLocator = page.locator(`xpath=(//mobius-list-item[text()='${val}'])[1]`);

        if (await optionLocator.count() === 0) {
          console.warn(`Option "${val}" not found for dropdown "${label}".`);
          continue;
        }

        await expect(optionLocator).toBeVisible({ timeout: 5000 });
        await optionLocator.scrollIntoViewIfNeeded();
        await optionLocator.click(); // force click to ensure it works even if hidden
        await page.waitForTimeout(300);
      }

      // Click label to close dropdown
      const labelClickLocator = page.locator(`xpath=(//*[contains(text(),'${label}')])[1]`);
      if (await labelClickLocator.count() > 0) {
        await labelClickLocator.click();
        await page.waitForTimeout(300);
        console.log(`Closed dropdown by clicking label "${label}".`);
      } else {
        console.warn(`Could not find label "${label}" to close dropdown.`);
      }

      console.log(`Selected value(s) for "${label}": ${value.join(', ')}`);
      continue;
    }




    // Handle Input Field
    const inputLocator = page.locator(`xpath=(//*[contains(text(),'${label}')]//following::mobius-div[2])[1]`);
    if (!(await inputLocator.isVisible())) {
      console.warn(`Input field "${label}" not found.`);
      continue;
    }
    await inputLocator.click();
    await page.keyboard.type(value.toString());

    // Masking sensitive values
    let maskedValue = value;
    if (label.toLowerCase().includes('password')) maskedValue = '****';
    if (typeof value === 'string' && value.includes('@')) {
      const [user, domain] = value.split('@');
      maskedValue = '*'.repeat(user.length) + '@' + domain;
    }

    console.log(`Filled "${label}" with "${maskedValue}"`);
  }

  // 🔹 Step 3: Submit form
  const actionButton = page.locator(`xpath=(//*[contains(text(),'${buttonText}')])[${matchIndex}]`);
  await expect(actionButton).toBeVisible({ timeout: 7000 });
  await expect(actionButton).toBeEnabled();
  await actionButton.click();
  console.log(`Clicked action button: "${buttonText}"`);

  // 🔹 Step 4: Toast validation
  if (expectedToast) {
    const toastLocator = page.locator(`text=${expectedToast}`);
    await expect(toastLocator).toBeVisible({ timeout: 7000 });
    console.log(`Toast message shown: "${expectedToast}"`);
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
    const allButtons = await page.locator('//mobius-button').allTextContents();
    console.log('Available buttons on screen:', allButtons);
    return;
  }

  try {
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await expect(button).toBeEnabled({ timeout: 5000 });
    await button.click();
    console.log(`Clicked on button: "${label}"`);
  } catch (error) {
    console.error(`Failed to click button "${label}":`, error.message);
    throw error;
  }
}
