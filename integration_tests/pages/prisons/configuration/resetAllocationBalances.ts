import Page, { PageElement } from '../../page'

export default class ResetAllocationBalancesPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Reset negative visit allocation balances`)
  }

  getNegativeBalanceCount = (): PageElement => cy.get('[data-test=negative-balance-count]')

  resetNegativeBalances = (): void => {
    this.clickDisabledOnSubmitButton('visit-allocation-reset')
  }
}
