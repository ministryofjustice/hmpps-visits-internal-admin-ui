import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplatePage'

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
    cy.task('stubGetAllPrisons')
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
    const viewSessionTemplatePage = Page.createPage(ViewSingleSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate.reference)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'Active')
    label.should('not.include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.disabled')
  })

  it('when active session template is deactivated details should change accordingly', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSessionTemplatePage = Page.createPage(ViewSingleSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, activeSessionTemplate.reference)

    // When
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.enabled')
  })
})
