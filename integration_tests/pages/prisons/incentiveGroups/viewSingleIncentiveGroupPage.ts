import { IncentiveGroup } from '../../../../server/data/visitSchedulerApiTypes'
import Page, { PageElement } from '../../page'

export default class ViewSingleIncentiveGroupPage extends Page {
  constructor(title: string) {
    super(title)
  }

  static goTo(prisonCode: string, incentiveGroup: IncentiveGroup): ViewSingleIncentiveGroupPage {
    cy.visit(`/prisons/${prisonCode}/incentive-groups/${incentiveGroup.reference}`)
    return Page.verifyOnPageTitle(ViewSingleIncentiveGroupPage, incentiveGroup.name)
  }

  getGroupReference = (): PageElement => cy.get('.test-template-reference')

  getLevel = (index: number): PageElement => cy.get('.test-template-incentiveLevels li').eq(index)

  delete = (): void => {
    cy.get('[data-test="incentive-group-delete-button"]').click()
  }
}
