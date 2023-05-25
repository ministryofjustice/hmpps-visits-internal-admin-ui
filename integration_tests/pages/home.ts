import Page, { PageElement } from './page'

export default class HomePage extends Page {
  constructor() {
    super('Visits internal admin')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  supportedPrisonsCard = (): PageElement => cy.get('[data-test="administer-prisons"]')
}
