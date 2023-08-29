import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisonsPage'
import ViewIncentiveGroupsPage from '../../../pages/prisons/incentiveGroups/viewIncentiveGroupsPage'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplatesPage'
import incentiveLevelNames from '../../../../server/constants/incentiveLevels'

context('Incentive groups - list', () => {
  const prison = TestData.prison()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.signIn()
  })

  it('should navigate to the list of incentive groups for a prison', () => {
    // home page
    const homePage = Page.verifyOnPage(HomePage)
    homePage.supportedPrisonsCard().click()

    // supported prisons list
    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)

    // select Hewell
    cy.task('stubGetPrison', TestData.prisonDto())
    cy.task('stubGetSessionTemplates', { prisonCode: prison.code })
    supportedPrisonsPage.getPrisonByCode(prison.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to incentive level groups page
    const incentiveGroup = TestData.incentiveGroup({ incentiveLevels: ['ENHANCED', 'ENHANCED_2'] })
    cy.task('stubIncentiveGroups', { prisonCode: prison.code, body: [incentiveGroup] })
    viewSessionTemplatesPage.selectIncentiveGroupsTab()

    // Check listed incentive level group
    const viewIncentiveGroupsPage = Page.verifyOnPage(ViewIncentiveGroupsPage)
    viewIncentiveGroupsPage.getIncentiveGroup(0).contains(incentiveGroup.name)
    incentiveGroup.incentiveLevels.forEach(level => {
      viewIncentiveGroupsPage.getIncentiveGroupLevels(0).contains(incentiveLevelNames[level])
    })
  })
})
