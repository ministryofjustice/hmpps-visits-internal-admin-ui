export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static createPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  static verifyOnPage<T>(constructor: new () => T): T {
    const page = new constructor() as Page
    page.checkOnPage()
    return page as any
  }

  static verifyOnPageTitle = <T>(constructor: new (string) => T, title?: string): T => {
    const page = new constructor(title) as Page
    page.checkOnPage()
    return page as any
  }

  constructor(private readonly title: string) {}

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
