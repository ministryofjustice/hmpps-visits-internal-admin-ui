import Page, { PageElement } from '../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string) => cy.visit(`/prisons/${prisonCode}/session-templates`)

  statusTab = (): PageElement => cy.get('[data-test=tab-status]')

  selectTemplatePrison = (prisonId: string, reference: string): PageElement =>
    cy.get(`a[href="/prisons/${prisonId}/session-templates/${reference}"]`)

  successMessage = (): PageElement => cy.get('.moj-banner__message')

  getAddSessionTemplateLink = () => this.getByDataTest('add-session-template')
}
