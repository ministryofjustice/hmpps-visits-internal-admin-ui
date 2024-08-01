import Page from '../page'

export default class AddPrisonerPage extends Page {
  constructor() {
    super('Add a prisoner')
  }

  enterPrisonerNumber = (prisonerNumber: string): void => {
    cy.get('#prisonerNumber').type(prisonerNumber)
  }

  addPrisoner = (): void => {
    cy.get('[data-test="add-prisoner"]').click()
  }
}
