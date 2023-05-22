import HomePage from '../../pages/home'
import Page from '../../pages/page'
import ListSupportedPrisonsPage from '../../pages/prisons/listSupportedPrisons'
import PrisonsIndexPage from '../../pages/prisons/prisonsIndex'

context('Supported prisons', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should navigate to the list of all supported prisons', () => {
    cy.task('stubPrisons')
    cy.task('stubSupportedPrisonIds')

    const homePage = Page.verifyOnPage(HomePage)

    homePage.supportedPrisonsTile().contains('Add')
    homePage.supportedPrisonsTile().click()

    const prisonsIndexPage = Page.verifyOnPage(PrisonsIndexPage)
    prisonsIndexPage.viewSupportedPrisonsTile().click()

    const listSupportedPrisonsPage = Page.verifyOnPage(ListSupportedPrisonsPage)
    listSupportedPrisonsPage.supportedPrisonsList().within(() => {
      cy.contains('BLI - Bristol')
      cy.contains('HEI - Hewell')
    })
  })
})
