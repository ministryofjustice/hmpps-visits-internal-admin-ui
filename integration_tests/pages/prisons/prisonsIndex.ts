import Page, { PageElement } from '../page'

export default class PrisonsIndexPage extends Page {
  constructor() {
    super('Supported prisons')
  }

  viewSupportedPrisonsTile = (): PageElement => cy.get('[data-test="supported-prisons"]')
}
