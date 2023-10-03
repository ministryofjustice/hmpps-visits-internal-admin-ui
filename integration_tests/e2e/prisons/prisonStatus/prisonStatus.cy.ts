import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfigPage'
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

  it('should activate a prison - display config information including not present if empty string', () => {
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

    viewSessionTemplatePage.getConfigTab().click()
    const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

    prisonConfigPage.prisonStatusLabel().contains('inactive')

    cy.task('stubActivatePrison', prisonCode)
    cy.task('stubGetPrison', activePrison)
    prisonConfigPage.switchStatus().submit()
    prisonConfigPage.successMessage().contains('Hewell (HMP) has been activated')
    prisonConfigPage.prisonStatusLabel().contains('active')
    prisonConfigPage.prisonEmail().contains('HMPPS-prison-visits@hewell.gov.uk')
    prisonConfigPage.prisonPhone().contains('Not set')
    prisonConfigPage.prisonWebsite().contains('https://www.gov.uk/guidance/hewell-prison')
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

    viewSessionTemplatePage.getConfigTab().click()
    const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

    prisonConfigPage.prisonStatusLabel().contains('active')

    cy.task('stubDeactivatePrison', prisonCode)
    cy.task('stubGetPrison', inactivePrison)
    prisonConfigPage.switchStatus().submit()
    prisonConfigPage.successMessage().contains('Hewell (HMP) has been deactivated')
    prisonConfigPage.prisonStatusLabel().contains('inactive')
  })
})
