import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewLocationGroupsPage from '../../../pages/prisons/locationGroups/viewLocationGroupsPage'
import AddLocationGroupPage from '../../../pages/prisons/locationGroups/addLocationGroupPage'
import ViewSingleLocationGroupPage from '../../../pages/prisons/locationGroups/viewSingleLocationGroupPage'

context('Location groups - add', () => {
  const prison = TestData.prison()
  const locationGroup = TestData.locationGroup({
    locations: [
      { levelOneCode: 'A-L1' },
      { levelOneCode: 'A-L1', levelTwoCode: 'A-L2', levelThreeCode: 'A-L3', levelFourCode: 'A-L4' },
    ],
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should add a location group from the listings page', () => {
    cy.task('stubLocationGroups', { prisonCode: prison.code, body: [] })

    // Location group listing page - click 'Add'
    const viewLocationGroupsPage = ViewLocationGroupsPage.goTo(prison.code)
    viewLocationGroupsPage.addLocationGroupButton().click()

    // Enter details for new group on add page
    const addLocationGroupPage = Page.verifyOnPageTitle(AddLocationGroupPage, prison.name)
    addLocationGroupPage.enterName(locationGroup.name)
    addLocationGroupPage.enterLevelOneCode(0, locationGroup.locations[0].levelOneCode)
    addLocationGroupPage.addAnotherLevel()
    addLocationGroupPage.enterLevelOneCode(1, locationGroup.locations[1].levelOneCode)
    addLocationGroupPage.enterLevelTwoCode(1, locationGroup.locations[1].levelTwoCode)
    addLocationGroupPage.enterLevelThreeCode(1, locationGroup.locations[1].levelThreeCode)
    addLocationGroupPage.enterLevelFourCode(1, locationGroup.locations[1].levelFourCode)

    // Submit form
    cy.task('stubCreateLocationGroup', { prisonCode: prison.code, locationGroup })
    cy.task('stubSingleLocationGroup', locationGroup)
    addLocationGroupPage.addGroup()

    // Finish on view single group page and verify success message
    const viewSingleLocationGroupPage = Page.verifyOnPageTitle(
      ViewSingleLocationGroupPage,
      `${prison.name} ${locationGroup.name}`,
    )
    viewSingleLocationGroupPage.successMessage().contains(`Location group '${locationGroup.name}' has been created`)
    viewSingleLocationGroupPage.getGroupReference().contains(locationGroup.reference)
  })
})
