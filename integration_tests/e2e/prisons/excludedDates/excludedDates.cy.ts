import { PageVisitDto } from '../../../../server/data/visitSchedulerApiTypes'
import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
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
  })

  it('should navigate to the list of excluded dates for a prison', () => {
    // home page
    const homePage = Page.verifyOnPage(HomePage)
    homePage.supportedPrisonsCard().click()

    // supported prisons list
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    // select Hewell
    cy.task('stubGetPrison', prisonDto)
    cy.task('stubGetSessionTemplates', { prisonCode: prisonDto.code })
    supportedPrisonsPage.getPrisonNameByCode(prisonDto.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to excluded dates page
    viewSessionTemplatesPage.getExcludedDatesTab().click()
    const excludedDatesPage = Page.verifyOnPage(ExcludedDatesPage)

    // check dates
    excludedDatesPage.getExcludedDate(0).contains('1 February 2023')
    excludedDatesPage.getExcludedDate(1).contains('2 March 2023')
  })

  it('should add an excluded date for a prison', () => {
    // start on excluded dates page
    cy.task('stubGetPrison', prisonDto)
    const excludedDatesPage = ExcludedDatesPage.goTo(prisonDto.code)

    // enter new date and check this date for existing visits
    const visits: PageVisitDto = { totalElements: 1 }
    cy.task('stubGetBookedVisitsByDate', { prisonCode: prisonDto.code, date: '2023-04-03', visits })
    excludedDatesPage.enterExcludedDate('3', '4', '2023')
    excludedDatesPage.checkExcludedDate()

    // Check visit count & date and add the excluded date
    excludedDatesPage.getVisitCount().contains('1')
    excludedDatesPage.getCheckedDate().contains('3 April 2023')
    cy.task('stubAddExcludeDate', { excludeDate: '2023-04-03', prisonDto })
    cy.task('stubGetPrison', { ...prisonDto, excludeDates: [...prisonDto.excludeDates, '2023-04-03'] })
    excludedDatesPage.addExcludedDate()

    // Check status message and new date
    excludedDatesPage.successMessage().contains('3 April 2023 has been successfully added')
    excludedDatesPage.getExcludedDate(2).contains('3 April 2023')
  })

  it('should remove an excluded date for a prison', () => {
    // start on excluded dates page
    cy.task('stubGetPrison', prisonDto)
    const excludedDatesPage = ExcludedDatesPage.goTo(prisonDto.code)

    // Check listed dates and remove the first
    excludedDatesPage.getExcludedDate(0).contains('1 February 2023')
    excludedDatesPage.getExcludedDate(1).contains('2 March 2023')
    cy.task('stubRemoveExcludeDate', { prisonCode: prisonDto.code, excludeDate: '2023-02-01' })
    cy.task('stubGetPrison', { ...prisonDto, excludeDates: [prisonDto.excludeDates[1]] })
    excludedDatesPage.removeExcludedDate(0)

    // check status message and that date is removed
    excludedDatesPage.successMessage().contains('1 February 2023 has been successfully removed')
    excludedDatesPage.getExcludedDate(0).contains('2 March 2023')
  })
})
