import Page from '../../page'

export default class AddCategoryGroupPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Add a category group`)
  }

  enterName = (name: string): void => {
    cy.get('#name').type(name)
  }

  selectLevel = (level: string): void => {
    cy.get(`[name="prisonerCategories"][value="${level}"]`).check({ force: true })
  }

  addGroup = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
