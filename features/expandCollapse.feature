@expandCollapse
Feature: Chatbot Expand/Collapse Interactions

  Scenario: User expands and collapses the chatbot panel from dashboard
    Given User navigate to the login page
    When User login with valid credentials and successful login
    Then Section should be expanded for "chatbotPanel"
    And Section should be collapsed for "chatbotPanel"
