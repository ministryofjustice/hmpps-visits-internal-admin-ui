import type { PageElement } from '../../page'
import PrisonPage from '../../prisonPage'

export default class ViewSessionTemplatePage extends PrisonPage {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string, reference: string) => cy.visit(`/prisons/${prisonCode}/session-templates/${reference}`)

  sessionTemplateStatusLabel = (): PageElement => cy.get('.test-template-status-value')

  // switch status Activate <-> Deactivate
  getStatusSwitchButton = (): PageElement => cy.get('[data-test=session-template-change-status-button]')

  // delete session template button
  getDeleteSessionTemplateButton = (): PageElement => cy.get('[data-test=session-template-delete-button]')

  statusTab = (): PageElement => cy.get('.moj-sub-navigation__item').last()
}
