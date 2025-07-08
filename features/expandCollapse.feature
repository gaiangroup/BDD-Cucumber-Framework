Feature: Expand/Collapse Interactions
  As a QA Engineer
  I want to automate expand/collapse of UI elements dynamically
  So that I can ensure the UI behaves as expected

  @expandCollapse
  Scenario: User expands and collapses a UI section
    Given User navigates to the application
    When User expands the section "Dashboard Panel"
    Then The section "Dashboard Panel" should be expanded

  @expandCollapse
  Scenario: User collapses the same UI section
    Given User navigates to the application
    When User collapses the section "Dashboard Panel"
    Then The section "Dashboard Panel" should be collapsed
