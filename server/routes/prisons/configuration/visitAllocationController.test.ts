import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockVisitAllocationService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const visitAllocationService = createMockVisitAllocationService()

const prison = TestData.prison()
const negativeBalanceCount = TestData.prisonNegativeBalanceCount()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)
  visitAllocationService.getNegativeBalanceCount.mockResolvedValue(negativeBalanceCount)

  app = appWithAllRoutes({ services: { prisonService, visitAllocationService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Reset negative visit allocation balances', () => {
  const url = `/prisons/${prison.code}/allocations/reset/confirm`

  describe(`GET ${url}`, () => {
    it('should render visit allocation reset confirmation page', () => {
      const errors = <FieldValidationError[]>[{ msg: 'API error' }]

      flashData = { errors }

      return request(app)
        .get(url)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('.govuk-error-summary').text()).toContain('API error')

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Reset negative visit allocation balances')

          expect($('[data-test=negative-balance-count]').text().trim()).toBe('3 prisoners')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)
          expect($('[data-test=visit-allocation-reset]').text().trim()).toBe('Reset negative balances')
        })
    })
  })

  describe(`POST ${url}`, () => {
    it('should reset visit allocation balances endpoint and redirect to prison config page with success message', () => {
      visitAllocationService.resetNegativeBalances.mockResolvedValue()

      return request(app)
        .post(url)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Visit allocation balances reset',
            text: 'Visit allocation balances reset',
          })

          expect(visitAllocationService.resetNegativeBalances).toHaveBeenCalledWith({
            username: 'user1',
            prisonCode: prison.code,
          })
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      visitAllocationService.resetNegativeBalances.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(url)
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
        })
    })
  })
})
