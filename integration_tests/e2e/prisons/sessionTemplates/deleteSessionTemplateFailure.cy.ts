import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'
import { SessionTemplatesRangeType } from '../../../../server/data/visitSchedulerApiTypes'

context('Delete a session template failure', () => {
  const prisonCode = 'HEI'
  let sessionTemplate = null

  const visitStats = TestData.visitStats()

  beforeEach(() => {
    const activePrison = TestData.prisonDto({ active: true })
    sessionTemplate = TestData.sessionTemplate({ active: false, prisonId: prisonCode, reference: '-act.dcc.0f' })
    const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'

    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })

    cy.task('stubDeleteSessionTemplateFailure', {
      sessionTemplate,
    })
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    cy.signIn()
  })

  it('when session template is deleted but validation fails on backend user should be shown error message', () => {
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      visitStats,
    })

    // Given
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prisonCode, sessionTemplate)

    // When
    viewSingleSessionTemplatePage.getDeleteSessionTemplateButton().click()

    // Then
    const viewSessionTemplatePageFailure = Page.verifyOnPageTitle(ViewSingleSessionTemplatePage, sessionTemplate.name)
    viewSessionTemplatePageFailure
      .errorSummary()
      .contains(`Failed to delete session template with reference - ${sessionTemplate.reference}`)
  })
})
