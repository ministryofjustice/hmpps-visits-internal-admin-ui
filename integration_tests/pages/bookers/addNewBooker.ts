import Page from '../page'

export default class AddNewBookerPage extends Page {
  constructor() {
    super('Add a new booker')
  }

  add = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
