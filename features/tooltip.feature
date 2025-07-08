@tooltip
Feature: Tooltip on Hover

  Scenario: User sees correct tooltip text when hovering over Dashboard menu
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then Tooltip should be validated for "DashboardMenu"

