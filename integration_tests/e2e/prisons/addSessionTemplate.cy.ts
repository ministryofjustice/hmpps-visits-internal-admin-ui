import TestData from '../../../server/routes/testutils/testData'
import Page from '../../pages/page'
import AddSessionTemplatePage from '../../pages/prisons/addSessionTemplatePage'
import ViewSessionTemplatesPage from '../../pages/prisons/viewSessionTemplatesPage'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplatePage'
import { SessionTemplatesRangeType } from '../../../server/data/visitSchedulerApiTypes'

context('Change active/inactive session template', () => {
  const prisonCode = 'HEI'
  let sessionTemplate = null
  const incentiveLevelGroupOne = TestData.incentiveLevelGroup()
  const incentiveLevelGroupTwo = TestData.incentiveLevelGroup({
    name: 'Super Enhanced',
    incentiveLevels: ['ENHANCED_2'],
    reference: '-bfe~dcb~fc',
  })

  beforeEach(() => {
    const activePrison = TestData.prisonDto({ active: true, code: prisonCode })
    sessionTemplate = TestData.sessionTemplate({ active: false, prisonId: prisonCode })
    const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'

    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('stubGetAllPrisons')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubPrisons')
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType, sessionTemplates: [sessionTemplate] })
    cy.task('stubIncentiveGroups', { prisonCode, body: [incentiveLevelGroupOne, incentiveLevelGroupTwo] })
  })

  it('when on session template view clicking add session template should go to correct page', () => {
    // Given
    const viewSessionTemplatesPage = Page.createPage(ViewSessionTemplatesPage)
    viewSessionTemplatesPage.goTo(prisonCode)

    // When
    viewSessionTemplatesPage.getAddSessionTemplateLink().click()

    // Then
    Page.verifyOnPage(AddSessionTemplatePage)
  })

  it('when on add session template page incentive groups are available', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage
      .getIncentiveGroupCheckBoxes()
      .should('have.value', incentiveLevelGroupOne.reference, incentiveLevelGroupTwo.reference)
  })

  it('when on add session template page can select incentive groups', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage.getHasIncentiveGroupsCheckBox().check()
    addSessionTemplatePage
      .getIncentiveGroupCheckBoxes()
      .check([incentiveLevelGroupOne.reference, incentiveLevelGroupTwo.reference])
  })

  it('when on add session template page data can be submitted', () => {
    // Given
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + 14)

    const startDateString = startDate.toISOString().slice(0, 10)
    const endDateString = endDate.toISOString().slice(0, 10)
    cy.task('stubGetSessionTemplate', sessionTemplate)
    const createSessionTemplate = TestData.createSessionTemplateDto({
      sessionDateRange: {
        validFromDate: startDateString,
        validToDate: endDateString,
      },
      incentiveLevelGroupReferences: [incentiveLevelGroupOne.reference, incentiveLevelGroupTwo.reference],
    })
    cy.task('stubCreateSessionTemplatePost', { createSessionTemplate, sessionTemplate })

    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)
    addSessionTemplatePage.goTo(prisonCode)

    const viewSessionTemplatePage = Page.createPage(ViewSessionTemplatePage)

    // insert data info form
    addSessionTemplatePage.getNameInput().type(createSessionTemplate.name)
    addSessionTemplatePage.getDayOfWeekInput().select(createSessionTemplate.dayOfWeek)
    addSessionTemplatePage.getStartTimeInput().type(createSessionTemplate.sessionTimeSlot.startTime)
    addSessionTemplatePage.getEndTimeInput().type(createSessionTemplate.sessionTimeSlot.endTime)
    addSessionTemplatePage.getWeeklyFrequencyInput().type(createSessionTemplate.weeklyFrequency.toString())
    addSessionTemplatePage.enterValidFromDate(startDate)
    addSessionTemplatePage.getHasEndDateInput().check()
    addSessionTemplatePage.enterValidToDate(endDate)
    addSessionTemplatePage.getOpenCapacityInput().type(createSessionTemplate.sessionCapacity.open.toString())
    addSessionTemplatePage.getClosedCapacityInput().type(createSessionTemplate.sessionCapacity.closed.toString())
    addSessionTemplatePage.getVisitRoomInput().type(createSessionTemplate.visitRoom)
    addSessionTemplatePage.getHasIncentiveGroupsCheckBox().check()
    addSessionTemplatePage
      .getIncentiveGroupCheckBoxes()
      .check([
        createSessionTemplate.incentiveLevelGroupReferences[0],
        createSessionTemplate.incentiveLevelGroupReferences[1],
      ])

    // When
    addSessionTemplatePage.clickSubmitButton()

    // Then
    viewSessionTemplatePage.checkOnPage()
    viewSessionTemplatePage
      .successMessage()
      .contains(`Session template '${sessionTemplate.reference}' has been created`)
  })
})
