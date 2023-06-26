import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'
import { SessionTemplate } from '../../../data/visitSchedulerApiTypes'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const allPrisons = TestData.prisons()
const prisonNames = TestData.prisonNames()
const activePrison = TestData.prison()
const prisonName = prisonNames[activePrison.code]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrisonNames.mockResolvedValue(prisonNames)
  prisonService.getPrison.mockResolvedValue({ prison: activePrison, prisonName })

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Single session template page', () => {
  describe('GET /prisons/{:prisonId}/session-templates/{:reference}', () => {
    let singleSessionTemplate: SessionTemplate

    beforeEach(() => {
      singleSessionTemplate = TestData.sessionTemplate()
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(singleSessionTemplate)
    })

    it('should display all session template information', () => {
      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(singleSessionTemplate.name)

          expect($('.test-template-reference').text()).toContain(singleSessionTemplate.reference)
          expect($('.test-template-dayOfWeek').text()).toContain('Wednesday')
          expect($('.test-template-startTime').text()).toContain(singleSessionTemplate.sessionTimeSlot.startTime)
          expect($('.test-template-endTime').text()).toContain(singleSessionTemplate.sessionTimeSlot.endTime)
          expect($('.test-template-openCapacity').text()).toContain(
            singleSessionTemplate.sessionCapacity.open.toString(),
          )
          expect($('.test-template-closedCapacity').text()).toContain(
            singleSessionTemplate.sessionCapacity.closed.toString(),
          )
          expect($('.test-template-validFromDate').text()).toContain('21 March 2023')
          expect($('.test-template-validToDate').text()).toContain('No end date')
          expect($('.test-template-visitRoom').text()).toContain(singleSessionTemplate.visitRoom)
          expect($('.test-template-biWeekly').text()).toContain('No')
          expect($('.test-template-locationGroups').text()).toContain('None')
          expect($('.test-template-categoryGroups').text()).toContain('None')
          expect($('.test-template-incentiveGroups').text()).toContain('None')
        })
    })

    it('should display all session template information - end date and groups', () => {
      singleSessionTemplate.sessionDateRange.validToDate = '2023-04-21'
      singleSessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: '' }]
      singleSessionTemplate.prisonerIncentiveLevelGroups = [
        { incentiveLevels: [], name: 'Incentive group 1', reference: '' },
      ]
      singleSessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: '' }]

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.test-template-validToDate').text()).toContain('21 April 2023')
          expect($('.test-template-locationGroups li').eq(0).text()).toBe('Location group 1')
          expect($('.test-template-incentiveGroups li').eq(0).text()).toBe('Incentive group 1')
          expect($('.test-template-categoryGroups li').eq(0).text()).toBe('Category group 1')
        })
    })
  })
})