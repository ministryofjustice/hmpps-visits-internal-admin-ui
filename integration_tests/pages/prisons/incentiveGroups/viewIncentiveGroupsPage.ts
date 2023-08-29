import type { PageElement } from '../../page'
import PrisonPage from '../../prisonPage'

export default class ViewIncentiveGroupsPage extends PrisonPage {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string) => cy.visit(`/prisons/${prisonCode}/incentive-groups`)

  getIncentiveGroup = (index: number): PageElement => cy.get('[data-test="incentive-group-name"]').eq(index)

  getIncentiveGroupLevels = (index: number): PageElement => cy.get('[data-test="incentive-group-levels"]').eq(index)
}
