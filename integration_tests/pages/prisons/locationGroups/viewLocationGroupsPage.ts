import type { PageElement } from '../../page'
import Page from '../../page'

export default class ViewLocationGroupsPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  static goTo(prisonCode: string): ViewLocationGroupsPage {
    cy.visit(`/prisons/${prisonCode}/location-groups`)
    return Page.verifyOnPage(ViewLocationGroupsPage)
  }

  getLocationGroup = (index: number): PageElement => cy.get('[data-test="location-group-name"] a').eq(index)

  getLocationGroupCount = (index: number): PageElement => cy.get('[data-test="location-group-count"]').eq(index)

  addLocationGroupButton = (): PageElement => cy.get('[data-test="add-location-group"]')
}
