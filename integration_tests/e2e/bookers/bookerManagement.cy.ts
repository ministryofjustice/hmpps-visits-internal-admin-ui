import TestData from '../../../server/routes/testutils/testData'
import IndexPage from '../../pages'
import AddPrisonerPage from '../../pages/bookers/addPrisoner'
import BookerDetailsPage from '../../pages/bookers/bookerDetails'
import PrisonerDetailsPage from '../../pages/bookers/prisonerDetails'
import SearchForBookerPage from '../../pages/bookers/searchForBooker'
import Page from '../../pages/page'

context('Booker management', () => {
  const booker = TestData.bookerDto()
  const prisoner = TestData.permittedPrisonerDto()
  const bookerWithPrisoner = TestData.bookerDto({
    permittedPrisoners: [TestData.permittedPrisonerDto({ permittedVisitors: [] })],
  })
  const bookerWithPrisonerAndContacts = TestData.bookerDto({
    permittedPrisoners: [TestData.permittedPrisonerDto()],
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllPrisons')
    cy.task('stubPrisonNames')
    cy.signIn()
  })

  it('should look up a booker then add prisoner and visitor details', () => {
    // Navigate to booker search page
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.bookersCard().click()
    const searchForBookerPage = Page.verifyOnPage(SearchForBookerPage)

    // Search for booker
    cy.task('stubGetBookersByEmail', { email: booker.email, bookers: [booker] })
    cy.task('stubGetBookerByReference', { booker })
    searchForBookerPage.enterBookerSearchTerm(booker.email)
    searchForBookerPage.search()

    // Booker details page
    const bookerDetailsPage = Page.verifyOnPage(BookerDetailsPage)
    bookerDetailsPage.bookerEmail().contains(booker.email)
    bookerDetailsPage.bookerReference().contains(booker.reference)
    bookerDetailsPage.noPrisonersMessage()

    // Add prisoner
    bookerDetailsPage.addPrisoner()
    const addPrisonerPage = Page.verifyOnPage(AddPrisonerPage)
    addPrisonerPage.enterPrisonerNumber(prisoner.prisonerId)
    addPrisonerPage.selectPrison(prisoner.prisonCode)
    cy.task('stubCreateBookerPrisoner', { booker, prisoner })
    cy.task('stubGetBookerByReference', { booker: bookerWithPrisoner })
    addPrisonerPage.addPrisoner()

    // Booker details - prisoner added
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.getPrisonerId(1).contains(prisoner.prisonerId)
    bookerDetailsPage.getPrisonName(1).contains('Hewell (HMP)')
    bookerDetailsPage.getPrisonerVisitors(1).contains('0')

    // Prisoner details page
    bookerDetailsPage.selectPrisoner(prisoner.prisonerId)
    const prisonerDetailsPage = Page.verifyOnPage(PrisonerDetailsPage)
    prisonerDetailsPage.prisonerNumber().contains(prisoner.prisonerId)
    prisonerDetailsPage.prisonName().contains('Hewell (HMP)')
  })

  it('should clear details for an existing booker', () => {
    // Navigate to booker search page
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.bookersCard().click()
    const searchForBookerPage = Page.verifyOnPage(SearchForBookerPage)

    // Search for booker
    cy.task('stubGetBookersByEmail', {
      email: bookerWithPrisonerAndContacts.email,
      bookers: [bookerWithPrisonerAndContacts],
    })
    cy.task('stubGetBookerByReference', { booker: bookerWithPrisonerAndContacts })
    searchForBookerPage.enterBookerSearchTerm(booker.email)
    searchForBookerPage.search()

    // Booker details page - prisoner present
    const bookerDetailsPage = Page.verifyOnPage(BookerDetailsPage)
    bookerDetailsPage.bookerEmail().contains(booker.email)
    bookerDetailsPage.bookerReference().contains(booker.reference)
    bookerDetailsPage.getPrisonerId(1).contains(prisoner.prisonerId)

    // Clear booker details
    cy.task('stubClearBookerDetails', bookerWithPrisonerAndContacts)
    cy.task('stubGetBookerByReference', { booker })
    bookerDetailsPage.clearBookerDetails()

    // Booker details page - no prisoner set
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.noPrisonersMessage()
  })
})
