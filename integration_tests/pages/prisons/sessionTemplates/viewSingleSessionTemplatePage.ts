import { SessionTemplate } from '../../../../server/data/visitSchedulerApiTypes'
import Page, { PageElement } from '../../page'

export default class ViewSingleSessionTemplatePage extends Page {
  constructor(title: string) {
    super(title)
  }

  static goTo(prisonCode: string, sessionTemplate: SessionTemplate): ViewSingleSessionTemplatePage {
    cy.visit(`/prisons/${prisonCode}/session-templates/${sessionTemplate.reference}`)
    return Page.verifyOnPageTitle(ViewSingleSessionTemplatePage, sessionTemplate.name)
  }

  getStatus = (): PageElement => cy.get('.test-template-status-value')

  getReference = (): PageElement => cy.get('.test-template-reference')

  getDayOfWeek = (): PageElement => cy.get('.test-template-dayOfWeek')

  getStartTime = (): PageElement => cy.get('.test-template-startTime')

  getEndTime = (): PageElement => cy.get('.test-template-endTime')

  getOpenCapacity = (): PageElement => cy.get('.test-template-openCapacity')

  getClosedCapacity = (): PageElement => cy.get('.test-template-closedCapacity')

  getValidFromDate = (): PageElement => cy.get('.test-template-validFromDate')

  getValidToDate = (): PageElement => cy.get('.test-template-validToDate')

  getVisitRoom = (): PageElement => cy.get('.test-template-visitRoom')

  getWeeklyFrequency = (): PageElement => cy.get('.test-template-weeklyFrequency')

  getCategoryGroups = (): PageElement => cy.get('.test-template-categoryGroups')

  getIncentiveGroups = (): PageElement => cy.get('.test-template-incentiveGroups')

  getLocationGroups = (): PageElement => cy.get('.test-template-locationGroups')

  // switch status Activate <-> Deactivate
  getStatusSwitchButton = (): PageElement => cy.get('[data-test=session-template-change-status-button]')

  // delete session template button
  getDeleteSessionTemplateButton = (): PageElement => cy.get('[data-test=session-template-delete-button]')
}
