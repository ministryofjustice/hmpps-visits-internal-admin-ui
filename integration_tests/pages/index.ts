import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('VSIP internal admin')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  courtRegisterLink = (): PageElement => cy.get('[href="/court-register"]')
}
