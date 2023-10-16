import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewIncentiveGroupsPage from '../../../pages/prisons/incentiveGroups/viewIncentiveGroups'
import ViewSingleIncentiveGroupPage from '../../../pages/prisons/incentiveGroups/viewSingleIncentiveGroup'
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
  })

  it('should navigate to view a single incentive group from the listing page', () => {
    cy.task('stubGetIncentiveGroups', { prisonCode: prison.code, body: [incentiveGroup] })
    cy.task('stubGetSingleIncentiveGroup', incentiveGroup)

    // listings page
    const viewIncentiveGroupsPage = ViewIncentiveGroupsPage.goTo(prison.code)
    viewIncentiveGroupsPage.getIncentiveGroup(0).click()

    // navigate to view single group page
    const viewSingleIncentiveGroupPage = Page.verifyOnPageTitle(
      ViewSingleIncentiveGroupPage,
      `${prison.name} ${incentiveGroup.name}`,
    )
    viewSingleIncentiveGroupPage.getGroupReference().contains(incentiveGroup.reference)
    incentiveGroup.incentiveLevels.forEach((level, index) => {
      viewSingleIncentiveGroupPage.getLevel(index).contains(incentiveLevelNames[level])
    })
  })

  it('should delete an incentive group and return to the listing page', () => {
    cy.task('stubGetSingleIncentiveGroup', incentiveGroup)

    // navigate to single group page
    const viewSingleIncentiveGroupPage = ViewSingleIncentiveGroupPage.goTo(prison.code, incentiveGroup)

    // delete group
    cy.task('stubDeleteIncentiveGroup', incentiveGroup)
    cy.task('stubGetIncentiveGroups', { prisonCode: prison.code, body: [] })
    viewSingleIncentiveGroupPage.delete()

    // finish on incentives group listing page with success message
    const viewIncentiveGroupsPage = Page.verifyOnPage(ViewIncentiveGroupsPage)
    viewIncentiveGroupsPage.successMessage().contains(`Incentive group '${incentiveGroup.name}' has been deleted`)
    cy.contains('There are no incentive level groups for this prison')
  })
})
