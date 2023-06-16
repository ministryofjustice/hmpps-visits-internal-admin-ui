import Page, { PageElement } from '../page'

export default class SupportedPrisonsPage extends Page {
  constructor() {
    super('Supported prisons')
  }

  selectPrison = (prisonId: string): PageElement => cy.get(`a[href="/prisons/${prisonId}/session-templates"]`)

  enterPrisonCode = (prisonId: string): PageElement => cy.get('.govuk-input').type(prisonId)

  createPrison = (): PageElement => cy.get('[data-test="submit"]')

  succesfulMessage = (): PageElement => cy.get('.moj-banner--success')
}
