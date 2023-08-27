import type { PageElement } from '../../page'
import PrisonPage from '../../prisonPage'

export default class prisonStatusPage extends PrisonPage {
  constructor() {
    super('Hewell (HMP)')
  }

  prisonStatusLabel = (): PageElement => cy.get('[data-test=prison-status]')

  // switch status Activate <-> Deactivate
  switchStatus = (): PageElement => cy.get('[data-test=prison-change-status-form]')

  successMessage = (): PageElement => cy.get('.moj-banner__message')

  statusTab = (): PageElement => cy.get('.moj-sub-navigation__item').last()
}
