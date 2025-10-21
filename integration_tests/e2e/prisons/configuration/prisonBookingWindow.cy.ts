import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import PrisonBookingWindowPage from '../../../pages/prisons/configuration/prisonBookingWindow'

context('Prison configuration - booking window', () => {
  const prisonCode = 'HEI'

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

  const prisonDto = TestData.prisonDto()

  it('should should update prison booking window details', () => {
    cy.task('stubGetPrison', prisonDto)

    // prison config page - should have current booking window values
    const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)
    prisonConfigPage.getMinBookingWindow().contains(prisonDto.policyNoticeDaysMin)
    prisonConfigPage.getMaxBookingWindow().contains(prisonDto.policyNoticeDaysMax)

    // edit booking window
    prisonConfigPage.editBookingWindow()
    const prisonBookingWindowPage = Page.verifyOnPageTitle(PrisonBookingWindowPage, TestData.prison().name)
    prisonBookingWindowPage.getMinBookingWindow().should('have.value', prisonDto.policyNoticeDaysMin)
    prisonBookingWindowPage.getMaxBookingWindow().should('have.value', prisonDto.policyNoticeDaysMax)

    // update min / max values and submit
    const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })
    cy.task('stubUpdatePrison', { prisonDto: { ...prisonDto, ...updatePrisonDto }, updatePrisonDto })
    cy.task('stubGetPrison', {
      ...prisonDto,
      policyNoticeDaysMin: updatePrisonDto.policyNoticeDaysMin,
      policyNoticeDaysMax: updatePrisonDto.policyNoticeDaysMax,
    })
    prisonBookingWindowPage.enterMinBookingWindow(updatePrisonDto.policyNoticeDaysMin.toString())
    prisonBookingWindowPage.enterMaxBookingWindow(updatePrisonDto.policyNoticeDaysMax.toString())
    prisonBookingWindowPage.submit()

    // new values should be on config page
    prisonConfigPage.getMinBookingWindow().contains(updatePrisonDto.policyNoticeDaysMin)
    prisonConfigPage.getMaxBookingWindow().contains(updatePrisonDto.policyNoticeDaysMax)
  })
})
