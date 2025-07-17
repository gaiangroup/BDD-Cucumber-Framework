@expandCollapse
Feature: Chatbot Expand/Collapse Interactions

  Scenario: User toggles the chatbot panel to expand and collapse
    Given User navigate to the login page
    When User login with valid credentials and successful login
    When User opens the chatbot panel
    When User expands the "chatbotPanel"
    Then Section should be expanded for "chatbotPanel"
    When User collapses the "chatbotPanel"
    Then Section should be collapsed for "chatbotPanel"
