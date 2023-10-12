import Page, { PageElement } from '../../page'

export default class PrisonStatusPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getStatusTab().should('have.attr', 'aria-current', 'page')
  }

  prisonStatusLabel = (): PageElement => cy.get('[data-test=prison-status]')

  activatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Activate').click()
  }

  deactivatePrison = (): void => {
    cy.get('[data-test="prison-change-status"]').contains('Deactivate').click()
  }
}
