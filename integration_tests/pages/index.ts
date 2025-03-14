import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Administer visits')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')

  supportedPrisonsCard = (): PageElement => cy.get('[data-test="administer-prisons"]')

  bookersCard = (): PageElement => cy.get('[data-test="administer-bookers"]')
}
