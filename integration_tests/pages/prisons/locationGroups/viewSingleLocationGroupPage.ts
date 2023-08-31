import { LocationGroup } from '../../../../server/data/visitSchedulerApiTypes'
import Page, { PageElement } from '../../page'

export default class ViewSingleLocationGroupPage extends Page {
  constructor(title: string) {
    super(title)
  }

  static goTo(prisonCode: string, locationGroup: LocationGroup): ViewSingleLocationGroupPage {
    cy.visit(`/prisons/${prisonCode}/location-groups/${locationGroup.reference}`)
    return Page.verifyOnPageTitle(ViewSingleLocationGroupPage, locationGroup.name)
  }

  getGroupReference = (): PageElement => cy.get('[data-test="reference"]')

  getLevelOneCode = (index: number): PageElement => cy.get(`[data-test="levelOneCode-${index}"]`)

  getLevelTwoCode = (index: number): PageElement => cy.get(`[data-test="levelTwoCode-${index}"]`)

  getLevelThreeCode = (index: number): PageElement => cy.get(`[data-test="levelThreeCode-${index}"]`)

  getLevelFourCode = (index: number): PageElement => cy.get(`[data-test="levelFourCode-${index}"]`)

  delete = (): void => {
    cy.get('[data-test="location-group-delete-button"]').click()
  }
}
