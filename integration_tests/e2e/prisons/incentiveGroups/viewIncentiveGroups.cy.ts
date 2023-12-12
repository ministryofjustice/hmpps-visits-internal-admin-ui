import TestData from '../../../../server/routes/testutils/testData'
import HomePage from '../../../pages/home'
import Page from '../../../pages/page'
import SupportedPrisonsPage from '../../../pages/prisons/SupportedPrisons'
import ViewIncentiveGroupsPage from '../../../pages/prisons/incentiveGroups/viewIncentiveGroups'
import ViewSessionTemplatesPage from '../../../pages/prisons/sessionTemplates/viewSessionTemplates'
import incentiveLevelNames from '../../../../server/constants/incentiveLevels'

context('Incentive groups - list', () => {
  const prison = TestData.prison()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
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
    supportedPrisonsPage.getPrisonNameByCode(prison.code).click()
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)

    // Go to incentive level groups page
    const incentiveGroup = TestData.incentiveGroup({ incentiveLevels: ['ENHANCED', 'ENHANCED_2'] })
    cy.task('stubGetIncentiveGroups', { prisonCode: prison.code, body: [incentiveGroup] })
    viewSessionTemplatesPage.getIncentiveGroupsTab().click()

    // Check listed incentive level group
    const viewIncentiveGroupsPage = Page.verifyOnPage(ViewIncentiveGroupsPage)
    viewIncentiveGroupsPage.getIncentiveGroup(0).contains(incentiveGroup.name)
    incentiveGroup.incentiveLevels.forEach(level => {
      viewIncentiveGroupsPage.getIncentiveGroupLevels(0).contains(incentiveLevelNames[level])
    })
  })
})
