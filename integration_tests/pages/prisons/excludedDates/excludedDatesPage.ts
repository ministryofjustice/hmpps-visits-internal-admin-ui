import Page, { PageElement } from '../../page'

export default class ExcludedDatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getExcludedDatesTab().should('have.attr', 'aria-current', 'page')
  }

  static goTo(prisonCode: string): ExcludedDatesPage {
    cy.visit(`/prisons/${prisonCode}/excluded-dates`)
    return Page.verifyOnPage(ExcludedDatesPage)
  }

  getExcludedDate = (index: number): PageElement => cy.get('[data-test="excluded-date"]').eq(index)

  removeExcludedDate = (index: number): void => {
    cy.get('[data-test="remove-date-button"]').eq(index).click()
  }

  enterExcludedDate = (day: string, month: string, year: string): void => {
    cy.get(`#excludeDate-excludeDate\\[day\\]`).type(day)
    cy.get(`#excludeDate-excludeDate\\[month\\]`).type(month)
    cy.get(`#excludeDate-excludeDate\\[year\\]`).type(year)
  }

  checkExcludedDate = (): void => {
    cy.get('[data-test="check-date"]').click()
  }

  getVisitCount = (): PageElement => cy.get('[data-test="visit-count"]')

  getCheckedDate = (): PageElement => cy.get('[data-test="exclude-date"]')

  addExcludedDate = (): void => {
    cy.get('[data-test="add-date"]').click()
  }
}
