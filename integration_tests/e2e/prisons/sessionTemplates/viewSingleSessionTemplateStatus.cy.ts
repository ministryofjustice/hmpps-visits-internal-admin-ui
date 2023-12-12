import TestData from '../../../../server/routes/testutils/testData'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - status', () => {
  const prison = TestData.prison()
  const activeSessionTemplate = TestData.sessionTemplate({ active: true })
  const deactivatedSessionTemplate = TestData.sessionTemplate({ active: false })

  const visitStats = TestData.visitStats()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubActivateSessionTemplate')
    cy.task('stubDeactivateSessionTemplate')
  })

  it('should activate an inactive session template', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prison.code, deactivatedSessionTemplate)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    viewSingleSessionTemplatePage.activateTemplate()

    // Then
    viewSingleSessionTemplatePage.getStatus().contains('Active')
    viewSingleSessionTemplatePage.getTemplateStatusButton().should('include.text', 'Deactivate')
    viewSingleSessionTemplatePage.getDeleteTemplateButton().should('be.disabled')
  })

  it('should deactivate an active session template', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prison.code, activeSessionTemplate)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    viewSingleSessionTemplatePage.deactivateTemplate()

    // Then
    viewSingleSessionTemplatePage.getStatus().contains('Inactive')
    viewSingleSessionTemplatePage.getTemplateStatusButton().should('include.text', 'Activate')
    viewSingleSessionTemplatePage.getDeleteTemplateButton().should('not.be.disabled')
  })
})
