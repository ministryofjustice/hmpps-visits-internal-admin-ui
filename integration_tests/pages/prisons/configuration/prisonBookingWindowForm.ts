import Page, { PageElement } from '../../page'

export default class PrisonBookingWindowPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  static goTo(prisonCode: string): PrisonBookingWindowPage {
    cy.visit(`/prisons/${prisonCode}/configuration/booking-window/edit`)
    return Page.verifyOnPage(PrisonBookingWindowPage)
  }

  getMinBookingWindow = (): PageElement => this.getById('policyNoticeDaysMin')

  getMaxBookingWindow = (): PageElement => this.getById('policyNoticeDaysMax')

  submit = (): void => {
    cy.get('[data-test="submit"]').contains('Update').click()
  }
}
