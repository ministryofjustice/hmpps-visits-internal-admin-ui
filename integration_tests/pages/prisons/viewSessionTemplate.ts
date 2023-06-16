import Page, { PageElement } from '../page'

export default class ViewSessionTemplatePage extends Page {
  constructor() {
    super('View session template')
  }

  activatePrison = (): PageElement => cy.get('activate')

  deactivatePrison = (): PageElement => cy.get('activate')
}
