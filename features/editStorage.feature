@editStorage
Feature: Edit Storage functionality in My Infra

  Scenario: Edit existing storage under infrastructure
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User should see the Dashboard as home page

    And User navigates to "My Infra" and selects infrastructure "RailTel"
    And User goes to the "Storage" tab and selects model "test1"
    And User edits the storage details using data from "editStorageData.json"
    Then A toast message "Storage is updated Successfully" should appear