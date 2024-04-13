import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import PrisonContactDetailsPage from '../../../pages/prisons/configuration/prisonContactDetails'

context('Prison configuration - contact details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  describe('Prison contact details', () => {
    const prisonDto = TestData.prisonDto()

    it('should add and update prison contact details', () => {
      cy.task('stubGetPrison', prisonDto)
      cy.task('stubGetPrisonContactDetailsNotFound', prisonDto.code)

      // prison config page - should have no contact details
      const prisonConfigPage = PrisonConfigPage.goTo(prisonDto.code)
      cy.contains('No contact details have been entered for this prison')

      // add contact details and submit
      prisonConfigPage.addContactDetails()
      const addPrisonContactDetailsPage = Page.verifyOnPageTitle(
        PrisonContactDetailsPage,
        `${TestData.prison().name} Add contact details`,
      )
      const prisonContactDetails = TestData.prisonContactDetails()
      cy.task('stubCreatePrisonContactDetails', { prisonCode: prisonDto.code, prisonContactDetails })
      cy.task('stubGetPrisonContactDetails', { prisonCode: prisonDto.code, prisonContactDetails })
      addPrisonContactDetailsPage.enterEmail(prisonContactDetails.emailAddress)
      addPrisonContactDetailsPage.enterPhoneNumber(prisonContactDetails.phoneNumber)
      addPrisonContactDetailsPage.enterWebAddress(prisonContactDetails.webAddress)
      addPrisonContactDetailsPage.addContactDetails()

      // newly-added contact details should be on config page
      prisonConfigPage.getEmail().contains(prisonContactDetails.emailAddress)
      prisonConfigPage.getPhone().contains(prisonContactDetails.phoneNumber)
      prisonConfigPage.getWebAddress().contains(prisonContactDetails.webAddress)

      // edit contact details and submit
      const updatedPrisonContactDetails = TestData.prisonContactDetails({
        emailAddress: 'visits2@example.com',
        phoneNumber: null,
        webAddress: null,
      })

      cy.task('stubUpdatePrisonContactDetails', {
        prisonCode: prisonDto.code,
        prisonContactDetails: updatedPrisonContactDetails,
      })
      cy.task('stubGetPrisonContactDetails', {
        prisonCode: prisonDto.code,
        prisonContactDetails: updatedPrisonContactDetails,
      })
      prisonConfigPage.editContactDetails()
      const editPrisonContactDetailsPage = Page.verifyOnPageTitle(
        PrisonContactDetailsPage,
        `${TestData.prison().name} Edit contact details`,
      )
      editPrisonContactDetailsPage.enterEmail(updatedPrisonContactDetails.emailAddress)
      editPrisonContactDetailsPage.enterPhoneNumber(' ')
      editPrisonContactDetailsPage.enterWebAddress(' ')
      editPrisonContactDetailsPage.updateContactDetails()

      // prison config page - should have updated contact details
      prisonConfigPage.getEmail().contains(updatedPrisonContactDetails.emailAddress)
      prisonConfigPage.getPhone().contains('Not set')
      prisonConfigPage.getWebAddress().contains('Not set')
    })
  })
})
