import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockIncentiveGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const incentiveGroupService = createMockIncentiveGroupService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

const incentiveGroup = TestData.incentiveGroup()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  incentiveGroupService.getSingleIncentiveGroup.mockResolvedValue(incentiveGroup)

  app = appWithAllRoutes({ services: { prisonService, incentiveGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Single incentive group page', () => {
  describe('GET /prisons/{:prisonId}/incentive-groups/{:reference}', () => {
    it('should display all incentive group information', () => {
      return request(app)
        .get(`/prisons/HEI/incentive-groups/${incentiveGroup.reference}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/incentive-groups')
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(incentiveGroup.name)

          expect($('.test-template-incentiveLevels li').text()).toBe('Enhanced')

          expect($('[data-test="incentive-delete-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/incentive-groups/${incentiveGroup.reference}/delete`,
          )
        })
    })

    it('should have the correct back link, when coming from the session template', () => {
      return request(app)
        .get(`/prisons/HEI/incentive-groups/${incentiveGroup.reference}?sessionTemplateRef=-afe.dcc.a8`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/session-templates/-afe.dcc.a8')
          expect($('h1').text()).toContain('Hewell (HMP)')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/location-groups/{:reference}/delete', () => {
    it('should delete location group and set flash message', () => {
      return request(app)
        .post(`/prisons/HEI/incentive-groups/${incentiveGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/incentive-groups`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `Incentive group '${incentiveGroup.name}' has been deleted`,
          )
          expect(incentiveGroupService.deleteIncentiveGroup).toHaveBeenCalledTimes(1)
          expect(incentiveGroupService.deleteIncentiveGroup).toHaveBeenCalledWith('user1', incentiveGroup.reference)
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      incentiveGroupService.deleteIncentiveGroup.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(`/prisons/HEI/incentive-groups/${incentiveGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/HEI/incentive-groups/${incentiveGroup.reference}`)
        .expect(() => {
          expect(incentiveGroupService.deleteIncentiveGroup).toHaveBeenCalledTimes(1)
          expect(incentiveGroupService.deleteIncentiveGroup).toHaveBeenCalledWith('user1', incentiveGroup.reference)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
        })
    })
  })
})
