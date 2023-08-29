import Page, { PageElement } from './page'

export default class PrisonPage extends Page {
  // Sub-navigation sections
  selectSessionTemplatesTab = (): PageElement => cy.get('[data-test="tab-session-templates"]').click()

  selectExcludedDatesTab = (): PageElement => cy.get('[data-test="tab-excluded-dates"]').click()

  selectCategoryGroupsTab = (): PageElement => cy.get('[data-test="tab-category-groups"]').click()

  selectIncentiveGroupsTab = (): PageElement => cy.get('[data-test="tab-incentive-groups"]').click()

  selectLocationGroupsTab = (): PageElement => cy.get('[data-test="tab-location-groups"]').click()

  selectStatusTab = (): PageElement => cy.get('[data-test="tab-status"]').click()
}
