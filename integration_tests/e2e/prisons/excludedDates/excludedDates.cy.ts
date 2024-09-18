import { PageVisitDto } from '../../../../server/data/visitSchedulerApiTypes'
import TestData from '../../../../server/routes/testutils/testData'
import IndexPage from '../../../pages'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ExcludedDatesPage from '../../../pages/prisons/excludedDates/excludedDates'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'

context('Excluded dates', () => {
  const excludedDates = ['2023-02-01', '2023-03-02']
  const prisonDto = TestData.prisonDto({ excludeDates: excludedDates })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()
    cy.task('stubGetPrison', prisonDto)
  })

  it('should navigate to the list of excluded dates for a prison', () => {
    // home page
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.supportedPrisonsCard().click()

    // supported prisons list
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    // select Hewell
    cy.task('stubGetSessionTemplates', { prisonCode: prisonDto.code })
    supportedPrisonsPage.getPrisonNameByCode(prisonDto.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to excluded dates page
    const excludeDates = [
      TestData.prisonExcludeDateDto({ excludeDate: '2023-02-01' }),
      TestData.prisonExcludeDateDto({ excludeDate: '2023-03-02' }),
    ]
    cy.task('stubGetExcludeDates', {
      prisonCode: prisonDto.code,
      excludeDates,
    })
    viewSessionTemplatesPage.getExcludedDatesTab().click()
    const excludedDatesPage = Page.verifyOnPage(ExcludedDatesPage)

    // check dates
    excludedDatesPage.getExcludedDate(0).contains('1 February 2023')
    excludedDatesPage.getExcludedDate(1).contains('2 March 2023')
  })

  it('should add an excluded date for a prison', () => {
    // start on excluded dates page
    let excludeDates = [TestData.prisonExcludeDateDto()]
    cy.task('stubGetExcludeDates', {
      prisonCode: prisonDto.code,
      excludeDates,
    })
    const excludedDatesPage = ExcludedDatesPage.goTo(prisonDto.code)

    // enter new date and check this date for existing visits
    const visits: PageVisitDto = { totalElements: 1 }
    cy.task('stubGetBookedVisitsByDate', { prisonCode: prisonDto.code, date: '2023-04-03', visits })
    excludedDatesPage.enterExcludedDate('3', '4', '2023')
    excludedDatesPage.checkExcludedDate()

    // Check visit count & date and add the excluded date
    excludedDatesPage.getVisitCount().contains('1')
    excludedDatesPage.getCheckedDate().contains('3 April 2023')
    cy.task('stubAddExcludeDate', { prisonCode: prisonDto.code, excludeDate: '2023-04-03', actionedBy: 'USER1' })

    excludeDates = [
      TestData.prisonExcludeDateDto(),
      TestData.prisonExcludeDateDto({ excludeDate: '2023-04-03', actionedBy: 'USER1' }),
    ]
    cy.task('stubGetExcludeDates', {
      prisonCode: prisonDto.code,
      excludeDates,
    })
    excludedDatesPage.addExcludedDate()

    // Check status message and new date
    excludedDatesPage.successMessage().contains('3 April 2023 has been successfully added')
    excludedDatesPage.getExcludedDate(1).contains('3 April 2023')
  })

  it('should remove an excluded date for a prison', () => {
    // start on excluded dates page
    // start on excluded dates page
    let excludeDates = [
      TestData.prisonExcludeDateDto({ excludeDate: '2023-02-01', actionedBy: 'USER1' }),
      TestData.prisonExcludeDateDto({ excludeDate: '2023-03-02', actionedBy: 'USER1' }),
    ]
    cy.task('stubGetExcludeDates', {
      prisonCode: prisonDto.code,
      excludeDates,
    })
    const excludedDatesPage = ExcludedDatesPage.goTo(prisonDto.code)

    // Check listed dates and remove the first
    excludedDatesPage.getExcludedDate(0).contains('1 February 2023')
    excludedDatesPage.getExcludedDate(1).contains('2 March 2023')

    cy.task('stubRemoveExcludeDate', {
      prisonCode: prisonDto.code,
      excludeDate: excludeDates[0].excludeDate,
      actionedBy: 'USER1',
    })

    excludeDates = [TestData.prisonExcludeDateDto({ excludeDate: '2023-03-02', actionedBy: 'USER1' })]

    cy.task('stubGetExcludeDates', { prisonCode: prisonDto.code, excludeDates })
    excludedDatesPage.removeExcludedDate(0)

    // check status message and that date is removed
    excludedDatesPage.successMessage().contains('1 February 2023 has been successfully removed')
    excludedDatesPage.getExcludedDate(0).contains('2 March 2023')
  })
})
