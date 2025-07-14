@filters
Feature: Filters in My Organization

  Background:
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User switches to My Organization tab

  @filters
  Scenario: Filter user list by name, email, role
      And User clicks on Users tab
        Then User allows location access
    Given I apply filters for "UserList" and verify results

