import Page, { PageElement } from '../page'

export default class ViewSessionTemplatePage extends Page {
  constructor() {
    super('Hewell (HMP)')
  }

  // switch status Activate <-> Deactivate
  switchStatusButton = (): PageElement => cy.get('[data-test=prison-change-status]')

  succesfulMessage = (): PageElement => cy.get('.moj-banner--success')
}
