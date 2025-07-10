# @table_validations
# Feature: Validate Table Headers

#   Scenario: Validate Roles & Privileges table
#     Given User navigate to the login page
#     When User login with valid credentials and successful login
#     Then User switches to My Organization tab
#     Then User allows location access
#     Then User clicks on "Roles & Privileges" tab and verifies the following table headers:
#    | Header Column Names| 
#       | Role Type     |
#       | Description   |
#       | Role          |
#       | Custom Roles  |




#   Scenario: Validate Users table
#     Given User navigate to the login page
#     When User login with valid credentials and successful login
#     Then User switches to My Organization tab
#     Then User allows location access
#     Then User clicks on "Users" tab and verifies the following table headers:
#    | Header Column Names| 
#       | Name          |
#       | Role          |
#       | Designation   |
#       | Email         |
#       | Phone Number  |

#   Scenario: Validate Teams table
#     Given User navigate to the login page
#     When User login with valid credentials and successful login
#     Then User switches to My Organization tab
#     Then User allows location access
#     Then User clicks on "Teams" tab and verifies the following table headers:
#    | Header Column Names| 
#       | Team Name     |
#       | Description   |
#       | Members       |
#       | Tags          |


@table_validations
Feature: Validate Roles & Privileges , Users ,Teams  Table Headers and Rows from JSON
Background: Login and Do validation on Tables

Given User navigate to the login page
    When User login with valid credentials and successful login 

  Scenario: Validate Roles & Privileges , Users , Teams table headers and rows from JSON
    
    Then User switches to My Organization tab
    Then User allows location access
    Then User clicks on "Roles & Privileges" tab and validates the table

  # Scenario: Validate Users table
    
    Then User switches to My Organization tab
    Then User allows location access
    Then User clicks on "Users" tab and validates the table

  # Scenario: Validate Teams table
    
    Then User switches to My Organization tab
    Then User allows location access
    Then User clicks on "Teams" tab and validates the table
