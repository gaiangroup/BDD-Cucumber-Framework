@filters
Feature: Filters in My Organization

  Background:
    Given User navigate to the login page
    When User login with valid credentials and successful login

  @filters
  Scenario: Filter Infra Structure and  Roles & Privileges by applying filters
      Then User switches to My Organization tab
    Then User allows location access
    And User clicks on Role tab
    Given User apply filters for "Roles & Privileges" and verify results of Roles & Privileges
    And User switches to My Infra tab
    Then User allows location access
    Given User apply filters for "Infra Structure" and verify results of Infra Structure
