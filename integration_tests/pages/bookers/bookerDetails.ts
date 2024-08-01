import Page, { PageElement } from '../page'

export default class BookerDetailsPage extends Page {
  constructor() {
    super('Booker details')
  }

  bookerEmail = (): PageElement => cy.get('[data-test="booker-email"]')

  bookerReference = (): PageElement => cy.get('[data-test="booker-reference"]')

  prisonerNumber = (): PageElement => cy.get('[data-test="prisoner-number"]')

  addPrisoner = (): void => {
    cy.get('[data-test="add-prisoner"]').click()
  }

  getVisitorName = (index: number): PageElement => cy.get(`[data-test="visitor-name-${index.toString()}"]`)

  addVisitor = (): void => {
    cy.get('[data-test="add-visitor"]').click()
  }

  clearBookerDetails = (): void => {
    cy.get('[data-test="clear-booker-details"]').click()
  }
}
