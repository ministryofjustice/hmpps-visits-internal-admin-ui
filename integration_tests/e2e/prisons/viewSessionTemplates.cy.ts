import Page from '../../pages/page'
import SupportedPrisonsPage from '../../pages/prisons/prisons'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplate'

context('Supported prisons', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.task('selectPrison')

    cy.signIn()
  })

  it('should navigate to the selected prison', () => {
    const supportedPrisonPage = Page.verifyOnPage(SupportedPrisonsPage)

    // supportedPrisonPage.selectedPrison().click();
    // Page.verifyOnPage(ViewSessionTemplatePage)
  })

  it('should active a Prison', () => {
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
  })

  it('should deactive a Prison', () => {
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
  })
})
