@table_validations
Feature: Validate Table Headers
@roles
  Scenario: Validate Roles & Privileges table
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User switches to My Organization tab
    Then User allows location access
    Then User clicks on "Roles & Privileges" tab and verifies the following table headers:
      | Role Type     |
      | Description   |
      | Role          |
      | Custom Roles  |




  Scenario: Validate Users table
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User switches to My Organization tab
    Then User allows location access

    Then User clicks on "Users" tab and verifies the following table headers:
      | Name          |
      | Role          |
      | Designation   |
      | Email         |
      | Phone Number  |

  Scenario: Validate Teams table
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User switches to My Organization tab
    Then User allows location access

    Then User clicks on "Teams" tab and verifies the following table headers:
      | Team Name     |
      | Description   |
      | Tags          |
      | Members       |
