import Page, { PageElement } from '../page'

export default class SupportedPrisonsPage extends Page {
  constructor() {
    super('Supported prisons')
  }

  getPrisonNameByCode = (prisonCode: string): PageElement =>
    cy.get('[data-test="prison-code"]').contains(prisonCode).next('[data-test="prison-name"]').find('a')

  getPrisonStatusByCode = (prisonCode: string): PageElement =>
    cy.get('[data-test="prison-code"]').contains(prisonCode).nextAll('[data-test="prison-status"]')

  getPrisonClientsByCode = (prisonCode: string): PageElement =>
    cy.get('[data-test="prison-code"]').contains(prisonCode).nextAll('[data-test="prison-clients"]')

  enterPrisonCode = (prisonCode: string): PageElement => cy.get('.govuk-input').type(prisonCode)

  createPrison = (): PageElement => cy.get('[data-test="submit"]')

  successMessage = (): PageElement => cy.get('.moj-banner--success')
}
