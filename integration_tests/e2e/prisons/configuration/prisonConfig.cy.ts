import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import { SessionTemplatesRangeType } from '../../../../server/data/visitSchedulerApiTypes'
import PrisonBookingWindowPage from '../../../pages/prisons/configuration/prisonBookingWindowForm'

context('Prison configuration', () => {
  const prisonCode = 'HEI'
  const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrisonContactDetails', { prisonCode })
  })

  describe('Prison booking window displayed', () => {
    const prison = TestData.prison()

    it('should display prison contact details', () => {
      cy.task('stubGetPrison', prison)

      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)

      prisonConfigPage.getMinBookingWindow().contains(prison.policyNoticeDaysMin)
      prisonConfigPage.getMaxBookingWindow().contains(prison.policyNoticeDaysMax)
    })

    it('when edit prison booking window button is pressed we should be on the edit form', () => {
      cy.task('stubGetPrison', prison)

      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)
      prisonConfigPage.pressPrisonBookingWindowEditButton()
      prisonConfigPage.isAtPath('/prisons/HEI/configuration/booking-window/edit')
    })
  })

  describe('Prison booking window update form', () => {
    const prison = TestData.prison()

    it('should display prison booking window details when on update form', () => {
      cy.task('stubGetPrison', prison)

      const prisonBookingWindowPage = PrisonBookingWindowPage.goTo(prisonCode)
      prisonBookingWindowPage.getMinBookingWindow().should('have.value', prison.policyNoticeDaysMin)
      prisonBookingWindowPage.getMaxBookingWindow().should('have.value', prison.policyNoticeDaysMax)
    })

    it('should update min and max correctly when entered', () => {
      const updatePrison = TestData.prison({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })

      cy.task('stubGetPrison', prison)
      cy.task('stubUpdatePrison', updatePrison)

      const prisonBookingWindowPage = PrisonBookingWindowPage.goTo(prisonCode)
      prisonBookingWindowPage.getMinBookingWindow().clear().type(String(updatePrison.policyNoticeDaysMin))
      prisonBookingWindowPage.getMaxBookingWindow().clear().type(String(updatePrison.policyNoticeDaysMax))
      cy.task('stubGetPrison', updatePrison)
      prisonBookingWindowPage.submit()
      const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)
      prisonConfigPage.getMinBookingWindow().contains(10)
      prisonConfigPage.getMaxBookingWindow().contains(20)
    })
  })

  describe('Prison contact details', () => {
    const prison = TestData.prison()

    it('should display prison booking window details', () => {
      cy.task('stubGetPrison', prison)
      const prisonContactDetails = TestData.prisonContactDetails()

      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)

      prisonConfigPage.getEmail().contains(prisonContactDetails.emailAddress)
      prisonConfigPage.getPhone().contains(prisonContactDetails.phoneNumber)
      prisonConfigPage.getWebAddress().contains(prisonContactDetails.webAddress)
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
