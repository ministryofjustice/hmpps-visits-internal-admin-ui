import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'
import ViewLocationGroupsPage from '../../../pages/prisons/locationGroups/viewLocationGroupsPage'

context('Location groups - list', () => {
  const prison = TestData.prison()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  it('should navigate to the list of location groups for a prison', () => {
    // home page
    const homePage = Page.verifyOnPage(HomePage)
    homePage.supportedPrisonsCard().click()

    // supported prisons list
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    // select Hewell
    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubGetSessionTemplates', { prisonCode: prison.code })
    supportedPrisonsPage.getPrisonByCode(prison.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to location groups page
    const locationGroup = TestData.locationGroup({
      name: 'Wings A & B',
      locations: [{ levelOneCode: 'A' }, { levelOneCode: 'B' }],
    })
    cy.task('stubLocationGroups', { prisonCode: prison.code, body: [locationGroup] })
    viewSessionTemplatesPage.getLocationGroupsTab().click()

    // Check listed location group
    const viewLocationGroupsPage = Page.verifyOnPage(ViewLocationGroupsPage)
    viewLocationGroupsPage.getLocationGroup(0).contains(locationGroup.name)
    viewLocationGroupsPage.getLocationGroupCount(0).contains(locationGroup.locations.length)
  })
})