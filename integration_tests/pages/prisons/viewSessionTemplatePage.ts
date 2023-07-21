import Page, { PageElement } from '../page'

export default class ViewSessionTemplatePage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string, reference: string) => cy.visit(`/prisons/${prisonCode}/session-templates/${reference}`)

  sessionTemplateStatusLabel = (): PageElement => cy.get('.test-template-status-value')

  // switch status Activate <-> Deactivate
  getStatusSwitchButton = (): PageElement => cy.get('[data-test=session-template-change-status-button]')

  // delete session template button
  getDeleteSessionTemplateButton = (): PageElement => cy.get('[data-test=session-template-delete-button]')

  successMessage = (): PageElement => cy.get('.moj-banner__message')

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')

  statusTab = (): PageElement => cy.get('.moj-sub-navigation__item').last()
}
