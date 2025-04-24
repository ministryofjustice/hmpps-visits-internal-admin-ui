import TestData from '../../../server/routes/testutils/testData'
import IndexPage from '../../pages'
import AddNewBookerPage from '../../pages/bookers/addNewBooker'
import AddPrisonerPage from '../../pages/bookers/addPrisoner'
import AddVisitorPage from '../../pages/bookers/addVisitor'
import BookerDetailsPage from '../../pages/bookers/bookerDetails'
import SearchForBookerPage from '../../pages/bookers/searchForBooker'
import Page from '../../pages/page'

context('Booker management', () => {
  const booker = TestData.bookerDto()
  const prisoner = TestData.permittedPrisonerDto()
  const contact = TestData.contact()
  const bookerWithPrisoner = TestData.bookerDto({ permittedPrisoners: [TestData.permittedPrisonerDto()] })
  const bookerWithPrisonerAndContacts = TestData.bookerDto({
    permittedPrisoners: [
      TestData.permittedPrisonerDto({
        permittedVisitors: [{ visitorId: TestData.contact().personId, active: true }],
      }),
    ],
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllPrisons')
    cy.task('stubPrisonNames')
    cy.signIn()
  })

  it('should look up a booker, add them and prisoner/visitor details', () => {
    // Navigate to booker search page
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.bookersCard().click()
    const searchForBookerPage = Page.verifyOnPage(SearchForBookerPage)

    // Search for booker
    cy.task('stubGetBookersByEmailNotFound', booker.email)
    searchForBookerPage.enterBookerEmail(booker.email)
    searchForBookerPage.search()

    // Booker not found - Add booker page - add booker
    cy.task('stubCreateBooker', booker)
    cy.task('stubGetBookersByEmail', { email: booker.email, bookers: [booker] })
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [], approvedOnly: false })
    const addNewBookerPage = Page.verifyOnPage(AddNewBookerPage)
    addNewBookerPage.add()

    // Booker details page
    const bookerDetailsPage = Page.verifyOnPage(BookerDetailsPage)
    bookerDetailsPage.bookerEmail().contains(booker.email)
    bookerDetailsPage.bookerReference().contains(booker.reference)
    bookerDetailsPage.prisonerNumber().contains('Not set')

    // Add prisoner
    bookerDetailsPage.addPrisoner()
    const addPrisonerPage = Page.verifyOnPage(AddPrisonerPage)
    addPrisonerPage.enterPrisonerNumber(prisoner.prisonerId)
    addPrisonerPage.selectPrison(prisoner.prisonCode)
    cy.task('stubCreateBookerPrisoner', { booker, prisoner })
    cy.task('stubGetBookersByEmail', { email: bookerWithPrisoner.email, bookers: [bookerWithPrisoner] })
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: false })
    addPrisonerPage.addPrisoner()

    // Booker details - prisoner added
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.prisonerNumber().contains(prisoner.prisonerId)
    bookerDetailsPage.prisonName().contains('Hewell (HMP)')

    // Add visitor
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: true })
    bookerDetailsPage.addVisitor()
    const addVisitorPage = Page.verifyOnPage(AddVisitorPage)
    addVisitorPage.selectVisitorById(contact.personId)
    cy.task('stubCreateBookerPrisonerVisitor', { booker, prisoner, contact })
    cy.task('stubGetBookersByEmail', {
      email: bookerWithPrisonerAndContacts.email,
      bookers: [bookerWithPrisonerAndContacts],
    })
    addVisitorPage.addVisitor()

    // Booker details - visitor added
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.getVisitorName(1).contains(`${contact.firstName} ${contact.lastName}`)
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
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: false })
    searchForBookerPage.enterBookerEmail(booker.email)
    searchForBookerPage.search()

    // Booker details page - prisoner and visitors present
    const bookerDetailsPage = Page.verifyOnPage(BookerDetailsPage)
    bookerDetailsPage.bookerEmail().contains(booker.email)
    bookerDetailsPage.bookerReference().contains(booker.reference)
    bookerDetailsPage.prisonerNumber().contains(prisoner.prisonerId)
    bookerDetailsPage.getVisitorName(1).contains(`${contact.firstName} ${contact.lastName}`)

    // Clear booker details
    cy.task('stubClearBookerDetails', bookerWithPrisonerAndContacts)
    cy.task('stubGetBookersByEmail', { email: booker.email, bookers: [booker] })
    bookerDetailsPage.clearBookerDetails()

    // Booker details page - no prisoner set
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.prisonerNumber().contains('Not set')
  })
})
