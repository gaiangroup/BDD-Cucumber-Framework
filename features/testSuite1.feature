@suite_1
Feature: Testing User flow of RUNRUN

  Background: Login
    Given User navigate to the login page
    When User login with valid credentials and successful login

  Scenario: Login and perform CRUD operations as a user

    Then User should see the Dashboard as home page
    And User switches to My Organization tab
    And User allows location access
    Then User clicks on "Users" tab and validates the table
    Then User clicks on "Teams" tab and validates the table
    And User clicks on Role tab
    And User clicks on New Role button
    Then User should see the role creation form and fill in the details
    And User clicks on three dot action menu to delete Role
    Then User should see able to delete the role successfully
    Then User clicks on "Roles & Privileges" tab and validates the table
    And User clicks on Teams tab
    And User clicks on Add Team button
    Then User should see the Team creation form and fill in the details
    And User performing scroll action to the bottom
    And User clicks on Users tab
    And User clicks on Invite Users button
    Then User should send the invitation and validate the subject
    Then User should click on the invite popup
    Then User clicks on "My Infra" tab and validates the table infra
    # Then User clicks on "Customers" tab and validates the table Customers
    And User should switch to projects tab
    And User clicks Add Project button
    Then User should fill all the required details to create project
    Then User should click on three dot menu and choose Delete action
    Then User should see able to delete the Project successfully
    And User switches to My Organization tab
    And User clicks on Teams tab
    And User performing scroll action to the bottom
    And User clicks on three dot action menu to delete Team
    Then User should see able to delete the Team successfully



