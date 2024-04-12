import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import PrisonBookingWindowPage from '../../../pages/prisons/configuration/prisonBookingWindowForm'

context('Prison configuration', () => {
  const prisonCode = 'HEI'

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

    it('should display prison booking window details', () => {
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
})
