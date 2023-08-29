import Page, { PageElement } from '../../page'

export default class ViewSingleIncentiveGroupPage extends Page {
  constructor(title: string) {
    super(title)
  }

  getGroupReference = (): PageElement => cy.get('.test-template-reference')

  getLevel = (index: number): PageElement => cy.get('.test-template-incentiveLevels li').eq(index)
}
