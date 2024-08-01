import Page from '../page'

export default class AddVisitorPage extends Page {
  constructor() {
    super('Add a visitor')
  }

  selectVisitorById = (visitorId: number): void => {
    cy.get(`#visitor-${visitorId.toString()}`).check()
  }

  addVisitor = (): void => {
    cy.get('[data-test="add-visitor"]').click()
  }
}
