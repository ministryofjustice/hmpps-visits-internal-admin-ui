import { UserClientType } from '../../../../server/data/visitSchedulerApiTypes'
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

  prisonClientsLabel = (): PageElement => cy.get('[data-test=prison-clients]')

  // Booking windows
  getMinBookingWindow = (service: UserClientType): PageElement =>
    cy.get(`[data-test="min-days-${service.toLocaleLowerCase()}"]`)

  getMaxBookingWindow = (service: UserClientType): PageElement =>
    cy.get(`[data-test="max-days-${service.toLocaleLowerCase()}"]`)

  editBookingWindows = (): void => {
    cy.get('[data-test="booking-windows-edit"]').contains('Edit booking windows').click()
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

  // Enabled services
  getService = (service: UserClientType): PageElement => cy.get(`input[name=enabledServices][value=${service}]`)

  activateService = (service: UserClientType): void => {
    cy.get(`input[name=enabledServices][value=${service}]`).check()
  }

  deactivateService = (service: UserClientType): void => {
    cy.get(`input[name=enabledServices][value=${service}]`).uncheck()
  }

  updateEnabledServices = (): void => {
    cy.get('[data-test="update-enabled-services"]').click()
  }

  // Visitor configuration
  getMaxTotalVisitors = (): PageElement => cy.get('.test-max-total-visitors')

  getMaxAdultVisitors = (): PageElement => cy.get('.test-max-adult-visitors')

  getMaxChildVisitors = (): PageElement => cy.get('.test-max-child-visitors')

  getAdultAge = (): PageElement => cy.get('.test-adult-age')

  editVisitorConfig = (): void => {
    cy.get('[data-test="visitor-config-edit"]').click()
  }

  // Visit allocation balances
  getNegativeBalanceCount = (): PageElement => cy.get('[data-test=negative-balance-count]')

  resetNegativeBalancesButton = (): PageElement => cy.get('[data-test="visit-allocation-reset"]')

  // Status
  activatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Activate').click()
  }

  deactivatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Deactivate').click()
  }
}
