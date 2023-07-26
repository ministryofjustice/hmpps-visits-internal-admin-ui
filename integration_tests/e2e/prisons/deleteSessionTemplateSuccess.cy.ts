import TestData from '../../../server/routes/testutils/testData'
import Page from '../../pages/page'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplatePage'
import ViewSessionTemplatesPage from '../../pages/prisons/viewSessionTemplatesPage'
import { SessionTemplatesRangeType } from '../../../server/data/visitSchedulerApiTypes'

context('Delete a session template success', () => {
  const prisonCode = 'HEI'
  let sessionTemplate = null

  beforeEach(() => {
    const activePrison = TestData.prisonDto({ active: true })
    sessionTemplate = TestData.sessionTemplate({ active: false, prisonId: prisonCode, reference: '-act.dcc.0f' })
    const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'

    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplate', { sessionTemplate })

    cy.task('stubDeleteSessionTemplate', {
      sessionTemplate,
    })
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType })

    cy.signIn()
  })

  it('when session template is deleted user should be redirected to session templates screen', () => {
    // Given
    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)
    viewSessionTemplatePage.goTo(prisonCode, sessionTemplate.reference)

    // When
    viewSessionTemplatePage.getDeleteSessionTemplateButton().click()

    // Then
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    viewSessionTemplatesPage.successMessage().contains(`Session template '${sessionTemplate.name}' has been deleted`)
  })
})
