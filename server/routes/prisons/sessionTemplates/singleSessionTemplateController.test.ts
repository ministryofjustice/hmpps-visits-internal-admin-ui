import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { SessionTemplate } from '../../../data/visitSchedulerApiTypes'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Single session template page', () => {
  describe('GET /prisons/{:prisonId}/session-templates/{:reference}', () => {
    let sessionTemplate: SessionTemplate

    beforeEach(() => {
      sessionTemplate = TestData.sessionTemplate()
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplate)
      sessionTemplateService.getTemplateStats.mockResolvedValue(TestData.visitStatsSummary())
    })

    it('should display all session template information', () => {
      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(sessionTemplate.name)

          expect($('[data-test="visit-stats"]').length).toBe(1)

          expect($('.test-template-status').text()).toContain('Active')
          expect($('.test-template-reference').text()).toContain(sessionTemplate.reference)
          expect($('.test-template-dayOfWeek').text()).toContain('Wednesday')
          expect($('.test-template-startTime').text()).toContain(sessionTemplate.sessionTimeSlot.startTime)
          expect($('.test-template-endTime').text()).toContain(sessionTemplate.sessionTimeSlot.endTime)
          expect($('.test-template-openCapacity').text()).toContain(sessionTemplate.sessionCapacity.open.toString())
          expect($('.test-template-closedCapacity').text()).toContain(sessionTemplate.sessionCapacity.closed.toString())
          expect($('.test-template-validFromDate').text()).toContain('21 March 2023')
          expect($('.test-template-validToDate').text()).toContain('No end date')
          expect($('.test-template-visitRoom').text()).toContain(sessionTemplate.visitRoom)
          expect($('.test-template-weeklyFrequency').text()).toContain('1')
          expect($('.test-template-locationGroups').text()).toContain('None')
          expect($('.test-template-categoryGroups').text()).toContain('None')
          expect($('.test-template-incentiveGroups').text()).toContain('None')
          expect($('.test-template-hideInPublicServices').text()).toContain('No')

          // actions
          expect($('[data-test="template-change-status-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/session-templates/${sessionTemplate.reference}/deactivate`,
          )
          expect($('[data-test="session-template-change-status-button"]').length).toBe(1)
          expect($('[data-test="template-copy-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/session-templates/${sessionTemplate.reference}/copy`,
          )
          expect($('[data-test="session-template-copy-button"]').length).toBe(1)
          expect($('[data-test="template-delete-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/session-templates/${sessionTemplate.reference}/delete`,
          )
          // template active so Delete button should be disabled
          expect($('[data-test="session-template-delete-button"]').prop('disabled')).toBe(true)
        })
    })

    it('should display all session template information - end date and groups', () => {
      sessionTemplate.sessionDateRange.validToDate = '2023-04-21'
      sessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: 'cat-1-ref' }]
      sessionTemplate.prisonerIncentiveLevelGroups = [
        { incentiveLevels: [], name: 'Incentive group 1', reference: 'inc-1-ref' },
      ]
      sessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: 'loc-1-ref' }]
      sessionTemplate.clients = [
        { active: true, userType: 'STAFF' },
        { active: false, userType: 'PUBLIC' },
      ]

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.test-template-validToDate').text()).toContain('21 April 2023')

          expect($('.test-template-categoryGroups li').eq(0).text().trim()).toBe('Category group 1')
          expect($('.test-template-categoryGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/category-groups/cat-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )

          expect($('.test-template-incentiveGroups li').eq(0).text().trim()).toBe('Incentive group 1')
          expect($('.test-template-incentiveGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/incentive-groups/inc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )

          expect($('[data-test=location-group-behaviour]').text()).toBe('Includes')
          expect($('.test-template-locationGroups li').eq(0).text().trim()).toBe('Location group 1')
          expect($('.test-template-locationGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/location-groups/loc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
          expect($('.test-template-hideInPublicServices').text()).toContain('Yes')
        })
    })

    it('should label all groups when set to exclude', () => {
      sessionTemplate.includeLocationGroupType = false
      sessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: 'loc-1-ref' }]
      sessionTemplate.includeIncentiveGroupType = false
      sessionTemplate.prisonerIncentiveLevelGroups = [{ incentiveLevels: [], name: 'Enhanced', reference: 'inc-1-ref' }]
      sessionTemplate.includeCategoryGroupType = false
      sessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: 'cat-1-ref' }]

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-test=incentive-group-behaviour]').text()).toBe('Excludes')
          expect($('[data-test=category-group-behaviour]').text()).toBe('Excludes')
          expect($('[data-test=location-group-behaviour]').text()).toBe('Excludes')
          expect($('.test-template-locationGroups li').eq(0).text().trim()).toBe('Location group 1')
          expect($('.test-template-locationGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/location-groups/loc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
          expect($('.test-template-incentiveGroups li').eq(0).text().trim()).toBe('Enhanced')
          expect($('.test-template-incentiveGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/incentive-groups/inc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
          expect($('.test-template-categoryGroups li').eq(0).text().trim()).toBe('Category group 1')
          expect($('.test-template-categoryGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/category-groups/cat-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
        })
    })

    it('should label all groups when set to include', () => {
      sessionTemplate.includeLocationGroupType = true
      sessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: 'loc-1-ref' }]
      sessionTemplate.includeIncentiveGroupType = true
      sessionTemplate.prisonerIncentiveLevelGroups = [{ incentiveLevels: [], name: 'Enhanced', reference: 'inc-1-ref' }]
      sessionTemplate.includeCategoryGroupType = true
      sessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: 'cat-1-ref' }]

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-test=incentive-group-behaviour]').text()).toBe('Includes')
          expect($('[data-test=category-group-behaviour]').text()).toBe('Includes')
          expect($('[data-test=location-group-behaviour]').text()).toBe('Includes')
          expect($('.test-template-locationGroups li').eq(0).text().trim()).toBe('Location group 1')
          expect($('.test-template-locationGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/location-groups/loc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
          expect($('.test-template-incentiveGroups li').eq(0).text().trim()).toBe('Enhanced')
          expect($('.test-template-incentiveGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/incentive-groups/inc-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
          expect($('.test-template-categoryGroups li').eq(0).text().trim()).toBe('Category group 1')
          expect($('.test-template-categoryGroups li a').eq(0).attr('href')).toBe(
            '/prisons/HEI/category-groups/cat-1-ref?sessionTemplateRef=-afe.dcc.0f',
          )
        })
    })

    it('should enable delete button if the template is inactive', () => {
      sessionTemplate.active = false

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(sessionTemplate.name)

          // template inactive so Delete button should be enabled
          expect($('[data-test="session-template-delete-button"]').prop('disabled')).toBe(false)
        })
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/{:reference}/activate', () => {
    let activeSessionTemplate: SessionTemplate

    beforeEach(() => {
      activeSessionTemplate = TestData.sessionTemplate({ active: true })
    })

    it('should change session template status and set flash message', () => {
      // Given
      sessionTemplateService.activateSessionTemplate.mockResolvedValue(activeSessionTemplate)

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/activate')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Template activated',
            text: 'Template activated',
          })
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if API error when changing template status', () => {
      // Given
      sessionTemplateService.activateSessionTemplate.mockRejectedValue(new BadRequest())
      const error = { msg: '400 Bad Request' }

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/activate')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/{:reference}/deactivate', () => {
    let deactivatedSessionTemplate: SessionTemplate

    beforeEach(() => {
      deactivatedSessionTemplate = TestData.sessionTemplate({ active: false })
    })

    it('should change session template status and set flash message', () => {
      // Given
      sessionTemplateService.deactivateSessionTemplate.mockResolvedValue(deactivatedSessionTemplate)

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/deactivate')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Template deactivated',
            text: 'Template deactivated',
          })
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if API error when changing template status', () => {
      // Given
      sessionTemplateService.deactivateSessionTemplate.mockRejectedValue(new BadRequest())
      const error = { msg: '400 Bad Request' }

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/deactivate')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/{:reference}/delete', () => {
    const sessionTemplate = TestData.sessionTemplate()

    it('should delete session template status and set flash message', () => {
      // Given
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplate)
      sessionTemplateService.deleteSessionTemplate.mockResolvedValue()

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/delete')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Template deleted',
            text: `Session template '${sessionTemplate.name}' has been deleted`,
          })
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledWith(
            'user1',
            sessionTemplate.reference,
          )
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if session template status not deleted', () => {
      // Given
      const errors = [{ msg: '400 Bad Request' }]
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplate)
      sessionTemplateService.deleteSessionTemplate.mockRejectedValue(new BadRequest())

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/delete')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', errors)
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledWith(
            'user1',
            sessionTemplate.reference,
          )
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })
  })
})
