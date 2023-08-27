import PrisonPage from '../../prisonPage'

export default class AddViewSessionTemplatePage extends PrisonPage {
  constructor() {
    super('Hewell (HMP)')
  }

  goTo = (prisonCode: string) => cy.visit(`/prisons/${prisonCode}/session-templates/add`)

  clickSubmitButton = () => this.getByDataTest('submit').click()

  getNameInput = () => this.getById('name')

  getDayOfWeekInput = () => this.getById('dayOfWeek')

  getStartTimeInput = () => this.getById('startTime')

  getEndTimeInput = () => this.getById('endTime')

  getWeeklyFrequencyInput = () => this.getById('weeklyFrequency')

  enterValidFromDate = (date: Date) => {
    this.getById('validFromDate-validFromDateYear').type(date.getFullYear().toString())
    this.getById('validFromDate-validFromDateMonth').type((date.getMonth() + 1).toString())
    this.getById('validFromDate-validFromDateDay').type(date.getDate().toString())
  }

  getHasEndDateInput = () => this.getById('hasEndDate')

  enterValidToDate = (date: Date) => {
    this.getById('validToDate-validToDateYear').type(date.getFullYear().toString())
    this.getById('validToDate-validToDateMonth').type((date.getMonth() + 1).toString())
    this.getById('validToDate-validToDateDay').type(date.getDate().toString())
  }

  getOpenCapacityInput = () => this.getById('openCapacity')

  getClosedCapacityInput = () => this.getById('closedCapacity')

  getVisitRoomInput = () => this.getById('visitRoom')

  getSuccessMessage = () => this.getByClass('moj-banner__message')

  errorSummary = () => this.getByClass('govuk-error-summary')

  getHasIncentiveGroupsCheckBox = () => this.getById('hasIncentiveGroups')

  getIncentiveGroupCheckBoxes = () => this.getByName('incentiveGroupReferences')

  getHasCategoryGroupsCheckBox = () => this.getById('hasCategoryGroups')

  getCategoryGroupCheckBoxes = () => this.getByName('categoryGroupReferences')

  getHasLocationGroupsCheckBox = () => this.getById('hasLocationGroups')

  getLocationGroupCheckBoxes = () => this.getByName('locationGroupReferences')
}
