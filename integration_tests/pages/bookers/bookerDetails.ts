import Page, { PageElement } from '../page'

export default class BookerDetailsPage extends Page {
  constructor() {
    super('Booker details')
  }

  bookerEmail = (): PageElement => cy.get('[data-test="booker-email"]')

  bookerReference = (): PageElement => cy.get('[data-test="booker-reference"]')

  noPrisonersMessage = (): PageElement => cy.get('[data-test="no-prisoners"]')

  addPrisoner = (): void => {
    cy.get('[data-test="add-prisoner"]').click()
  }

  selectPrisoner = (prisonerId: string) => cy.get('a').contains(prisonerId).click()

  getPrisonerId = (row: number): PageElement => cy.get(`[data-test="prison-number-${row}"]`)

  getPrisonName = (row: number): PageElement => cy.get(`[data-test="prison-name-${row}"]`)

  getPrisonerStatus = (row: number): PageElement => cy.get(`[data-test="prisoner-status-${row}"]`)

  getPrisonerVisitors = (row: number): PageElement => cy.get(`[data-test="prisoner-visitors-${row}"]`)

  clearBookerDetails = (): void => {
    cy.get('[data-test="clear-booker-details"]').click()
  }
}
