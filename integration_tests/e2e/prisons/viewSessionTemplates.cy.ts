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

  it('should activate and deactivate a prison', () => {
    const homePage = Page.verifyOnPage(HomePage)

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', 'HEI')
    cy.task('stubGetSessionTemplates', 'HEI')

    supportedPrisonsPage.selectPrison('HEI').click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)

    viewSessionTemplatePage.switchStatusButton().contains('Deactivate')

    cy.task('stubDeactivatePrison', 'HEI')
    viewSessionTemplatePage.switchStatusButton().click()
    viewSessionTemplatePage.succesMessage().contains('Hewell (HMP) has been deactivated')

    cy.task('stubActivatePrison', 'HEI')
    viewSessionTemplatePage.switchStatusButton().click()
  })
})
