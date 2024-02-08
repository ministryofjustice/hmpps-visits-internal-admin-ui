import { CategoryGroup, IncentiveGroup, LocationGroup } from '../../../../server/data/visitSchedulerApiTypes'
import Page from '../../page'

export default class AddSessionTemplatePage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Add session template`)
  }

  enterName = (name: string): void => {
    cy.get('#name').type(name)
  }

  selectDayOfWeek = (dayOfWeek: string): void => {
    cy.get('#dayOfWeek').select(dayOfWeek)
  }

  enterStartTime = (startTime: string): void => {
    cy.get('#startTime').type(startTime)
  }

  enterEndTime = (endTime: string): void => {
    cy.get('#endTime').type(endTime)
  }

  enterWeeklyFrequency = (frequency: number): void => {
    cy.get('#weeklyFrequency').type(frequency.toString())
  }

  enterValidFromDate = (date: string): void => {
    const splitDate = date.split('-')
    cy.get('#validFromDate-validFromDateDay').type(splitDate[2])
    cy.get('#validFromDate-validFromDateMonth').type(splitDate[1])
    cy.get('#validFromDate-validFromDateYear').type(splitDate[0])
  }

  enterValidToDate = (date: string): void => {
    const splitDate = date.split('-')
    cy.get('#hasEndDate').check({ force: true })
    cy.get('#validToDate-validToDateDay').type(splitDate[2])
    cy.get('#validToDate-validToDateMonth').type(splitDate[1])
    cy.get('#validToDate-validToDateYear').type(splitDate[0])
  }

  enterOpenCapacity = (capacity: number): void => {
    cy.get('#openCapacity').type(capacity.toString())
  }

  enterClosedCapacity = (capacity: number): void => {
    cy.get('#closedCapacity').type(capacity.toString())
  }

  enterVisitRoom = (room: string): void => {
    cy.get('#visitRoom').type(room)
  }

  addCategoryGroups = (categoryGroups: CategoryGroup[]): void => {
    cy.get('#hasCategoryGroups').check({ force: true })
    categoryGroups.forEach(categoryGroup => {
      cy.get('[data-test="category-groups"] label')
        .contains(categoryGroup.name)
        .siblings('input')
        .check({ force: true })
    })
  }

  addIncentiveGroups = (incentiveGroups: IncentiveGroup[]): void => {
    cy.get('#hasIncentiveGroups').check({ force: true })
    incentiveGroups.forEach(incentiveGroup => {
      cy.get('[data-test="incentive-groups"] label')
        .contains(incentiveGroup.name)
        .siblings('input')
        .check({ force: true })
    })
  }

  addLocationGroups = (locationGroups: LocationGroup[]): void => {
    cy.get('#hasLocationGroups').check({ force: true })
    locationGroups.forEach(locationGroup => {
      cy.get('[data-test="location-groups"] label')
        .contains(locationGroup.name)
        .siblings('input')
        .check({ force: true })
    })
  }

  addTemplate = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
