@project
Feature: project creation flow

    Background: Login
        Given User navigate to the login page
        When User login with valid credentials and successful login

    Scenario: Login and Create and Delete project
        And User should switch to projects tab
        And User clicks Add Project button
        Then User should fill all the required details to create project
        Then User should click on three dot menu and choose Delete action
        Then User should see able to delete the Project successfully