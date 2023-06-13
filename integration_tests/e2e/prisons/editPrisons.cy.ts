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

    // cy.task('selectPrison')
    cy.signIn()
  })

  it('should navigate to the list of all supported prisons', () => {
    // const homePage = Page.verifyOnPage(HomePage)
    // homePage.supportedPrisonsCard().contains('Supported prisons')
    // homePage.supportedPrisonsCard().click()
    // Page.verifyOnPage(SupportedPrisonsPage)
  })

  it('should active a Prison', () => {
    // cy.task('stubPrisons')
    // cy.task('stubActivePrison')
    // const homePage = Page.verifyOnPage(HomePage)
    // homePage.supportedPrisonsCard().contains('Supported prisons')
    // homePage.supportedPrisonsCard().click()
    // Page.verifyOnPage(SupportedPrisonsPage)
  })

  it('should deactive a Prison', () => {
    // cy.task('stubPrisons')
    // cy.task('stubDeactivePrison')
    // const homePage = Page.verifyOnPage(HomePage)
    // homePage.supportedPrisonsCard().contains('Supported prisons')
    // homePage.supportedPrisonsCard().click()
    // Page.verifyOnPage(SupportedPrisonsPage)
  })
})
