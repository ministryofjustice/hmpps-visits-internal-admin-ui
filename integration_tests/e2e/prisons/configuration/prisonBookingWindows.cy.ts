import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import PrisonBookingWindowsPage from '../../../pages/prisons/configuration/prisonBookingWindows'

context('Prison configuration - booking windows', () => {
  const prisonCode = 'HEI'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetPrisonContactDetails', { prisonCode })
    cy.task('stubGetNegativeBalanceCount', {})
  })

  const prisonDto = TestData.prisonDto({
    clients: [
      TestData.prisonUserClientDto(), // default is STAFF, min 2; max 28 day windows
      TestData.prisonUserClientDto({
        active: false,
        userType: 'PUBLIC',
        policyNoticeDaysMin: 1,
        policyNoticeDaysMax: 14,
      }),
    ],
  })

  it('should should update prison booking windows', () => {
    cy.task('stubGetPrison', prisonDto)

    // prison config page - should have current booking window values
    const prisonConfigPage = PrisonConfigPage.goTo(prisonCode)
    prisonConfigPage.getMinBookingWindow('STAFF').contains(2)
    prisonConfigPage.getMaxBookingWindow('STAFF').contains(28)
    prisonConfigPage.getMinBookingWindow('PUBLIC').contains(1)
    prisonConfigPage.getMaxBookingWindow('PUBLIC').contains(14)

    // edit booking window
    prisonConfigPage.editBookingWindows()
    const prisonBookingWindowPage = Page.verifyOnPageTitle(PrisonBookingWindowsPage, TestData.prison().name)
    prisonBookingWindowPage.getMinBookingWindow().should('have.value', prisonDto.policyNoticeDaysMin)
    prisonBookingWindowPage.getMaxBookingWindow().should('have.value', prisonDto.policyNoticeDaysMax)

    // update min / max values and submit
    const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })
    cy.task('stubUpdatePrison', { prisonDto: { ...prisonDto, ...updatePrisonDto }, updatePrisonDto })
    cy.task('stubGetPrison', {
      ...{
        ...prisonDto,
        clients: [
          TestData.prisonUserClientDto({
            active: true,
            userType: 'STAFF',
            policyNoticeDaysMin: 10,
            policyNoticeDaysMax: 20,
          }),
          TestData.prisonUserClientDto({
            active: false,
            userType: 'PUBLIC',
            policyNoticeDaysMin: 1,
            policyNoticeDaysMax: 14,
          }),
        ],
      },
    })
    prisonBookingWindowPage.enterMinBookingWindow(updatePrisonDto.policyNoticeDaysMin.toString())
    prisonBookingWindowPage.enterMaxBookingWindow(updatePrisonDto.policyNoticeDaysMax.toString())
    prisonBookingWindowPage.submit()

    // new values should be on config page
    prisonConfigPage.getMinBookingWindow('STAFF').contains(10)
    prisonConfigPage.getMaxBookingWindow('STAFF').contains(20)
    prisonConfigPage.getMinBookingWindow('PUBLIC').contains(1)
    prisonConfigPage.getMaxBookingWindow('PUBLIC').contains(14)
  })
})
