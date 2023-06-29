import Page, { PageElement } from '../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  statusTab = (): PageElement => cy.get('[data-test=tab-status]')

  selectTemplatePrison = (prisonId: string, reference: string): PageElement =>
    cy.get(`a[href="/prisons/${prisonId}/session-templates/${reference}"]`)
}
