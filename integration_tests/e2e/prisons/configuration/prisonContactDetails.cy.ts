import TestData from '../../../../server/routes/testutils/testData'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'

context('Prison configuration - contact details', () => {
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
})
