import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - delete', () => {
  const prison = TestData.prison()
  const sessionTemplate = TestData.sessionTemplate({ active: false })
  const visitStats = TestData.visitStats()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should delete a session template and return to the listing page', () => {
    // Given
    cy.task('stubGetSessionTemplates', {
      prisonCode: prison.code,
      sessionTemplates: [sessionTemplate],
    })
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      visitStats,
    })
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prison.code, sessionTemplate)

    // When
    cy.task('stubDeleteSessionTemplate', { sessionTemplate })
    viewSingleSessionTemplatePage.deleteTemplate()

    // Then
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    viewSessionTemplatesPage.successMessage().contains(`Session template '${sessionTemplate.name}' has been deleted`)
  })
})
