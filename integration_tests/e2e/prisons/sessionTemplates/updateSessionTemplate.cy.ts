import { SessionTemplate } from '../../../../server/data/visitSchedulerApiTypes'
import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import UpdateSessionTemplatePage from '../../../pages/prisons/sessionTemplates/updateSessionTemplate'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - update', () => {
  const prison = TestData.prison()
  const sessionTemplate = TestData.sessionTemplate()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should view and then update a session template', () => {
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      sessionTemplateVisitStats: TestData.sessionTemplateVisitStatsDto({ visitCount: 0, visitsByDate: [] }),
    })

    // On view single session template page, select update template
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prison.code, sessionTemplate)
    viewSingleSessionTemplatePage.updateTemplate()
    const updateSessionTemplatePage = Page.verifyOnPageTitle(UpdateSessionTemplatePage, prison.name)

    // Update template fields
    const updatedSessionTemplate: SessionTemplate = {
      ...sessionTemplate,
      name: 'Updated template name',
      sessionDateRange: { validFromDate: '2023-04-01', validToDate: '2023-08-31' },
      sessionCapacity: { open: 40, closed: 5 },
      visitRoom: 'New visit room',
      clients: [
        { active: true, userType: 'STAFF' },
        { active: false, userType: 'PUBLIC' },
      ],
    }
    updateSessionTemplatePage.enterName(updatedSessionTemplate.name)
    updateSessionTemplatePage.enterValidFromDate(updatedSessionTemplate.sessionDateRange.validFromDate)
    updateSessionTemplatePage.enterValidToDate(updatedSessionTemplate.sessionDateRange.validToDate)
    updateSessionTemplatePage.enterOpenCapacity(updatedSessionTemplate.sessionCapacity.open)
    updateSessionTemplatePage.enterClosedCapacity(updatedSessionTemplate.sessionCapacity.closed)
    updateSessionTemplatePage.enterVisitRoom(updatedSessionTemplate.visitRoom)
    updateSessionTemplatePage.togglePublicVisibility()

    // Submit form to update template
    cy.task('stubUpdateSessionTemplate', { sessionTemplate: updatedSessionTemplate })
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: updatedSessionTemplate })
    updateSessionTemplatePage.updateTemplate()

    // Finish in single session template view with success message
    viewSingleSessionTemplatePage
      .successMessage()
      .contains(`Session template '${updatedSessionTemplate.name}' has been updated`)
    viewSingleSessionTemplatePage.getReference().contains(updatedSessionTemplate.reference)
  })
})
