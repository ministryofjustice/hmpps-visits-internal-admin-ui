import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewLocationGroupsPage from '../../../pages/prisons/locationGroups/viewLocationGroups'
import ViewSingleLocationGroupPage from '../../../pages/prisons/locationGroups/viewSingleLocationGroup'

context('Location groups - single', () => {
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
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should navigate to view a single location group from the listing page', () => {
    cy.task('stubGetLocationGroups', { prisonCode: prison.code, body: [locationGroup] })
    cy.task('stubGetSingleLocationGroup', locationGroup)

    // listings page
    const viewLocationGroupsPage = ViewLocationGroupsPage.goTo(prison.code)
    viewLocationGroupsPage.getLocationGroup(0).click()

    // navigate to view single group page
    const viewSingleLocationGroupPage = Page.verifyOnPageTitle(
      ViewSingleLocationGroupPage,
      `${prison.name} ${locationGroup.name}`,
    )
    viewSingleLocationGroupPage.getGroupReference().contains(locationGroup.reference)
    viewSingleLocationGroupPage.getLevelOneCode(1).contains(locationGroup.locations[0].levelOneCode)
    viewSingleLocationGroupPage.getLevelTwoCode(1).contains('-')
    viewSingleLocationGroupPage.getLevelThreeCode(1).contains('-')
    viewSingleLocationGroupPage.getLevelFourCode(1).contains('-')

    viewSingleLocationGroupPage.getLevelOneCode(2).contains(locationGroup.locations[1].levelOneCode)
    viewSingleLocationGroupPage.getLevelTwoCode(2).contains(locationGroup.locations[1].levelTwoCode)
    viewSingleLocationGroupPage.getLevelThreeCode(2).contains(locationGroup.locations[1].levelThreeCode)
    viewSingleLocationGroupPage.getLevelFourCode(2).contains(locationGroup.locations[1].levelFourCode)
  })

  it('should delete a location group and return to the listing page', () => {
    cy.task('stubGetSingleLocationGroup', locationGroup)

    // navigate to single group page
    const viewSingleLocationGroupPage = ViewSingleLocationGroupPage.goTo(prison.code, locationGroup)

    // delete group
    cy.task('stubDeleteLocationGroup', locationGroup)
    cy.task('stubGetLocationGroups', { prisonCode: prison.code, body: [] })
    viewSingleLocationGroupPage.delete()

    // finish on location group listing page with success message
    const viewLocationGroupsPage = Page.verifyOnPage(ViewLocationGroupsPage)
    viewLocationGroupsPage.successMessage().contains(`Location group '${locationGroup.name}' has been deleted`)
    cy.contains('There are no location groups for this prison')
  })
})
