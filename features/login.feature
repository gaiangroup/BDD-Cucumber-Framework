@login
Feature: Validations of Login functionality

  @positiveScenario
  Scenario: Verify login functionality for a valid user
    Given User navigate to the login page
    And User verifies all input field labels are correct
    And User verifies placeholder text for each field is correct
    When User login with valid credentials and successful login
    Then User should see the Dashboard as home page

  @NegativeScenario
  Scenario: Verify login functionality with invalid credentials
    Given User navigate to the login page
    Then User attempts login with an invalid email and invalid password,and verifies the error
    Then User attempts login with a valid email and an invalid password,and verifies the error



