import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'
import PrisonStatusPage from '../../../pages/prisons/prisonStatus/prisonStatusPage'
import { SessionTemplatesRangeType } from '../../../../server/data/visitSchedulerApiTypes'

context('Supported prisons', () => {
  const prisonCode = 'HEI'
  const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'
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
    const inactivePrison = TestData.prisonDto({ active: false })
    const activePrison = TestData.prisonDto({ active: true })

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', inactivePrison)
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    supportedPrisonsPage.getPrisonByCode(prisonCode).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.selectStatusTab()
    const prisonStatusPage = Page.verifyOnPage(PrisonStatusPage)

    prisonStatusPage.prisonStatusLabel().contains('inactive')

    cy.task('stubActivatePrison', prisonCode)
    cy.task('stubGetPrison', activePrison)
    prisonStatusPage.switchStatus().submit()
    prisonStatusPage.successMessage().contains('Hewell (HMP) has been activated')
    prisonStatusPage.prisonStatusLabel().contains('active')
  })

  it('should deactivate a prison', () => {
    const homePage = Page.verifyOnPage(HomePage)
    const inactivePrison = TestData.prisonDto({ active: false })
    const activePrison = TestData.prisonDto({ active: true })

    homePage.supportedPrisonsCard().contains('Supported prisons')
    homePage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    supportedPrisonsPage.getPrisonByCode(prisonCode).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.selectStatusTab()
    const prisonStatusPage = Page.verifyOnPage(PrisonStatusPage)

    prisonStatusPage.prisonStatusLabel().contains('active')

    cy.task('stubDeactivatePrison', prisonCode)
    cy.task('stubGetPrison', inactivePrison)
    prisonStatusPage.switchStatus().submit()
    prisonStatusPage.successMessage().contains('Hewell (HMP) has been deactivated')
    prisonStatusPage.prisonStatusLabel().contains('inactive')
  })
})
