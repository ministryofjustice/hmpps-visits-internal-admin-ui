import Page from '../../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  checkOnPage(): void {
    super.checkOnPage()
    this.getSessionTemplatesTab().should('have.attr', 'aria-current', 'page')
  }

  goTo = (prisonCode: string) => cy.visit(`/prisons/${prisonCode}/session-templates`)

  getAddSessionTemplateButton = () => this.getByDataTest('add-session-template')
}
