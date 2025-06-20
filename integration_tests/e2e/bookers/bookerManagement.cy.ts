import TestData from '../../../server/routes/testutils/testData'
import IndexPage from '../../pages'
import AddPrisonerPage from '../../pages/bookers/addPrisoner'
import AddVisitorPage from '../../pages/bookers/addVisitor'
import BookerDetailsPage from '../../pages/bookers/bookerDetails'
import PrisonerDetailsPage from '../../pages/bookers/prisonerDetails'
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

  it('should look up a booker then add prisoner and visitor details', () => {
    // Navigate to booker search page
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.bookersCard().click()
    const searchForBookerPage = Page.verifyOnPage(SearchForBookerPage)

    // Search for booker
    cy.task('stubGetBookersByEmail', { email: booker.email, bookers: [booker] })
    cy.task('stubGetBookerByReference', { booker })
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [], approvedOnly: false })
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
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: false })
    addPrisonerPage.addPrisoner()

    // Booker details - prisoner added
    bookerDetailsPage.checkOnPage()
    bookerDetailsPage.getPrisonerId(1).contains(prisoner.prisonerId)
    bookerDetailsPage.getPrisonName(1).contains('Hewell (HMP)')
    bookerDetailsPage.getPrisonerStatus(1).contains('Active')
    bookerDetailsPage.getPrisonerVisitors(1).contains('None')

    // Prisoner details page
    bookerDetailsPage.selectPrisoner(prisoner.prisonerId)
    const prisonerDetailsPage = Page.verifyOnPage(PrisonerDetailsPage)
    prisonerDetailsPage.prisonerNumber().contains(prisoner.prisonerId)
    prisonerDetailsPage.prisonName().contains('Hewell (HMP)')

    // Add visitor
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: true })
    prisonerDetailsPage.addVisitor()
    const addVisitorPage = Page.verifyOnPage(AddVisitorPage)
    addVisitorPage.selectVisitorById(contact.personId)
    cy.task('stubCreateBookerPrisonerVisitor', { booker, prisoner, contact })
    cy.task('stubGetBookerByReference', { booker: bookerWithPrisonerAndContacts })
    addVisitorPage.addVisitor()

    // Prisoner details - visitor added
    prisonerDetailsPage.checkOnPage()
    prisonerDetailsPage.getVisitorName(1).contains(`${contact.firstName} ${contact.lastName}`)
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
    cy.task('stubGetSocialContacts', { prisonerId: prisoner.prisonerId, contacts: [contact], approvedOnly: false })
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
