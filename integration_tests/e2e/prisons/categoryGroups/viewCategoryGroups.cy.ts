import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewCategoryGroupsPage from '../../../pages/prisons/categoryGroups/viewCategoryGroupsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'
import categoryList from '../../../../server/constants/prisonerCategories'

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
    supportedPrisonsPage.getPrisonNameByCode(prison.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to category groups page
    const categoryGroup = TestData.categoryGroup()
    cy.task('stubGetCategoryGroups', { prisonCode: prison.code, body: [categoryGroup] })
    viewSessionTemplatesPage.getCategoryGroupsTab().click()

    // Check listed category groups
    const viewCategoryGroupsPage = Page.verifyOnPage(ViewCategoryGroupsPage)
    viewCategoryGroupsPage.getCategoryGroup(0).contains(categoryGroup.name)
    categoryGroup.categories.forEach((level, index) => {
      viewCategoryGroupsPage.getCategoryGroupLevels(index).contains(categoryList[level])
    })
  })
})
