import Page, { PageElement } from './page'

export default class HomexPage extends Page {
  constructor() {
    super('Visits internal admin')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  supportedPrisonsTile = (): PageElement => cy.get('[data-test="administer-prisons"]')

  timetablesTile = (): PageElement => cy.get('[data-test="administer-timetables"]')
}
