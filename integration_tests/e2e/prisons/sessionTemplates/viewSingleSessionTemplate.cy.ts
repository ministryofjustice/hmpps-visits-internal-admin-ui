import { format } from 'date-fns'
import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - single', () => {
  const prison = TestData.prison()
  const sessionTemplate = TestData.sessionTemplate()
  const visitStats = TestData.visitStats()

  const mediumDateFormat = 'd MMMM yyyy'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should navigate to view a single session template from the listing page', () => {
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })
    cy.task('stubGetSessionTemplates', {
      prisonCode: prison.code,
      sessionTemplates: [sessionTemplate],
    })
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      visitStats,
    })

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
})
