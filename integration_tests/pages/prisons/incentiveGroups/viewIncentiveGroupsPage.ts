import type { PageElement } from '../../page'
import Page from '../../page'

export default class ViewIncentiveGroupsPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getIncentiveGroupsTab().should('have.attr', 'aria-current', 'page')
  }

  static goTo(prisonCode: string): ViewIncentiveGroupsPage {
    cy.visit(`/prisons/${prisonCode}/incentive-groups`)
    return Page.verifyOnPage(ViewIncentiveGroupsPage)
  }

  getIncentiveGroup = (index: number): PageElement => cy.get('[data-test="incentive-group-name"] a').eq(index)

  getIncentiveGroupLevels = (index: number): PageElement => cy.get('[data-test="incentive-group-levels"]').eq(index)

  addIncentiveGroupButton = (): PageElement => cy.get('[data-test="add-incentive-group"]')
}
