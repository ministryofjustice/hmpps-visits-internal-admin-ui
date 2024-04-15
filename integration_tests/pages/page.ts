export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  static verifyOnPageTitle = <T>(constructor: new (title: string) => T, title?: string): T => {
    return new constructor(title)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  isAtPath = (uri: string): void => {
    cy.location('pathname').should('be.equal', uri)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  successMessage = (): PageElement => cy.get('.moj-banner__message')

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')

  // Sub-navigation sections
  getSessionTemplatesTab = (): PageElement => cy.get('[data-test="tab-session-templates"]')

  getExcludedDatesTab = (): PageElement => cy.get('[data-test="tab-excluded-dates"]')

  getCategoryGroupsTab = (): PageElement => cy.get('[data-test="tab-category-groups"]')

  getIncentiveGroupsTab = (): PageElement => cy.get('[data-test="tab-incentive-groups"]')

  getLocationGroupsTab = (): PageElement => cy.get('[data-test="tab-location-groups"]')

  getConfigTab = (): PageElement => cy.get('[data-test="tab-config"]')
}
