import Page from '../page'

export default class SearchForBookerPage extends Page {
  constructor() {
    super('Search for a booker account')
  }

  enterBookerSearchTerm = (search: string): void => {
    cy.get('#search').type(search)
  }

  search = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
