import Page from '../page'

export default class SearchForBookerPage extends Page {
  constructor() {
    super('Search for a booker')
  }

  enterBookerEmail = (email: string): void => {
    cy.get('#booker').type(email)
  }

  search = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
