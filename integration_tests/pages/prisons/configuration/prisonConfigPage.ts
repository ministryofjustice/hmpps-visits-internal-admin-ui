import Page, { PageElement } from '../../page'

export default class prisonConfigPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getConfigTab().should('have.attr', 'aria-current', 'page')
  }

  prisonStatusLabel = (): PageElement => cy.get('[data-test=prison-status]')

  // switch status Activate <-> Deactivate
  switchStatus = (): PageElement => cy.get('[data-test=prison-change-status-form]')

  statusTab = (): PageElement => cy.get('.moj-sub-navigation__item').last()

  prisonEmail = (): PageElement => cy.get('[data-test=prison-config-email]')

  prisonPhone = (): PageElement => cy.get('[data-test=prison-config-phone]')

  prisonWebsite = (): PageElement => cy.get('[data-test=prison-config-website]')
}
