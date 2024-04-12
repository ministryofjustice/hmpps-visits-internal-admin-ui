import TestData from '../../../../server/routes/testutils/testData'
import IndexPage from '../../../pages'
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
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrisonContactDetails', { prisonCode })
  })

  describe('Prison booking window displayed', () => {
    const prisonDto = TestData.prisonDto()

    it('should display prison contact details', () => {
      cy.task('stubGetPrison', prisonDto)

      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)

      prisonConfigPage.getMinBookingWindow().contains(prisonDto.policyNoticeDaysMin)
      prisonConfigPage.getMaxBookingWindow().contains(prisonDto.policyNoticeDaysMax)
    })

    it('when edit prison booking window button is pressed we should be on the edit form', () => {
      cy.task('stubGetPrison', prisonDto)

      const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)
      prisonConfigPage.pressPrisonBookingWindowEditButton()
      prisonConfigPage.isAtPath('/prisons/HEI/configuration/booking-window/edit')
    })
  })

  describe('Prison booking window update form', () => {
    const prisonDto = TestData.prisonDto()

    it('should display prison booking window details when on update form', () => {
      cy.task('stubGetPrison', prisonDto)

      const prisonBookingWindowPage = PrisonBookingWindowPage.goTo(prisonCode)
      prisonBookingWindowPage.getMinBookingWindow().should('have.value', prisonDto.policyNoticeDaysMin)
      prisonBookingWindowPage.getMaxBookingWindow().should('have.value', prisonDto.policyNoticeDaysMax)
    })

    it('should update min and max correctly when entered', () => {
      const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })

      cy.task('stubGetPrison', prisonDto)
      cy.task('stubUpdatePrison', { prisonDto: { ...prisonDto, ...updatePrisonDto }, updatePrisonDto })

      const prisonBookingWindowPage = PrisonBookingWindowPage.goTo(prisonCode)
      prisonBookingWindowPage.getMinBookingWindow().clear().type(String(updatePrisonDto.policyNoticeDaysMin))
      prisonBookingWindowPage.getMaxBookingWindow().clear().type(String(updatePrisonDto.policyNoticeDaysMax))
      cy.task('stubGetPrison', { ...prisonDto, ...updatePrisonDto })
      prisonBookingWindowPage.submit()
      const prisonConfigPage = Page.verifyOnPage(PrisonConfigPage)
      prisonConfigPage.getMinBookingWindow().contains(10)
      prisonConfigPage.getMaxBookingWindow().contains(20)
    })
  })

  describe('Prison contact details', () => {
    const prisonDto = TestData.prisonDto()

    it('should display prison booking window details', () => {
      cy.task('stubGetPrison', prisonDto)
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

      cy.task('stubActivatePrison', prisonCode)
      cy.task('stubGetPrison', activePrison)
      prisonConfigPage.activatePrison()
      prisonConfigPage.successMessage().contains('Hewell (HMP) has been activated')
      prisonConfigPage.prisonStatusLabel().contains('Active')
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

      cy.task('stubDeactivatePrison', prisonCode)
      cy.task('stubGetPrison', inactivePrison)
      prisonConfigPage.deactivatePrison()
      prisonConfigPage.successMessage().contains('Hewell (HMP) has been deactivated')
      prisonConfigPage.prisonStatusLabel().contains('Inactive')
    })
  })
})
