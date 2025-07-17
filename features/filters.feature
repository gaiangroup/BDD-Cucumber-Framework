@filters
Feature: Filters in My Organization

  Background:
    Given User navigate to the login page
    When validate API "Login" is called with correct request and response
    Then User should see the Dashboard as home page
  @filters
  Scenario: Filter Infra Structure and  Roles & Privileges by applying filters
    Then User switches to My Organization tab
    Then User allows location access
    And User clicks on Role tab
    Given User apply filters for "Roles & Privileges" and verify results of Roles & Privileges
    And User switches to My Infra tab
    Then User allows location access
    Then User apply filters for "Infra Structure" and verify results of Infra Structure
    Then validate API "Infra Structure" is called with correct request and response for Infra Structure
