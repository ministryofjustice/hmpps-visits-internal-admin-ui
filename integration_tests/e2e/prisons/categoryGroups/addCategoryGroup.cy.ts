import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewCategoryGroupsPage from '../../../pages/prisons/categoryGroups/viewCategoryGroupsPage'
import ViewSingleCategoryGroupPage from '../../../pages/prisons/categoryGroups/viewSingleCategoryGroupPage'
import AddCategoryGroupPage from '../../../pages/prisons/categoryGroups/addCategoryGroupPage'
import categoryList from '../../../../server/constants/prisonerCategories'

context('Category groups - add', () => {
  const prison = TestData.prison()
  const categoryGroup = TestData.categoryGroup({ name: 'Basic group', categories: ['A_HIGH'] })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should add a category group from the listings page', () => {
    cy.task('stubCategoryGroups', { prisonCode: prison.code, body: [] })

    // Category group listing page - click 'Add'
    const viewCategoryGroupsPage = ViewCategoryGroupsPage.goTo(prison.code)
    viewCategoryGroupsPage.addCategoryGroupButton().click()

    // Enter details for new group on add page
    const addCategoryGroupPage = Page.verifyOnPageTitle(AddCategoryGroupPage, prison.name)
    addCategoryGroupPage.enterName(categoryGroup.name)
    addCategoryGroupPage.selectLevel(categoryGroup.categories[0])

    // Submit form
    cy.task('stubCreateCategoryGroup', { prisonCode: prison.code, categoryGroup })
    cy.task('stubSingleCategoryGroup', categoryGroup)
    addCategoryGroupPage.addGroup()

    // Finish on view single group page and verify success and message details
    const viewSingleCategoryGroupPage = Page.verifyOnPageTitle(
      ViewSingleCategoryGroupPage,
      `${prison.name} ${categoryGroup.name}`,
    )
    viewSingleCategoryGroupPage.successMessage().contains(`Category group '${categoryGroup.name}' has been created`)
    viewSingleCategoryGroupPage.getGroupReference().contains(categoryGroup.reference)
    categoryGroup.categories.forEach((level, index) => {
      viewSingleCategoryGroupPage.getLevel(index).contains(categoryList[level])
    })
  })
})