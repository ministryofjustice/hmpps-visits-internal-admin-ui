import { UserClientType } from '../../../../server/data/visitSchedulerApiTypes'
import Page, { PageElement } from '../../page'

export default class PrisonBookingWindowsPage extends Page {
  constructor(prisonName: string) {
    super(`${prisonName} Edit prison booking windows`)
  }

  getMinBookingWindow = (service: UserClientType): PageElement => cy.get(`input[name="minDays[${service}]"]`)

  getMaxBookingWindow = (service: UserClientType): PageElement => cy.get(`input[name="maxDays[${service}]"]`)

  enterMinBookingWindow = (service: UserClientType, value: string): void => {
    cy.get(`input[name="minDays[${service}]"]`).clear()
    cy.get(`input[name="minDays[${service}]"]`).type(value)
  }

  enterMaxBookingWindow = (service: UserClientType, value: string): void => {
    cy.get(`input[name="maxDays[${service}]"]`).clear()
    cy.get(`input[name="maxDays[${service}]"]`).type(value)
  }

  submit = (): void => {
    cy.get('[data-test="submit"]').contains('Update').click()
  }
}
