import IndexPage from '../pages'
import Page from '../pages/page'

context('Home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.signIn()
  })

  it('should render the index page with the correct tiles', () => {
    const homePage = Page.verifyOnPage(IndexPage)

    homePage.supportedPrisonsCard().contains('Supported prisons')
  })
})
