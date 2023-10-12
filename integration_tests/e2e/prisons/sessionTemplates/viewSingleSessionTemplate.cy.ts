import { format } from 'date-fns'
import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - single', () => {
  const prison = TestData.prison()
  const sessionTemplate = TestData.sessionTemplate()
  const inactiveSessionTemplate = TestData.sessionTemplate({ active: false })
  const visitStats = TestData.visitStats()

  const mediumDateFormat = 'd MMMM yyyy'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubGetSessionTemplates', {
      prisonCode: prison.code,
      sessionTemplates: [sessionTemplate],
    })
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      visitStats,
    })
  })

  it('should navigate to view a single session template from the listing page', () => {
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })

    // start on listings page
    const viewSessionTemplatesPage = ViewSessionTemplatesPage.goTo(prison.code)

    // navigate to view single session template page
    viewSessionTemplatesPage.getSessionTemplate(0).click()
    const viewSingleSessionTemplatePage = Page.verifyOnPageTitle(ViewSingleSessionTemplatePage, prison.name)
    viewSingleSessionTemplatePage.getStatus().contains('active', { matchCase: false })
    viewSingleSessionTemplatePage.getReference().contains(sessionTemplate.reference)
    viewSingleSessionTemplatePage.getDayOfWeek().contains(sessionTemplate.dayOfWeek, { matchCase: false })
    viewSingleSessionTemplatePage.getStartTime().contains(sessionTemplate.sessionTimeSlot.startTime)
    viewSingleSessionTemplatePage.getEndTime().contains(sessionTemplate.sessionTimeSlot.endTime)
    viewSingleSessionTemplatePage.getOpenCapacity().contains(sessionTemplate.sessionCapacity.open)
    viewSingleSessionTemplatePage.getClosedCapacity().contains(sessionTemplate.sessionCapacity.closed)
    viewSingleSessionTemplatePage
      .getValidFromDate()
      .contains(format(new Date(sessionTemplate.sessionDateRange.validFromDate), mediumDateFormat))
    viewSingleSessionTemplatePage.getValidToDate().contains('No end date')
    viewSingleSessionTemplatePage.getVisitRoom().contains(sessionTemplate.visitRoom)
    viewSingleSessionTemplatePage.getWeeklyFrequency().contains(sessionTemplate.weeklyFrequency)
    viewSingleSessionTemplatePage.getCategoryGroups().contains('None')
    viewSingleSessionTemplatePage.getIncentiveGroups().contains('None')
    viewSingleSessionTemplatePage.getLocationGroups().contains('None')
  })

  it('should delete a session template and return to the listing page', () => {
    // Given
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate: inactiveSessionTemplate })
    const viewSingleSessionTemplatePage = ViewSingleSessionTemplatePage.goTo(prison.code, inactiveSessionTemplate)

    // When
    cy.task('stubDeleteSessionTemplate', { sessionTemplate: inactiveSessionTemplate })
    viewSingleSessionTemplatePage.deleteTemplate()

    // Then
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    viewSessionTemplatesPage
      .successMessage()
      .contains(`Session template '${inactiveSessionTemplate.name}' has been deleted`)
  })
})