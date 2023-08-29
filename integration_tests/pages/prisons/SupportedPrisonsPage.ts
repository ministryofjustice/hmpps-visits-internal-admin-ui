import type { PageElement } from '../page'
import PrisonPage from '../prisonPage'

export default class SupportedPrisonsPage extends PrisonPage {
  constructor() {
    super('Supported prisons')
  }

  getPrisonByCode = (prisonId: string): PageElement => cy.get(`a[href="/prisons/${prisonId}/session-templates"]`)

  enterPrisonCode = (prisonId: string): PageElement => cy.get('.govuk-input').type(prisonId)

  createPrison = (): PageElement => cy.get('[data-test="submit"]')

  successMessage = (): PageElement => cy.get('.moj-banner--success')
}
