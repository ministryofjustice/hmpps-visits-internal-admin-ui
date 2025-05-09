import { UserClientDto } from '../../../../server/data/visitSchedulerApiTypes'
import TestData from '../../../../server/routes/testutils/testData'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'

context('Prison configuration - enabled services', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  describe('Prison enabled services configuration', () => {
    const prisonDto = TestData.prisonDto()

    it('should update prison enabled services', () => {
      cy.task('stubGetPrison', prisonDto)
      cy.task('stubGetPrisonContactDetails', { prisonCode: prisonDto.code })

      // prison config page - should have default enabled services config
      const prisonConfigPage = PrisonConfigPage.goTo(prisonDto.code)
      prisonConfigPage.prisonClientsLabel().contains('Staff')
      prisonConfigPage.getService('STAFF').should('be.checked')
      prisonConfigPage.getService('PUBLIC').should('not.be.checked')

      // deactivate both services, update and check
      prisonConfigPage.deactivateService('STAFF')
      prisonConfigPage.deactivateService('PUBLIC')
      cy.task('stubDeactivatePrisonClientType', { prisonCode: prisonDto.code, type: 'STAFF' })
      cy.task('stubDeactivatePrisonClientType', { prisonCode: prisonDto.code, type: 'PUBLIC' })
      cy.task('stubGetPrison', { ...prisonDto, clients: [] })
      prisonConfigPage.updateEnabledServices()
      prisonConfigPage.successMessage().contains('Enabled services have been updated')
      prisonConfigPage.prisonClientsLabel().contains('None')
      prisonConfigPage.getService('STAFF').should('not.be.checked')
      prisonConfigPage.getService('PUBLIC').should('not.be.checked')

      // activate both services, update and check
      prisonConfigPage.activateService('STAFF')
      prisonConfigPage.activateService('PUBLIC')
      cy.task('stubActivatePrisonClientType', { prisonCode: prisonDto.code, type: 'STAFF' })
      cy.task('stubActivatePrisonClientType', { prisonCode: prisonDto.code, type: 'PUBLIC' })
      cy.task('stubGetPrison', {
        ...prisonDto,
        clients: <UserClientDto[]>[
          { active: true, userType: 'STAFF' },
          { active: true, userType: 'PUBLIC' },
        ],
      })
      prisonConfigPage.updateEnabledServices()
      prisonConfigPage.successMessage().contains('Enabled services have been updated')
      prisonConfigPage.prisonClientsLabel().contains('Staff Public')
      prisonConfigPage.getService('STAFF').should('be.checked')
      prisonConfigPage.getService('PUBLIC').should('be.checked')
    })
  })
})
