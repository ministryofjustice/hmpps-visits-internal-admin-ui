import TestData from '../../../../server/routes/testutils/testData'
import IndexPage from '../../../pages'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import { SessionTemplatesRangeType } from '../../../../server/data/visitSchedulerApiTypes'

context('Prison configuration - prison status', () => {
  const prisonCode = 'HEI'
  const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrisonContactDetails', { prisonCode })
    cy.task('stubGetNegativeBalanceCount', {})
  })

  const inactivePrison = TestData.prisonDto({ active: false })
  const activePrison = TestData.prisonDto({ active: true })

  it('should activate a prison', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.supportedPrisonsCard().contains('Supported prisons')
    indexPage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', inactivePrison)
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    supportedPrisonsPage.getPrisonNameByCode(prisonCode).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.getConfigTab().click()
    const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

    prisonConfigPage.prisonStatusLabel().contains('Inactive')
    prisonConfigPage.prisonClientsLabel().contains('Staff')

    cy.task('stubActivatePrison', prisonCode)
    cy.task('stubGetPrison', activePrison)
    prisonConfigPage.activatePrison()
    prisonConfigPage.successMessage().contains('Hewell (HMP) has been activated')
    prisonConfigPage.prisonStatusLabel().contains('Active')
    prisonConfigPage.prisonClientsLabel().contains('Staff')
  })

  it('should deactivate a prison', () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.supportedPrisonsCard().contains('Supported prisons')
    indexPage.supportedPrisonsCard().click()
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    supportedPrisonsPage.getPrisonNameByCode(prisonCode).click()
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatesPage)

    viewSessionTemplatePage.getConfigTab().click()
    const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)

    prisonConfigPage.prisonStatusLabel().contains('Active')
    prisonConfigPage.prisonClientsLabel().contains('Staff')

    cy.task('stubDeactivatePrison', prisonCode)
    cy.task('stubGetPrison', inactivePrison)
    prisonConfigPage.deactivatePrison()
    prisonConfigPage.successMessage().contains('Hewell (HMP) has been deactivated')
    prisonConfigPage.prisonStatusLabel().contains('Inactive')
    prisonConfigPage.prisonClientsLabel().contains('Staff')
  })
})
