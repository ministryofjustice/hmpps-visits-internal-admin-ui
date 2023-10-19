import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import { SessionTemplatesRangeType } from '../../../../server/data/visitSchedulerApiTypes'

context('Prison configuration', () => {
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

  describe('Prison contact details', () => {
    const prison = TestData.prison()

    it('should display prison contact details', () => {
      cy.task('stubGetPrison', prison)
      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)

      prisonConfigPage.getEmail().contains('hewell')
      prisonConfigPage.getPhone().contains('Not set')
      prisonConfigPage.getWebAddress().contains('gov.uk')
    })
  })

  describe('Prison status', () => {
    const inactivePrison = TestData.prisonDto({ active: false })
    const activePrison = TestData.prisonDto({ active: true })

    it('should activate a prison', () => {
      const homePage = Page.verifyOnPage(HomePage)
      homePage.supportedPrisonsCard().contains('Supported prisons')
      homePage.supportedPrisonsCard().click()
      const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

      cy.task('stubGetPrison', inactivePrison)
      cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

      supportedPrisonsPage.getPrisonNameByCode(prisonCode).click()
      const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

      viewSessionTemplatePage.getConfigTab().click()
      const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

      prisonConfigPage.prisonStatusLabel().contains('inactive')

      cy.task('stubActivatePrison', prisonCode)
      cy.task('stubGetPrison', activePrison)
      prisonConfigPage.activatePrison()
      prisonConfigPage.successMessage().contains('Hewell (HMP) has been activated')
      prisonConfigPage.prisonStatusLabel().contains('active')
    })

    it('should deactivate a prison', () => {
      const homePage = Page.verifyOnPage(HomePage)
      homePage.supportedPrisonsCard().contains('Supported prisons')
      homePage.supportedPrisonsCard().click()
      const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

      cy.task('stubGetPrison', activePrison)
      cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

      supportedPrisonsPage.getPrisonNameByCode(prisonCode).click()
      const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

      viewSessionTemplatePage.getConfigTab().click()
      const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

      prisonConfigPage.prisonStatusLabel().contains('active')

      cy.task('stubDeactivatePrison', prisonCode)
      cy.task('stubGetPrison', inactivePrison)
      prisonConfigPage.deactivatePrison()
      prisonConfigPage.successMessage().contains('Hewell (HMP) has been deactivated')
      prisonConfigPage.prisonStatusLabel().contains('inactive')
    })
  })
})
