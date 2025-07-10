@suite_1
Feature: Testing Suite functionality

  Scenario: Successful login
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User should see the Dashboard as home page
    And User switches to My Organization tab
      And User allows location access
      And User clicks on Role tab
      And User clicks on New Role button
      Then User should see the role creation form and fill in the details
  Scenario: Unsuccessful login
    Given User navigate to the login page
    Then User login with invalid credentials

  Scenario: Role Creation
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User switches to My Organization tab
    And User allows location access
    And User clicks on Role tab
    And User clicks on New Role button
    Then User should see the role creation form and fill in the details
