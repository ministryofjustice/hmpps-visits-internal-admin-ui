import TestData from '../../../server/routes/testutils/testData'
import IndexPage from '../../pages'
import Page from '../../pages/page'
import SupportedPrisonsPage from '../../pages/prisons/SupportedPrisons'

context('Supported prisons', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.signIn()
  })

  it('should navigate to the list of all supported prisons', () => {
    const prisons = TestData.prisonDtos()
    cy.task('stubGetAllPrisons', prisons)
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.supportedPrisonsCard().contains('Supported prisons')
    indexPage.supportedPrisonsCard().click()

    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)
    supportedPrisonsPage.getPrisonNameByCode('HEI').contains('Hewell')
    supportedPrisonsPage.getPrisonStatusByCode('HEI').contains('Active')

    supportedPrisonsPage.getPrisonNameByCode('PNI').contains('Preston')
    supportedPrisonsPage.getPrisonStatusByCode('PNI').contains('Active')

    supportedPrisonsPage.getPrisonNameByCode('WWI').contains('Wandsworth')
    supportedPrisonsPage.getPrisonStatusByCode('WWI').contains('Inactive')
  })

  it('should create a Prison', () => {
    cy.task('stubGetAllPrisons', [])
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.supportedPrisonsCard().contains('Supported prisons')
    indexPage.supportedPrisonsCard().click()

    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)
    const newPrison = TestData.prisonDto({ active: false })
    cy.task('stubCreatePrison', newPrison)
    supportedPrisonsPage.enterPrisonCode('HEI')
    cy.task('stubGetAllPrisons', [newPrison])
    supportedPrisonsPage.createPrison().click()
    supportedPrisonsPage.successMessage().contains('Hewell (HMP) has been successfully added')
    supportedPrisonsPage.getPrisonNameByCode('HEI').contains('Hewell')
    supportedPrisonsPage.getPrisonStatusByCode('HEI').contains('Inactive')
  })
})
