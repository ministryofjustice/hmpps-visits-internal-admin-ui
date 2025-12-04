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

  getPrisonerVisitors = (row: number): PageElement => cy.get(`[data-test="prisoner-visitors-${row}"]`)

  clearBookerDetails = (): void => {
    cy.contains('Clear booker details').click() // expand the details component that hides the button
    cy.get('[data-test="clear-booker-details"]').click() // click the button
  }
}
