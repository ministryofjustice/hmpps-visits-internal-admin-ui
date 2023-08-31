import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewCategoryGroupsPage from '../../../pages/prisons/categoryGroups/viewCategoryGroupsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'

context('Category groups - list', () => {
  const prison = TestData.prison()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  it('should navigate to the list of category groups for a prison', () => {
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

    // Go to category groups page
    const categoryGroup = TestData.categoryGroup()
    cy.task('stubCategoryGroups', { prisonCode: prison.code, body: [categoryGroup] })
    viewSessionTemplatesPage.selectCategoryGroupsTab()

    // Check listed category group
    const viewCategoryGroupsPage = Page.verifyOnPage(ViewCategoryGroupsPage)
    viewCategoryGroupsPage.getCategoryGroup(0).contains(categoryGroup.name)
    viewCategoryGroupsPage.getCategoryGroupLevels(0).contains('Category A - Exceptional Risk')
    viewCategoryGroupsPage.getCategoryGroupLevels(0).contains('Category A - High Risk')
    viewCategoryGroupsPage.getCategoryGroupLevels(0).contains('Category A - Provisional')
    viewCategoryGroupsPage.getCategoryGroupLevels(0).contains('Category A - Standard Risk')
  })
})
