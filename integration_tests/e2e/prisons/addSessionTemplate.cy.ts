import TestData from '../../../server/routes/testutils/testData'
import Page from '../../pages/page'
import AddSessionTemplatePage from '../../pages/prisons/addSessionTemplatePage'
import ViewSessionTemplatesPage from '../../pages/prisons/viewSessionTemplatesPage'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplatePage'
import { SessionTemplatesRangeType } from '../../../server/data/visitSchedulerApiTypes'

context('Add session template', () => {
  const prisonCode = 'HEI'
  let sessionTemplate = null
  const incentiveLevelGroupOne = TestData.incentiveLevelGroup()
  const incentiveLevelGroupTwo = TestData.incentiveLevelGroup({
    name: 'Super Enhanced',
    incentiveLevels: ['ENHANCED_2'],
    reference: '-bfe~dcb~fc',
  })

  const categoryGroupOne = TestData.categoryGroup()
  const categoryGroupTwo = TestData.categoryGroup({
    name: 'Female Aware',
    categories: ['FEMALE_RESTRICTED'],
    reference: '-sfe~dcb~fc',
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
    cy.task('stubCategoryGroups', { prisonCode, body: [categoryGroupOne, categoryGroupTwo] })
    cy.task('stubLocationGroups', { prisonCode, body: [locationGroupOne, locationGroupTwo] })
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

  it('when on add session template page category groups are available', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage
      .getCategoryGroupCheckBoxes()
      .should('have.value', categoryGroupOne.reference, categoryGroupTwo.reference)
  })

  it('when on add session template page can select category groups', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage.getHasCategoryGroupsCheckBox().check()
    addSessionTemplatePage.getCategoryGroupCheckBoxes().check([categoryGroupOne.reference, categoryGroupTwo.reference])
  })

  it('when on add session template page location groups are available', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage
      .getLocationGroupCheckBoxes()
      .should('have.value', locationGroupOne.reference, locationGroupTwo.reference)
  })

  it('when on add session template page can select location groups', () => {
    // Given
    const addSessionTemplatePage = Page.createPage(AddSessionTemplatePage)

    // When
    addSessionTemplatePage.goTo(prisonCode)

    // Then
    addSessionTemplatePage.getHasLocationGroupsCheckBox().check()
    addSessionTemplatePage.getLocationGroupCheckBoxes().check([locationGroupOne.reference, locationGroupTwo.reference])
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
      categoryGroupReferences: [categoryGroupOne.reference, categoryGroupTwo.reference],
      incentiveLevelGroupReferences: [incentiveLevelGroupOne.reference, incentiveLevelGroupTwo.reference],
      locationGroupReferences: [locationGroupOne.reference, locationGroupTwo.reference],
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
    addSessionTemplatePage.getHasCategoryGroupsCheckBox().check()
    addSessionTemplatePage
      .getCategoryGroupCheckBoxes()
      .check([createSessionTemplate.categoryGroupReferences[0], createSessionTemplate.categoryGroupReferences[1]])
    addSessionTemplatePage.getHasLocationGroupsCheckBox().check()
    addSessionTemplatePage
      .getLocationGroupCheckBoxes()
      .check([createSessionTemplate.locationGroupReferences[0], createSessionTemplate.locationGroupReferences[1]])

    // When
    addSessionTemplatePage.clickSubmitButton()

    // Then
    viewSessionTemplatePage.checkOnPage()
    viewSessionTemplatePage.successMessage().contains(`Session template '${sessionTemplate.name}' has been created`)
  })
})
