import Page, { PageElement } from '../page'

export default class ViewSessionTemplatesPage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  statusTab = (): PageElement => cy.get('[data-test=tab-status]')
}
