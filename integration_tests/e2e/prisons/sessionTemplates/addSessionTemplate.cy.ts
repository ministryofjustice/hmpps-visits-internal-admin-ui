import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import AddSessionTemplatePage from '../../../pages/prisons/sessionTemplates/addSessionTemplate'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import ViewSingleSessionTemplatePage from '../../../pages/prisons/sessionTemplates/viewSingleSessionTemplate'

context('Session templates - add', () => {
  const prison = TestData.prison()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.signIn()

    cy.task('stubGetPrison', TestData.prisonDto())
  })

  it('should add a session template from the listings page', () => {
    const categoryGroupOne = TestData.categoryGroup()
    const categoryGroupTwo = TestData.categoryGroup({
      name: 'Female Aware',
      categories: ['FEMALE_RESTRICTED'],
      reference: '-sfe~dcb~fc',
    })

    const incentiveLevelGroupOne = TestData.incentiveGroup()
    const incentiveLevelGroupTwo = TestData.incentiveGroup({
      name: 'Super Enhanced',
      incentiveLevels: ['ENHANCED_2'],
      reference: '-bfe~dcb~fc',
    })

    const locationGroupOne = TestData.locationGroup()
    const locationGroupTwo = TestData.locationGroup({
      name: 'C Wing D2 cell',
      locations: [
        {
          levelOneCode: 'C',
          levelTwoCode: 'S',
          levelThreeCode: 'L2',
          levelFourCode: 'D2',
        },
      ],
      reference: '-lfe~dcb~fc',
    })

    const sessionTemplate = TestData.sessionTemplate({
      name: 'New session template',
      prisonerCategoryGroups: [categoryGroupOne, categoryGroupTwo],
      prisonerIncentiveLevelGroups: [incentiveLevelGroupOne, incentiveLevelGroupTwo],
      permittedLocationGroups: [locationGroupOne, locationGroupTwo],
      sessionDateRange: { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
    })

    cy.task('stubGetSessionTemplates', { prisonCode: prison.code })
    cy.task('stubGetIncentiveGroups', {
      prisonCode: prison.code,
      body: [incentiveLevelGroupOne, incentiveLevelGroupTwo],
    })
    cy.task('stubGetCategoryGroups', { prisonCode: prison.code, body: [categoryGroupOne, categoryGroupTwo] })
    cy.task('stubGetLocationGroups', { prisonCode: prison.code, body: [locationGroupOne, locationGroupTwo] })

    // Session templates listing page - click 'Add'
    const viewSessionTemplatesPage = ViewSessionTemplatesPage.goTo(prison.code)
    viewSessionTemplatesPage.getAddSessionTemplateButton().click()

    // Enter details for new session template
    const addSessionTemplatePage = Page.verifyOnPageTitle(AddSessionTemplatePage, prison.name)
    addSessionTemplatePage.enterName(sessionTemplate.name)
    addSessionTemplatePage.selectDayOfWeek(sessionTemplate.dayOfWeek)
    addSessionTemplatePage.enterStartTime(sessionTemplate.sessionTimeSlot.startTime)
    addSessionTemplatePage.enterEndTime(sessionTemplate.sessionTimeSlot.endTime)
    addSessionTemplatePage.enterWeeklyFrequency(sessionTemplate.weeklyFrequency)
    addSessionTemplatePage.enterValidFromDate(sessionTemplate.sessionDateRange.validFromDate)
    addSessionTemplatePage.enterValidToDate(sessionTemplate.sessionDateRange.validToDate)
    addSessionTemplatePage.enterOpenCapacity(sessionTemplate.sessionCapacity.open)
    addSessionTemplatePage.enterClosedCapacity(sessionTemplate.sessionCapacity.closed)
    addSessionTemplatePage.enterVisitRoom(sessionTemplate.visitRoom)
    addSessionTemplatePage.addCategoryGroups([categoryGroupOne, categoryGroupTwo])
    addSessionTemplatePage.addIncentiveGroups([incentiveLevelGroupOne, incentiveLevelGroupTwo])
    addSessionTemplatePage.addLocationGroups([locationGroupOne, locationGroupTwo])

    // Submit form to add template
    cy.task('stubCreateSessionTemplate', { sessionTemplate })
    cy.task('stubGetSingleSessionTemplate', { sessionTemplate })
    cy.task('stubGetTemplateStats', {
      reference: sessionTemplate.reference,
      visitStats: TestData.visitStats({ visitCount: 0, visitsByDate: [] }),
    })
    addSessionTemplatePage.addTemplate()

    // Finish in single session template view with success message
    const viewSingleSessionTemplatePage = Page.verifyOnPageTitle(ViewSingleSessionTemplatePage, prison.name)
    viewSingleSessionTemplatePage
      .successMessage()
      .contains(`Session template '${sessionTemplate.name}' has been created`)
    viewSingleSessionTemplatePage.getReference().contains(sessionTemplate.reference)
  })
})
