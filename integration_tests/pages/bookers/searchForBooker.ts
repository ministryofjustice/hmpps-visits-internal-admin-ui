import Page from '../page'

export default class SearchForBookerPage extends Page {
  constructor() {
    super('Search for a booker account')
  }

  enterBookerEmail = (email: string): void => {
    cy.get('#search').type(email)
  }

  search = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
