import TestData from '../../../server/routes/testutils/testData'
import Page from '../../pages/page'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplate'

context('Change active/inactive session template', () => {
  const prisonCode = 'HEI'
  let deactivatedSessionTemplate = null
  let activeSessionTemplate = null

  beforeEach(() => {
    const activePrison = TestData.prison({ active: true })
    deactivatedSessionTemplate = TestData.sessionTemplate({
      active: false,
      prisonId: prisonCode,
      reference: '-ina.dcc.0f',
    })
    activeSessionTemplate = TestData.sessionTemplate({ active: true, prisonId: prisonCode, reference: '-act.dcc.0f' })
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubActivateSessionTemplate', {
      sessionTemplate: deactivatedSessionTemplate,
      activeSessionTemplate,
    })
    cy.task('stubDeactivateSessionTemplate', {
      sessionTemplate: activeSessionTemplate,
      deactivatedSessionTemplate,
    })

    cy.signIn()
  })

  it('session template should be deactivated and button should activate', () => {
    // Given
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)

    // When
    viewSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate.reference)

    // Then
    viewSessionTemplatePage.sessionTemplateStatusLabel().should('include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
  })

  it('when inactive session template is activated details should change accordingly', () => {
    // Given
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, deactivatedSessionTemplate.reference)

    // When
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'activated')
    label.should('not.include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
  })

  it('session template should be activated and button should deactivate', () => {
    // Given
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)

    // When
    viewSessionTemplatePage.goTo(prisonCode, activeSessionTemplate.reference)

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'activated')
    label.should('not.include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
  })

  it('when active session template is deactivate details should change accordingly', () => {
    // Given
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, activeSessionTemplate.reference)

    // When
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const label = viewSessionTemplatePage.sessionTemplateStatusLabel()
    label.should('include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
  })
})
