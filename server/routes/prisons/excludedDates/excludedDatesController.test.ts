import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'

import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockVisitService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const visitService = createMockVisitService()

const excludeDates = ['2023-12-25', '2024-12-25']
const prison = TestData.prison()
const prisonWithExcludeDates = TestData.prison({ excludeDates })

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])
  prisonService.getPrison.mockResolvedValue(prison)
  prisonService.addExcludeDate.mockResolvedValue(prisonWithExcludeDates)
  prisonService.removeExcludeDate.mockResolvedValue()
  visitService.getVisitCountByDate.mockResolvedValue(1)
  app = appWithAllRoutes({ services: { prisonService, visitService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Show excluded dates', () => {
  it('GET /prisons/{:prisonId}/excluded-dates - when no exclude dates present', () => {
    return request(app)
      .get(`/prisons/${prison.code}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('h2').text().trim()).toBe('Excluded dates')
        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)
        expect($('[data-test="remove-date-button"]').length).toBe(0)
        expect($('.govuk-body').text()).toContain('There are no excluded dates for this prison.')
      })
  })

  it('GET /prisons/{:prisonId}/excluded-dates - when prison has excluded dates', () => {
    prisonService.getPrison.mockResolvedValue(prisonWithExcludeDates)

    return request(app)
      .get(`/prisons/${prison.code}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('h2').text().trim()).toBe('Excluded dates')
        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)

        expect($('[data-test="excluded-date"]').eq(0).text()).toBe('25 December 2023')
        expect($('[data-test="remove-date-button"]').eq(0).text()).toContain('Remove')
      })
  })
})

describe('Add / Remove excluded date', () => {
  it('should render date added status message set in flash', () => {
    flashData = {
      message: `2024-12-25 has been successfully added`,
    }

    return request(app)
      .get(`/prisons/${prison.code}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h2').text().trim()).toBe('Excluded dates')
        expect($('.moj-banner__message').text()).toBe(`2024-12-25 has been successfully added`)
      })
  })

  it('should render any error messages set in flash', () => {
    const wrongDate = '2025-13-34'
    const error = <FieldValidationError>{
      path: 'prisonId',
      msg: `Failed to add date ${wrongDate}`,
    }
    flashData = { errors: [error] }

    return request(app)
      .get(`/prisons/${prison.code}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.govuk-error-summary').text()).toContain(error.msg)
      })
  })

  describe('Check date on excluded dates page', () => {
    it('POST /prisons/{:prisonId}/excluded-date/check', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prison.code}/excluded-dates/check`)
        .send('excludeDate[day]=26')
        .send('excludeDate[month]=12')
        .send('excludeDate[year]=2023')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-test="visit-count"]').text()).toBe('1')
          expect($('[data-test="exclude-date"]').text()).toBe('26 December 2023')
          expect($('[data-test="add-date-cancel"]').attr('href')).toBe(`/prisons/${prison.code}/excluded-dates`)
          expect(visitService.getVisitCountByDate).toHaveBeenCalledTimes(1)
          expect(visitService.getVisitCountByDate).toHaveBeenCalledWith('user1', prison.code, date)
        })
    })
  })

  describe('Add date to excluded dates', () => {
    it('POST /prisons/{:prisonId}/excluded-dates/add', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prison.code}/excluded-dates/add`)
        .send('excludeDate[day]=26')
        .send('excludeDate[month]=12')
        .send('excludeDate[year]=2023')
        .expect(302)
        .expect('location', `/prisons/${prison.code}/excluded-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', `26 December 2023 has been successfully added`)
          expect(prisonService.addExcludeDate).toHaveBeenCalledTimes(1)
          expect(prisonService.addExcludeDate).toHaveBeenCalledWith('user1', prison.code, date)
        })
    })
  })

  describe('Remove date from excluded dates', () => {
    it('POST /prisons/{:prisonId}/excluded-dates/remove', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prison.code}/excluded-dates/remove`)
        .send(`excludeDate=${date}`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/excluded-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', `26 December 2023 has been successfully removed`)
          expect(prisonService.removeExcludeDate).toHaveBeenCalledTimes(1)
          expect(prisonService.removeExcludeDate).toHaveBeenCalledWith('user1', prison.code, date)
        })
    })
  })
})
