import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewIncentiveGroupsPage from '../../../pages/prisons/incentiveGroups/viewIncentiveGroupsPage'
import ViewSingleIncentiveGroupPage from '../../../pages/prisons/incentiveGroups/viewSingleIncentiveGroupPage'
import incentiveLevelNames from '../../../../server/constants/incentiveLevels'

context('Incentive groups - single', () => {
  const prison = TestData.prison()
  const incentiveGroup = TestData.incentiveGroup({ incentiveLevels: ['ENHANCED', 'ENHANCED_2'] })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubIncentiveGroups', { prisonCode: prison.code, body: [incentiveGroup] })
    cy.task('stubSingleIncentiveGroup', incentiveGroup)
  })

  it('should navigate to view a single incentive group from the listing page', () => {
    const viewIncentiveGroupsPage = ViewIncentiveGroupsPage.goTo(prison.code)
    viewIncentiveGroupsPage.getIncentiveGroup(0).click()

    const viewSingleIncentiveGroupPage = Page.verifyOnPageTitle(
      ViewSingleIncentiveGroupPage,
      `${prison.name} ${incentiveGroup.name}`,
    )
    viewSingleIncentiveGroupPage.getGroupReference().contains(incentiveGroup.reference)
    incentiveGroup.incentiveLevels.forEach((level, index) => {
      viewSingleIncentiveGroupPage.getLevel(index).contains(incentiveLevelNames[level])
    })
  })

  // TODO Add test for delete incentive group
})
