import type { PageElement } from '../../page'
import Page from '../../page'

export default class ViewCategoryGroupsPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  static goTo(prisonCode: string): ViewCategoryGroupsPage {
    cy.visit(`/prisons/${prisonCode}/category-groups`)
    return Page.verifyOnPage(ViewCategoryGroupsPage)
  }

  getCategoryGroup = (index: number): PageElement => cy.get('[data-test="category-group-name"] a').eq(index)

  getCategoryGroupLevels = (index: number): PageElement => cy.get('[data-test="category-group-levels"]').eq(index)

  addCategoryGroupButton = (): PageElement => cy.get('[data-test="add-category-group"]')
}
