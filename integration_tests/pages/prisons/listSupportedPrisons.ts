import Page, { PageElement } from '../page'

export default class ListSupportedPrisonsPage extends Page {
  constructor() {
    super('All supported prisons')
  }

  supportedPrisonsList = (): PageElement => cy.get('.govuk-body ul')
}
