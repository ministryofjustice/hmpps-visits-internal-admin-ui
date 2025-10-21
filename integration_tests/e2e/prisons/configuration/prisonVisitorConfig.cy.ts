import TestData from '../../../../server/routes/testutils/testData'
import Page from '../../../pages/page'
import PrisonConfigPage from '../../../pages/prisons/configuration/prisonConfig'
import PrisonVisitorConfigPage from '../../../pages/prisons/configuration/prisonVisitorConfig'

context('Prison configuration - visitor config', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubPrisonNames')
    cy.task('stubGetAllPrisons')
    cy.signIn()

    cy.task('stubGetNegativeBalanceCount', {})
  })

  describe('Prison visitor configuration', () => {
    const prisonDto = TestData.prisonDto()

    it('should update prison visitor config', () => {
      cy.task('stubGetPrison', prisonDto)
      cy.task('stubGetPrisonContactDetails', { prisonCode: prisonDto.code })

      // prison config page - should have default visitor config
      const prisonConfigPage = PrisonConfigPage.goTo(prisonDto.code)
      prisonConfigPage.getMaxTotalVisitors().contains(prisonDto.maxTotalVisitors)
      prisonConfigPage.getMaxAdultVisitors().contains(prisonDto.maxAdultVisitors)
      prisonConfigPage.getMaxChildVisitors().contains(prisonDto.maxChildVisitors)
      prisonConfigPage.getAdultAge().contains(prisonDto.adultAgeYears)

      // update visitor config and submit
      prisonConfigPage.editVisitorConfig()
      const prisonVisitorConfigPage = Page.verifyOnPageTitle(PrisonVisitorConfigPage, TestData.prison().name)
      const updatePrisonDto = TestData.updatePrisonDto({
        maxTotalVisitors: 10,
        maxAdultVisitors: 5,
        maxChildVisitors: 6,
        adultAgeYears: 16,
      })
      cy.task('stubUpdatePrison', { prisonDto: { ...prisonDto, ...updatePrisonDto }, updatePrisonDto })
      cy.task('stubGetPrison', {
        ...prisonDto,
        maxTotalVisitors: updatePrisonDto.maxTotalVisitors,
        maxAdultVisitors: updatePrisonDto.maxAdultVisitors,
        maxChildVisitors: updatePrisonDto.maxChildVisitors,
        adultAgeYears: updatePrisonDto.adultAgeYears,
      })
      prisonVisitorConfigPage.enterMaxTotalVisitors(updatePrisonDto.maxTotalVisitors.toString())
      prisonVisitorConfigPage.enterMaxAdults(updatePrisonDto.maxAdultVisitors.toString())
      prisonVisitorConfigPage.enterMaxChildren(updatePrisonDto.maxChildVisitors.toString())
      prisonVisitorConfigPage.enterAdultAge(updatePrisonDto.adultAgeYears.toString())
      prisonVisitorConfigPage.updateVisitorConfig()

      // newly-updated visitor configuration should be on config page
      prisonConfigPage.getMaxTotalVisitors().contains(updatePrisonDto.maxTotalVisitors)
      prisonConfigPage.getMaxAdultVisitors().contains(updatePrisonDto.maxAdultVisitors)
      prisonConfigPage.getMaxChildVisitors().contains(updatePrisonDto.maxChildVisitors)
      prisonConfigPage.getAdultAge().contains(updatePrisonDto.adultAgeYears)
    })
  })
})
