import HomePage from '../../pages/home'
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

    cy.signIn()
  })

  it('should navigate to the selected prison', () => {
    const homePage = Page.verifyOnPage(HomePage)

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()

    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    supportedPrisonsPage.selectPrison('HEI').click()

    Page.verifyOnPage(ViewSessionTemplatePage)
  })

  it('should active a Prison', () => {
    // const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)

    cy.task('stubActivatePrison')
  })

  it('should deactive a Prison', () => {
    // const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
    cy.task('stubDeactivatePrison')
  })
})
