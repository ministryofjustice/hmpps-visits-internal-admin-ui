import Page, { PageElement } from '../../page'

export default class PrisonBookingWindowPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  getMinBookingWindow = (): PageElement => cy.get('#policyNoticeDaysMin')

  getMaxBookingWindow = (): PageElement => cy.get('#policyNoticeDaysMax')

  enterMinBookingWindow = (value: string): void => {
    cy.get('#policyNoticeDaysMin').clear()
    cy.get('#policyNoticeDaysMin').type(value)
  }

  enterMaxBookingWindow = (value: string): void => {
    cy.get('#policyNoticeDaysMax').clear()
    cy.get('#policyNoticeDaysMax').type(value)
  }

  submit = (): void => {
    cy.get('[data-test="submit"]').contains('Update').click()
  }
}
