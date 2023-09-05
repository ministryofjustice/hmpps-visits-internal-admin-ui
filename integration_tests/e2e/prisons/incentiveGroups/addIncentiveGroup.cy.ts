import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewIncentiveGroupsPage from '../../../pages/prisons/incentiveGroups/viewIncentiveGroupsPage'
import ViewSingleIncentiveGroupPage from '../../../pages/prisons/incentiveGroups/viewSingleIncentiveGroupPage'
import AddIncentiveGroupPage from '../../../pages/prisons/incentiveGroups/addIncentiveGroupPage'

context('Incentive groups - add', () => {
  const prison = TestData.prison()
  const incentiveGroup = TestData.incentiveGroup({ name: 'Basic group', incentiveLevels: ['BASIC'] })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should add an incentive group from the listings page', () => {
    cy.task('stubIncentiveGroups', { prisonCode: prison.code, body: [] })

    // Incentives group listing page - click 'Add'
    const viewIncentiveGroupsPage = ViewIncentiveGroupsPage.goTo(prison.code)
    viewIncentiveGroupsPage.addIncentiveGroupButton().click()

    // Enter details for new group on add page
    const addIncentiveGroupPage = Page.verifyOnPageTitle(AddIncentiveGroupPage, prison.name)
    addIncentiveGroupPage.enterName(incentiveGroup.name)
    addIncentiveGroupPage.selectLevel(incentiveGroup.incentiveLevels[0])

    // Submit form
    cy.task('stubCreateIncentiveGroup', { prisonCode: prison.code, incentiveGroup })
    cy.task('stubSingleIncentiveGroup', incentiveGroup)
    addIncentiveGroupPage.addGroup()

    // Finish on view single group page and verify success message
    const viewSingleIncentiveGroupPage = Page.verifyOnPageTitle(
      ViewSingleIncentiveGroupPage,
      `${prison.name} ${incentiveGroup.name}`,
    )
    viewSingleIncentiveGroupPage
      .successMessage()
      .contains(`Incentive level group '${incentiveGroup.name}' has been created`)
    viewSingleIncentiveGroupPage.getGroupReference().contains(incentiveGroup.reference)
  })
})