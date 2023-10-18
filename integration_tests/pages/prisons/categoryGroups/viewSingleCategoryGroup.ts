import { CategoryGroup } from '../../../../server/data/visitSchedulerApiTypes'
import Page, { PageElement } from '../../page'

export default class ViewSingleCategoryGroupPage extends Page {
  constructor(title: string) {
    super(title)
  }

  static goTo(prisonCode: string, categoryGroup: CategoryGroup): ViewSingleCategoryGroupPage {
    cy.visit(`/prisons/${prisonCode}/category-groups/${categoryGroup.reference}`)
    return Page.verifyOnPageTitle(ViewSingleCategoryGroupPage, categoryGroup.name)
  }

  getGroupReference = (): PageElement => cy.get('.test-template-reference')

  getLevel = (index: number): PageElement => cy.get('.test-template-categories li').eq(index)

  delete = (): void => {
    cy.get('[data-test="category-group-delete-button"]').click()
  }
}
