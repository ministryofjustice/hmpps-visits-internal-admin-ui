import TestData from '../../../../server/routes/testutils/testData'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Change active/inactive session template', () => {
  const prisonCode = 'HEI'
  let deactivatedSessionTemplate = null
  let activeSessionTemplate = null

  const visitStats = TestData.visitStats()

  beforeEach(() => {
    const activePrison = TestData.prisonDto({ active: true })
    activeSessionTemplate = TestData.sessionTemplate({ active: true })
    deactivatedSessionTemplate = TestData.sessionTemplate({ active: false })
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubPrisons')
    cy.task('stubActivateSessionTemplate')
    cy.task('stubDeactivateSessionTemplate')

    cy.signIn()
  })

  it('when inactive session template is activated details should change accordingly', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    viewSingleSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSingleSessionTemplatePage.getStatus()
    label.should('include.text', 'Active')
    label.should('not.include.text', 'Inactive')
    viewSingleSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
    viewSingleSessionTemplatePage.getDeleteSessionTemplateButton().should('be.disabled')
  })

  it('when active session template is deactivated details should change accordingly', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prisonCode, activeSessionTemplate)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    viewSingleSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSingleSessionTemplatePage.getStatus()
    label.should('include.text', 'Inactive')
    viewSingleSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
    viewSingleSessionTemplatePage.getDeleteSessionTemplateButton().should('be.enabled')
  })
})
