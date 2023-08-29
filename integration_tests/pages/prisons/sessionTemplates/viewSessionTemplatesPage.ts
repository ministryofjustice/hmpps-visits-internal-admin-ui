import Page, { PageElement } from '../../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string) => cy.visit(`/prisons/${prisonCode}/session-templates`)

  selectTemplatePrison = (prisonId: string, reference: string): PageElement =>
    cy.get(`a[href="/prisons/${prisonId}/session-templates/${reference}"]`)

  getAddSessionTemplateLink = () => this.getByDataTest('add-session-template')
}
