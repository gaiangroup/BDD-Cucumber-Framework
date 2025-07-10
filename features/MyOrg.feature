@org_validations
Feature: My Organization module validations

   @roleCreation
   Scenario: Verify Role Creation
      Given User navigate to the login page
      When User login with valid credentials and successful login
      And User switches to My Organization tab
      And User allows location access
      And User clicks on Role tab
      And User clicks on New Role button
      Then User should see the role creation form and fill in the details

   @deleteRole
   Scenario: Verify Delete Role
      Given User navigate to the login page
      When User login with valid credentials and successful login
      And User switches to My Organization tab
      And User allows location access
      And User clicks on Role tab
      And User performing scroll action to the bottom
      And User clicks on three dot action menu to delete Role
      Then User should see able to delete the role successfully

   @teamCreation
   Scenario: Verify Team Creation
      Given User navigate to the login page
      When User login with valid credentials and successful login
      And User switches to My Organization tab
      And User allows location access
      And User clicks on Teams tab
      And User clicks on Add Team button
      Then User should see the Team creation form and fill in the details

   @deleteTeam
   Scenario: Verify Delete Team
      Given User navigate to the login page
      When User login with valid credentials and successful login
      And User switches to My Organization tab
      And User allows location access
      And User clicks on Teams tab
      And User performing scroll action to the bottom
      And User clicks on three dot action menu to delete Team
      Then User should see able to delete the Team successfully

   @userInvitation
   Scenario: Verify User Invitation and Subject Validation
      Given User navigate to the login page
      When User login with valid credentials and successful login
      And User switches to My Organization tab
      And User clicks on Users tab
      And User allows location access
      And User clicks on Invite Users button
      Then User should send the invitation and validate the subject



