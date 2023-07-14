import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
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
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

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
    })

    it('should display all session template information', () => {
      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(sessionTemplate.name)

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
          expect($('[data-test="session-template-delete-button"]').length).toBe(1)
        })
    })

    it('should display all session template information - end date and groups', () => {
      sessionTemplate.sessionDateRange.validToDate = '2023-04-21'
      sessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: '' }]
      sessionTemplate.prisonerIncentiveLevelGroups = [{ incentiveLevels: [], name: 'Incentive group 1', reference: '' }]
      sessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: '' }]

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

  describe('POST /prisons/{:prisonId}/session-templates/{:reference}/activate', () => {
    let deactivatedSessionTemplate: SessionTemplate
    let activeSessionTemplate: SessionTemplate

    beforeEach(() => {
      deactivatedSessionTemplate = TestData.sessionTemplate({ active: false })
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
          expect(flashProvider).toHaveBeenCalledWith('message', 'Template activated')
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.activateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if session template status not changed', () => {
      // Given
      sessionTemplateService.activateSessionTemplate.mockResolvedValue(deactivatedSessionTemplate)
      const error = { msg: 'Failed to change  session template status' }

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
    let activeSessionTemplate: SessionTemplate

    beforeEach(() => {
      deactivatedSessionTemplate = TestData.sessionTemplate({ active: false })
      activeSessionTemplate = TestData.sessionTemplate({ active: true })
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
          expect(flashProvider).toHaveBeenCalledWith('message', 'Template deactivated')
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deactivateSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if session template status not changed', () => {
      // Given
      sessionTemplateService.deactivateSessionTemplate.mockResolvedValue(activeSessionTemplate)
      const error = { msg: 'Failed to change session template status' }

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
    it('should delete session template status and set flash message', () => {
      // Given
      sessionTemplateService.deleteSessionTemplate.mockResolvedValue()

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/delete')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', 'Session template with reference -afe.dcc.0f deleted.')
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })

    it('should set error in flash if session template status not deleted', () => {
      // Given
      const error = { msg: 'Failed to delete session template with reference - -afe.dcc.0f' }
      sessionTemplateService.deleteSessionTemplate.mockRejectedValue(new BadRequest())

      // When
      const result = request(app).post('/prisons/HEI/session-templates/-afe.dcc.0f/delete')

      // Then
      result
        .expect(302)
        .expect('location', `/prisons/HEI/session-templates/-afe.dcc.0f`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledTimes(1)
          expect(sessionTemplateService.deleteSessionTemplate).toHaveBeenCalledWith('user1', '-afe.dcc.0f')
        })

      return result
    })
  })
})
