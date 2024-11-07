import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'

import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import {
  createMockExcludeDateService,
  createMockPrisonService,
  createMockVisitService,
} from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const visitService = createMockVisitService()
const excludeDateService = createMockExcludeDateService()

const prison = TestData.prison()
const prisonCode = 'HEI'
const excludeDateDto = [TestData.excludeDateDto()]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])
  prisonService.getPrison.mockResolvedValue(prison)
  excludeDateService.getExcludeDates.mockResolvedValue(excludeDateDto)
  excludeDateService.addExcludeDate.mockResolvedValue()
  excludeDateService.removeExcludeDate.mockResolvedValue()
  visitService.getVisitCountByDate.mockResolvedValue(1)
  app = appWithAllRoutes({ services: { prisonService, visitService, excludeDateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Show excluded dates', () => {
  it('GET /prisons/{:prisonId}/excluded-dates - when no exclude dates present', () => {
    excludeDateService.getExcludeDates.mockResolvedValue(null)

    return request(app)
      .get(`/prisons/${prisonCode}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(3)
        expect($('h2').text().trim()).toBe('Excluded dates')
        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)
        expect($('[data-test="remove-date-button"]').length).toBe(0)
        expect($('.govuk-body').text()).toContain('There are no excluded dates for this prison.')
      })
  })

  it('GET /prisons/{:prisonId}/excluded-dates - when prison has excluded dates', () => {
    return request(app)
      .get(`/prisons/${prisonCode}/excluded-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(3)
        expect($('h2').text().trim()).toBe('Excluded dates')
        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)

        expect($('[data-test="excluded-date"]').eq(0).text()).toBe('12 December 2024')
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
      .get(`/prisons/${prisonCode}/excluded-dates`)
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
      .get(`/prisons/${prisonCode}/excluded-dates`)
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
        .post(`/prisons/${prisonCode}/excluded-dates/check`)
        .send('excludeDate[day]=26')
        .send('excludeDate[month]=12')
        .send('excludeDate[year]=2023')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-test="visit-count"]').text()).toBe('1')
          expect($('[data-test="exclude-date"]').text()).toBe('26 December 2023')
          expect($('[data-test="add-date-cancel"]').attr('href')).toBe(`/prisons/${prisonCode}/excluded-dates`)
          expect(visitService.getVisitCountByDate).toHaveBeenCalledTimes(1)
          expect(visitService.getVisitCountByDate).toHaveBeenCalledWith('user1', prisonCode, date)
        })
    })
  })

  describe('Add date to excluded dates', () => {
    it('POST /prisons/{:prisonId}/excluded-dates/add', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prisonCode}/excluded-dates/add`)
        .send('excludeDate[day]=26')
        .send('excludeDate[month]=12')
        .send('excludeDate[year]=2023')
        .expect(302)
        .expect('location', `/prisons/${prisonCode}/excluded-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', `26 December 2023 has been successfully added by user1`)
          expect(excludeDateService.addExcludeDate).toHaveBeenCalledTimes(1)
          expect(excludeDateService.addExcludeDate).toHaveBeenCalledWith('user1', prisonCode, date)
        })
    })
  })

  describe('Remove date from excluded dates', () => {
    it('POST /prisons/{:prisonId}/excluded-dates/remove', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prisonCode}/excluded-dates/remove`)
        .send(`excludeDate=${date}`)
        .expect(302)
        .expect('location', `/prisons/${prisonCode}/excluded-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `26 December 2023 has been successfully removed by user1`,
          )
          expect(excludeDateService.removeExcludeDate).toHaveBeenCalledTimes(1)
          expect(excludeDateService.removeExcludeDate).toHaveBeenCalledWith('user1', prisonCode, date)
        })
    })
  })
})
