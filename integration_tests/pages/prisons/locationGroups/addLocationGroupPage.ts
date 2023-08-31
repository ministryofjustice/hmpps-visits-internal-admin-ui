import Page from '../../page'

export default class AddLocationGroupPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Add a location group`)
  }

  enterName = (name: string): void => {
    cy.get('#name').type(name)
  }

  enterLevelOneCode = (index: number, code: string): void => {
    cy.get(`#location\\[${index}\\]\\[levelOneCode\\]`).type(code)
  }

  enterLevelTwoCode = (index: number, code: string): void => {
    cy.get(`#location\\[${index}\\]\\[levelTwoCode\\]`).type(code)
  }

  enterLevelThreeCode = (index: number, code: string): void => {
    cy.get(`#location\\[${index}\\]\\[levelThreeCode\\]`).type(code)
  }

  enterLevelFourCode = (index: number, code: string): void => {
    cy.get(`#location\\[${index}\\]\\[levelFourCode\\]`).type(code)
  }

  addAnotherLevel = (): void => {
    cy.get('[data-test="add-location-level"]').click()
  }

  addGroup = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
