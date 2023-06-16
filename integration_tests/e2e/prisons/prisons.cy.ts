import HomePage from '../../pages/home'
import Page from '../../pages/page'
import SupportedPrisonsPage from '../../pages/prisons/prisons'

context('Supported prisons', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  it('should navigate to the list of all supported prisons', () => {
    const homePage = Page.verifyOnPage(HomePage)

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()

    Page.verifyOnPage(SupportedPrisonsPage)
  })

  it('should create a Prison', () => {
    const supportedPrisonPage = Page.verifyOnPage(SupportedPrisonsPage)

    supportedPrisonPage.typePrison()
    supportedPrisonPage.createPrison()
  })
})
