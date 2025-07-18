# BDD-Cucumber-Framework (Playwright + Cucumber.js)

This project is a robust end-to-end automation framework built using **Playwright** and **Cucumber.js**, following **BDD principles**. It supports **reusable step definitions**, **API validation**, **modular test data handling**, and **custom report generation**.

---

## 🚀 Features

* ✅ **BDD Support** using Cucumber (Gherkin syntax)
* 🧪 **UI + API Testing** using Playwright and request interception
* 📋 **Modular test data** management via JSON files
* 📸 **Screenshots & Reports** on failure
* 📂 **HTML and JSON reports** with timestamps

### 🌐 **Full Web UI Interaction Support**

* **Location permission automation**
* **Popup and modal handling**
* **Dynamic filter validations**
* **Tables, dropdowns, and input fields**
* **Calendar/date picker interaction**
* **Tab and navigation handling**

---

## Project Structure

```
BDD-CUCUMBER-FRAMEWORK/
├── features/                   # Feature files (Gherkin syntax)
│   ├── tableValidations.feature
│   └── testSuite1.feature
├── step_definitions/          # Step definitions linked to features
│   └── each_page_steps.js
├── testData/                  # JSON files with test data
│   ├── login.json
│   ├── filter.json
│   └── ...
├── utils/                     # Common helper functions
│   ├── common.js
│   └── ......
├── reports/                   # HTML and JSON reports
├── step_runner/               # Custom runner script for tagged execution
│   └── runner.js
├── generate-report.js         # Merges and generates HTML reports
├── generate-single-html.js    # Standalone report generation
├── package.json
└── README.md                  # Project documentation
```

---

## Installation

```bash
# Clone the repo
git clone https://your-repo-url.git
cd BDD-CUCUMBER-FRAMEWORK

# Install dependencies
npm install

# Run all tests
node step_runner/runner.js

# Run specific tag
TAG=@filters node step_runner/runner.js
```

---

## Sample Feature Syntax

```gherkin
Feature: Login Validation

  Scenario: Valid user login
    Given User navigate to the login page
    When validate API "Login" is called with correct request and response
    Then User should see the Dashboard as home page
```

---

## Reports

* ✅ **JSON report:** `reports/json_reports/`
* ✅ **HTML report:** `reports/cucumber_reports/`
* ✅ **Latest report:** `reports/latest-json/`

---

## Author

**Maintained by:** QA Automation Team
**Organization:** Gaian Solutions

---

## Contact

**Note:** If you need more information, feel free to reach out at **[qateam@gaiansolutions.com](mailto:qateam@gaiansolutions.com)**
