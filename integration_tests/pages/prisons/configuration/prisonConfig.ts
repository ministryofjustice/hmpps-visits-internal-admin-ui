import Page, { PageElement } from '../../page'

export default class PrisonConfigPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getConfigTab().should('have.attr', 'aria-current', 'page')
  }

  static goTo(prisonCode: string): PrisonConfigPage {
    cy.visit(`/prisons/${prisonCode}/configuration`)
    return Page.verifyOnPage(PrisonConfigPage)
  }

  prisonStatusLabel = (): PageElement => cy.get('[data-test=prison-status]')

  // Booking window
  getMinBookingWindow = (): PageElement => cy.get('.test-policy-notice-days-min')

  getMaxBookingWindow = (): PageElement => cy.get('.test-policy-notice-days-max')

  editBookingWindow = (): void => {
    cy.get('[data-test="booking-window-edit"]').contains('Edit booking window').click()
  }

  // Contact details
  getEmail = (): PageElement => cy.get('.test-contact-email')

  getPhone = (): PageElement => cy.get('.test-contact-phone')

  getWebAddress = (): PageElement => cy.get('.test-contact-web')

  addContactDetails = (): void => {
    cy.get('[data-test="contact-details-add"]').click()
  }

  editContactDetails = (): void => {
    cy.get('[data-test="contact-details-edit"]').click()
  }

  // Visitor configuration
  getMaxTotalVisitors = (): PageElement => cy.get('.test-max-total-visitors')

  getMaxAdultVisitors = (): PageElement => cy.get('.test-max-adult-visitors')

  getMaxChildVisitors = (): PageElement => cy.get('.test-max-child-visitors')

  getAdultAge = (): PageElement => cy.get('.test-adult-age')

  editVisitorConfig = (): void => {
    cy.get('[data-test="visitor-config-edit"]').click()
  }

  // Status
  activatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Activate').click()
  }

  deactivatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Deactivate').click()
  }
}
