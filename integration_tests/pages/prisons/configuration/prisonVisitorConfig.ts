import Page from '../../page'

export default class PrisonVisitorConfigPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Edit visitor configuration`)
  }

  enterMaxTotalVisitors = (max: string): void => {
    cy.get('#maxTotalVisitors').clear()
    cy.get('#maxTotalVisitors').type(max)
  }

  enterMaxAdults = (max: string): void => {
    cy.get('#maxAdultVisitors').clear()
    cy.get('#maxAdultVisitors').type(max)
  }

  enterMaxChildren = (max: string): void => {
    cy.get('#maxChildVisitors').clear()
    cy.get('#maxChildVisitors').type(max)
  }

  enterAdultAge = (age: string): void => {
    cy.get('#adultAgeYears').clear()
    cy.get('#adultAgeYears').type(age)
  }

  updateVisitorConfig = (): void => {
    cy.get('[data-test="submit"]').contains('Update').click()
  }
}
