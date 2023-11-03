import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'

context('Session templates - list', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  it('should navigate to the list of session templates for a prison', () => {
    const prison = TestData.prison()
    const sessionTemplate = TestData.sessionTemplate()
    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubGetSessionTemplates', {
      prisonCode: prison.code,
      sessionTemplates: [sessionTemplate],
    })

    // home page
    const homePage = Page.verifyOnPage(HomePage)
    homePage.supportedPrisonsCard().click()

    // supported prisons list
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    // select Hewell
    supportedPrisonsPage.getPrisonNameByCode(prison.code).click()
    Page.verifyOnPage(ViewSessionTemplatesPage)

    // check template listed
    cy.contains(sessionTemplate.name)
  })
})
