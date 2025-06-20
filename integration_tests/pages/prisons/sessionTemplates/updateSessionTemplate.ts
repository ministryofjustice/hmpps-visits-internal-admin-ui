import { CategoryGroup, IncentiveGroup, LocationGroup } from '../../../../server/data/visitSchedulerApiTypes'
import Page from '../../page'

export default class UpdateSessionTemplatePage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Update session template`)
  }

  enterName = (name: string): void => {
    cy.get('#name').clear()
    cy.get('#name').type(name)
  }

  enterValidFromDate = (date: string): void => {
    cy.get('#validFromDate input[type="text"]').each(input => {
      cy.wrap(input).clear()
    })
    const splitDate = date.split('-')
    cy.get('#validFromDate-validFromDateDay').type(splitDate[2])
    cy.get('#validFromDate-validFromDateMonth').type(splitDate[1])
    cy.get('#validFromDate-validFromDateYear').type(splitDate[0])
  }

  enterValidToDate = (date: string): void => {
    const splitDate = date.split('-')
    cy.get('#hasEndDate').check()
    cy.get('#validToDate-validToDateDay').type(splitDate[2])
    cy.get('#validToDate-validToDateMonth').type(splitDate[1])
    cy.get('#validToDate-validToDateYear').type(splitDate[0])
  }

  enterOpenCapacity = (capacity: number): void => {
    cy.get('#openCapacity').clear()
    cy.get('#openCapacity').type(capacity.toString())
  }

  enterClosedCapacity = (capacity: number): void => {
    cy.get('#closedCapacity').clear()
    cy.get('#closedCapacity').type(capacity.toString())
  }

  enterVisitRoom = (room: string): void => {
    cy.get('#visitRoom').clear()
    cy.get('#visitRoom').type(room)
  }

  addCategoryGroups = (categoryGroups: CategoryGroup[]): void => {
    cy.get('#hasCategoryGroups').check()
    categoryGroups.forEach(categoryGroup => {
      cy.get('[data-test="category-groups"] label').contains(categoryGroup.name).siblings('input').check()
    })
  }

  addIncentiveGroups = (incentiveGroups: IncentiveGroup[]): void => {
    cy.get('#hasIncentiveGroups').check()
    incentiveGroups.forEach(incentiveGroup => {
      cy.get('[data-test="incentive-groups"] label').contains(incentiveGroup.name).siblings('input').check()
    })
  }

  addLocationGroups = (locationGroups: LocationGroup[], behaviour: 'include' | 'exclude' = 'include'): void => {
    cy.get('#hasLocationGroups').check()
    cy.get(`input[name=locationGroupBehaviour][value=${behaviour}]`).check()
    locationGroups.forEach(locationGroup => {
      cy.get('[data-test="location-groups"] label').contains(locationGroup.name).siblings('input').check()
    })
  }

  setHiddenFromPublic = (hidden: boolean): void => {
    if (hidden) {
      cy.get('#hideInPublicServices').check()
    } else {
      cy.get('#hideInPublicServices').uncheck()
    }
  }

  updateTemplate = (): void => {
    cy.get('[data-test="submit"]').click()
  }
}
