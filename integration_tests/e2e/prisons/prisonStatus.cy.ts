import TestData from '../../../server/routes/testutils/testData'
import HomePage from '../../pages/home'
import Page from '../../pages/page'
import SupportedPrisonsPage from '../../pages/prisons/prisons'
import ViewSessionTemplatesPage from '../../pages/prisons/viewSessionTemplates'
import PrisonStatusPage from '../../pages/prisons/prisonStatus'

context('Supported prisons', () => {
  const prisonId = 'HEI'
  const templateFilter = 'CURRENT_OR_FUTURE'
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')

    cy.signIn()
  })

  it('should activate a prison', () => {
    const homePage = Page.verifyOnPage(HomePage)
    const inactivePrison = TestData.prison({ active: false })
    const activePrison = TestData.prison({ active: true })

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', inactivePrison)
    cy.task('stubGetSessionTemplates', { prisonId, templateFilter })

    supportedPrisonsPage.selectPrison(prisonId).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.statusTab().click()
    const prisonStatusPage = Page.verifyOnPage(PrisonStatusPage)

    prisonStatusPage.prisonStatusLabel().contains('inactive')

    cy.task('stubActivatePrison', prisonId)
    cy.task('stubGetPrison', activePrison)
    prisonStatusPage.switchStatus().submit()
    prisonStatusPage.successMessage().contains('Hewell (HMP) has been activated')
    prisonStatusPage.prisonStatusLabel().contains('active')
  })

  it('should deactivate a prison', () => {
    const homePage = Page.verifyOnPage(HomePage)
    const inactivePrison = TestData.prison({ active: false })
    const activePrison = TestData.prison({ active: true })

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplates', { prisonId, templateFilter })

    supportedPrisonsPage.selectPrison(prisonId).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.statusTab().click()
    const prisonStatusPage = Page.verifyOnPage(PrisonStatusPage)

    prisonStatusPage.prisonStatusLabel().contains('active')

    cy.task('stubDeactivatePrison', prisonId)
    cy.task('stubGetPrison', inactivePrison)
    prisonStatusPage.switchStatus().submit()
    prisonStatusPage.successMessage().contains('Hewell (HMP) has been deactivated')
    prisonStatusPage.prisonStatusLabel().contains('inactive')
  })
})
