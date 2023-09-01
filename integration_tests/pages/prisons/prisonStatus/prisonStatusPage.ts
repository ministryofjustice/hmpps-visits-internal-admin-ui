import Page, { PageElement } from '../../page'

export default class prisonStatusPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getStatusTab().should('have.attr', 'aria-current', 'page')
  }

  prisonStatusLabel = (): PageElement => cy.get('[data-test=prison-status]')

  // switch status Activate <-> Deactivate
  switchStatus = (): PageElement => cy.get('[data-test=prison-change-status-form]')

  statusTab = (): PageElement => cy.get('.moj-sub-navigation__item').last()
}
