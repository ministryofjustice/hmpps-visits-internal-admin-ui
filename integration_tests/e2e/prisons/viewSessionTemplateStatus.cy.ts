import TestData from '../../../server/routes/testutils/testData'
import HomePage from '../../pages/home'
import Page from '../../pages/page'
import SupportedPrisonsPage from '../../pages/prisons/prisons'
import ViewSessionTemplatesPage from '../../pages/prisons/viewSessionTemplates'
import ViewSessionTemplatePage from '../../pages/prisons/viewSessionTemplate'
import { SessionTemplatesRangeType } from '../../../server/data/visitSchedulerApiTypes'

context('Change active/inactive session template', () => {
  const prisonCode = 'HEI'
  const rangeType: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'
  let deactivatedSessionTemplate = null
  let activeSessionTemplate = null

  beforeEach(() => {
    const activePrison = TestData.prison({ active: true })
    deactivatedSessionTemplate = TestData.sessionTemplate({
      active: false,
      prisonId: prisonCode,
      reference: '-ina.dcc.0f',
    })
    activeSessionTemplate = TestData.sessionTemplate({ active: true, prisonId: prisonCode, reference: '-act.dcc.0f' })
    const sessionTemplates = [deactivatedSessionTemplate, activeSessionTemplate]
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubPrisons')
    cy.task('stubGetAllPrisons')
    cy.task('stubGetPrison', activePrison)
    cy.task('stubGetSessionTemplates', { prisonCode, rangeType, sessionTemplates })
    cy.task('stubGetSessionTemplate', { sessionTemplate: deactivatedSessionTemplate })
    cy.task('stubGetSessionTemplate', { sessionTemplate: activeSessionTemplate })
    cy.task('stubActivateSessionTemplate', {
      sessionTemplate: deactivatedSessionTemplate,
      activeSessionTemplate,
    })
    cy.task('stubDeactivateSessionTemplate', {
      sessionTemplate: activeSessionTemplate,
      deactivatedSessionTemplate,
    })

    cy.signIn()

    const homePage = Page.verifyOnPage(HomePage)
    const prisonCard = homePage.supportedPrisonsCard()
    prisonCard.click()

    const supportedPrisonsPage = Page.verifyOnPage(SupportedPrisonsPage)
    supportedPrisonsPage.selectPrison(prisonCode).click()
  })

  it('session template should be deactivated and button should activate', () => {
    // Given
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
    const link = viewSessionTemplatesPage.selectTemplatePrison(prisonCode, deactivatedSessionTemplate.reference)

    // When
    link.click()

    // Then
    viewSessionTemplatePage.sessionTemplateStatusLabel().should('include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
  })

  it('when inactive session template is activated details should change accordingly', () => {
    // Given
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
    const link = viewSessionTemplatesPage.selectTemplatePrison(prisonCode, deactivatedSessionTemplate.reference)
    link.click()

    // When
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const lable = viewSessionTemplatePage.sessionTemplateStatusLabel()
    lable.should('include.text', 'activated')
    lable.should('not.include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
  })

  it('session template should be activated and button should deactivate', () => {
    // Given
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
    const link = viewSessionTemplatesPage.selectTemplatePrison(prisonCode, activeSessionTemplate.reference)

    // When
    link.click()

    // Then
    const lable = viewSessionTemplatePage.sessionTemplateStatusLabel()
    lable.should('include.text', 'activated')
    lable.should('not.include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Deactivate')
  })

  it('when active session template is deactivate details should change accordingly', () => {
    // Given
    const viewSessionTemplatesPage = Page.verifyOnPage(ViewSessionTemplatesPage)
    const viewSessionTemplatePage = Page.verifyOnPage(ViewSessionTemplatePage)
    const link = viewSessionTemplatesPage.selectTemplatePrison(prisonCode, activeSessionTemplate.reference)
    link.click()

    // When
    viewSessionTemplatePage.getStatusSwitchButton().click()

    // Then
    const lable = viewSessionTemplatePage.sessionTemplateStatusLabel()
    lable.should('include.text', 'deactivated')
    viewSessionTemplatePage.getStatusSwitchButton().should('include.text', 'Activate')
  })
})
