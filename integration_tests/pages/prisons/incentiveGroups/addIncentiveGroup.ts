import Page from '../../page'

export default class AddIncentiveGroupPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Add an incentive level group`)
  }

  enterName = (name: string): void => {
    cy.get('#name').type(name)
  }

  selectLevel = (level: string): void => {
    cy.get(`[name="incentiveLevels"][value="${level}"]`).check({ force: true })
  }

  addGroup = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
