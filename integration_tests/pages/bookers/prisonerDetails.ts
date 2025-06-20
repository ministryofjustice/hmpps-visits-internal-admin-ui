import Page, { PageElement } from '../page'

export default class PrisonerDetailsPage extends Page {
  constructor() {
    super('Prisoner details')
  }

  prisonerNumber = (): PageElement => cy.get('[data-test="prisoner-number"]')

  prisonName = (): PageElement => cy.get('[data-test="registered-prison-name"]')

  addPrisoner = (): void => {
    cy.get('[data-test="add-prisoner"]').click()
  }

  getVisitorName = (index: number): PageElement => cy.get(`[data-test="visitor-name-${index.toString()}"]`)

  addVisitor = (): void => {
    cy.get('[data-test="add-visitor"]').click()
  }
}
