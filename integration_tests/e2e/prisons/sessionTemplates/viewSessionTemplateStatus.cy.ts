import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatePage'

context('Change active/inactive session template', () => {
  const prisonCode = 'HEI'
  let deactivatedSessionTemplate = null
  let activeSessionTemplate = null

  const requestVisitStatsDto = TestData.requestVisitStatsDto({ visitsFromDate: new Date().toISOString().slice(0, 10) })
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

  it('session template should be deactivated and button should activate', () => {
    // Given
    cy.task('stubGetSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetTemplateStats', {
      requestVisitStatsDto,
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)

    // When
    viewSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate.reference)

    // Then
    viewSessionTemplatePage.sessionTemplateStatusLabel().should('include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.enabled')
  })

  it('when inactive session template is activated details should change accordingly', () => {
    // Given
    cy.task('stubGetSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetTemplateStats', {
      requestVisitStatsDto,
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate.reference)

    // When
    cy.task('stubGetSessionTemplate', { sessionTemplate: activeSessionTemplate })
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'Active')
    label.should('not.include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.disabled')
  })

  it('session template should be activated and button should deactivate', () => {
    // Given
    cy.task('stubGetSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubGetTemplateStats', {
      requestVisitStatsDto,
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)

    // When
    viewSessionTemplatePage.goTo(prisonCode, activeSessionTemplate.reference)

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'Active')
    label.should('not.include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.disabled')
  })

  it('when active session template is deactivated details should change accordingly', () => {
    // Given
    cy.task('stubGetSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubGetTemplateStats', {
      requestVisitStatsDto,
      reference: deactivatedSessionTemplate.reference,
      visitStats,
    })
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, activeSessionTemplate.reference)

    // When
    cy.task('stubGetSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'Inactive')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
    viewSessionTemplatePage.getDeleteSessionTemplateButton().should('be.enabled')
  })
})
