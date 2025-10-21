import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import ResetAllocationBalancesPage from '../../../pages/prisons/configuration/resetAllocationBalances'

context('Prison configuration - reset negative visit allocation balances', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  const prisonDto = TestData.prisonDto()

  it('should reset negative visit allocation balances', () => {
    cy.task('stubGetPrison', prisonDto)
    cy.task('stubGetPrisonContactDetails', { prisonCode: prisonDto.code })
    cy.task('stubGetNegativeBalanceCount', {})

    // prison config page - should show negative balance count
    const prisonConfigPage = PrisonConfigPage.goTo(prisonDto.code)
    prisonConfigPage.getNegativeBalanceCount().contains('3 prisoners')
    prisonConfigPage.resetNegativeBalancesButton().click()

    // reset allocation confirmation page
    const resetAllocationBalancesPage = Page.verifyOnPageTitle(ResetAllocationBalancesPage, TestData.prison().name)
    resetAllocationBalancesPage.getNegativeBalanceCount().contains('3 prisoners')

    // reset allocation and return to prison config page with message
    cy.task('stubResetNegativeBalances', {})
    cy.task('stubGetNegativeBalanceCount', {
      prisonNegativeBalanceCount: TestData.prisonNegativeBalanceCount({ count: 0 }),
    })
    resetAllocationBalancesPage.resetNegativeBalances()
    prisonConfigPage.checkOnPage()
    prisonConfigPage.successMessage().contains('Visit allocation balances reset')
    resetAllocationBalancesPage.getNegativeBalanceCount().contains('0 prisoners')
    prisonConfigPage.resetNegativeBalancesButton().should('not.exist')
  })
})
