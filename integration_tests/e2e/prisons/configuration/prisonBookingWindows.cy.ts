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

    // edit booking window - form should be pre-populated with current values
    prisonConfigPage.editBookingWindows()
    const prisonBookingWindowPage = Page.verifyOnPageTitle(PrisonBookingWindowsPage, TestData.prison().name)
    prisonBookingWindowPage.getMinBookingWindow('STAFF').should('have.value', 2)
    prisonBookingWindowPage.getMaxBookingWindow('STAFF').should('have.value', 28)
    prisonBookingWindowPage.getMinBookingWindow('PUBLIC').should('have.value', 1)
    prisonBookingWindowPage.getMaxBookingWindow('PUBLIC').should('have.value', 14)

    // update min / max values and submit
    const updatePrisonDto = TestData.updatePrisonDto({
      clients: [
        TestData.prisonUserClientDto({ policyNoticeDaysMin: 1, policyNoticeDaysMax: 29 }),
        TestData.prisonUserClientDto({
          active: false,
          userType: 'PUBLIC',
          policyNoticeDaysMin: 2,
          policyNoticeDaysMax: 15,
        }),
      ],
    })
    cy.task('stubUpdatePrison', { prisonDto: { ...prisonDto, ...updatePrisonDto }, updatePrisonDto })
    cy.task('stubGetPrison', {
      ...{
        ...prisonDto,
        clients: [
          TestData.prisonUserClientDto({
            active: true,
            userType: 'STAFF',
            policyNoticeDaysMin: 1,
            policyNoticeDaysMax: 29,
          }),
          TestData.prisonUserClientDto({
            active: false,
            userType: 'PUBLIC',
            policyNoticeDaysMin: 2,
            policyNoticeDaysMax: 15,
          }),
        ],
      },
    })

    prisonBookingWindowPage.enterMinBookingWindow('STAFF', '1')
    prisonBookingWindowPage.enterMaxBookingWindow('STAFF', '29')
    prisonBookingWindowPage.enterMinBookingWindow('PUBLIC', '2')
    prisonBookingWindowPage.enterMaxBookingWindow('PUBLIC', '15')
    prisonBookingWindowPage.submit()

    // new values should be on config page
    prisonConfigPage.getMinBookingWindow('STAFF').contains(1)
    prisonConfigPage.getMaxBookingWindow('STAFF').contains(29)
    prisonConfigPage.getMinBookingWindow('PUBLIC').contains(2)
    prisonConfigPage.getMaxBookingWindow('PUBLIC').contains(15)
  })
})
