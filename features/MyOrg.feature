@org_validations
Feature: My Organization validations

  Scenario: Role Creation
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User switch to My Organization tab
    Then User click on Role tab
    Then User click on New Role button
    And User should see role creation form and fill in the details




