import Page from '../../page'

export default class PrisonContactDetailsPage extends Page {
  constructor(title: string) {
    super(title)
  }

  enterEmail = (email: string): void => {
    cy.get('#emailAddress').clear()
    cy.get('#emailAddress').type(email)
  }

  enterPhoneNumber = (phoneNumber: string): void => {
    cy.get('#phoneNumber').clear()
    cy.get('#phoneNumber').type(phoneNumber)
  }

  enterWebAddress = (url: string): void => {
    cy.get('#webAddress').clear()
    cy.get('#webAddress').type(url)
  }

  addContactDetails = (): void => {
    cy.get('[data-test="submit"]').contains('Add').click()
  }

  updateContactDetails = (): void => {
    cy.get('[data-test="submit"]').contains('Update').click()
  }
}
