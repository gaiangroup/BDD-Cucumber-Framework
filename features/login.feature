@login
Feature: Login functionality

  Scenario: Successful login
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then User should see the Dashboard as home page

    @invalidredentials
  Scenario: Unsuccessful login
    Given User navigate to the login page
    Then User login with invalid credentials



