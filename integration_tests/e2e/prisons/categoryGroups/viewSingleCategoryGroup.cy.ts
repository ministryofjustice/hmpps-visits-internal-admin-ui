import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewCategoryGroupsPage from '../../../pages/prisons/categoryGroups/viewCategoryGroupsPage'
import ViewSingleCategoryGroupPage from '../../../pages/prisons/categoryGroups/viewSingleCategoryGroupPage'

context('Category groups - single', () => {
  const prison = TestData.prison()
  const categoryGroup = TestData.categoryGroup()

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
    cy.task('stubCategoryGroups', { prisonCode: prison.code, body: [categoryGroup] })
    cy.task('stubSingleCategoryGroup', categoryGroup)

    // listings page
    const viewCategoryGroupsPage = ViewCategoryGroupsPage.goTo(prison.code)
    viewCategoryGroupsPage.getCategoryGroup(0).click()

    // navigate to view single group page
    const viewSingleCategoryGroupPage = Page.verifyOnPageTitle(
      ViewSingleCategoryGroupPage,
      `${prison.name} ${categoryGroup.name}`,
    )
    viewSingleCategoryGroupPage.getGroupReference().contains(categoryGroup.reference)
    viewSingleCategoryGroupPage.getLevel(0).contains('Category A - Exceptional Risk')
    viewSingleCategoryGroupPage.getLevel(1).contains('Category A - High Risk')
    viewSingleCategoryGroupPage.getLevel(2).contains('Category A - Provisional')
    viewSingleCategoryGroupPage.getLevel(3).contains('Category A - Standard Risk')
  })

  it('should delete a category group and return to the listing page', () => {
    cy.task('stubSingleCategoryGroup', categoryGroup)

    // navigate to single group page
    const viewSingleCategoryGroupPage = ViewSingleCategoryGroupPage.goTo(prison.code, categoryGroup)

    // delete group
    cy.task('stubDeleteCategoryGroup', categoryGroup)
    cy.task('stubCategoryGroups', { prisonCode: prison.code, body: [] })
    viewSingleCategoryGroupPage.delete()

    // finish on category group listing page with success message
    const viewCategoryGroupsPage = Page.verifyOnPage(ViewCategoryGroupsPage)
    viewCategoryGroupsPage.successMessage().contains(`Category group '${categoryGroup.name}' has been deleted`)
    cy.contains('There are no category groups for this prison')
  })
})
