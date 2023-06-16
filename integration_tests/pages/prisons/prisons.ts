import Page, { PageElement } from '../page'

export default class SupportedPrisonsPage extends Page {
  constructor() {
    super('Supported prisons')
  }

  selectedPrison = (prisonId: string): PageElement => cy.get(`#${prisonId}`)
  // TODO

  typePrison = (): PageElement => cy.get('input').type('BLI')

  createPrison = (): PageElement => cy.get('form').submit()
}
