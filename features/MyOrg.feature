@org_validations
Feature: My Organization validations

   Scenario: Role Creation
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User switches to My Organization tab
    And User allows location access
    And User clicks on Role tab
    And User clicks on New Role button
    Then User should see the role creation form and fill in the details

@teamCreation
   Scenario: Team Creation
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User switches to My Organization tab
    And User allows location access
    And User clicks on Teams tab
    And User clicks on Add Team button
    Then User should see the Team creation form and fill in the details

@userInvitation
   Scenario: User Invitation and Subject Validation
    Given User navigate to the login page
    When User login with valid credentials and successful login
    And User switches to My Organization tab
    And User allows location access
    And User clicks on Users tab
    And User clicks on Invite Users button
    Then User should send the invitation and validate the subject



