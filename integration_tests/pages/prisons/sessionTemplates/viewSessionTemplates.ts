import Page, { PageElement } from '../../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getSessionTemplatesTab().should('have.attr', 'aria-current', 'page')
  }

  static goTo(prisonCode: string): ViewSessionTemplatesPage {
    cy.visit(`/prisons/${prisonCode}/session-templates`)
    return Page.verifyOnPage(ViewSessionTemplatesPage)
  }

  getSessionTemplate = (index: number): PageElement => cy.get('[data-test="template-name"] a').eq(index)

  getAddSessionTemplateButton = () => cy.get('[data-test="add-session-template"]')
}
