import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'

import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()

const prisonNames = TestData.prisonNames()
const excludeDates = ['2023-12-25', '2024-12-25']
const prison = TestData.prison()
const prisonWithExcludeDates = TestData.prison({ excludeDates })
const prisonName = prisonNames[prison.code]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])
  prisonService.getPrison.mockResolvedValue({ prison, prisonName })
  prisonService.addExcludeDate.mockResolvedValue(prisonWithExcludeDates)
  prisonService.removeExcludeDate.mockResolvedValue(prisonWithExcludeDates)
  app = appWithAllRoutes({ services: { prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Show excluded dates', () => {
  it('GET /prisons/{:prisonId}/exclusion-dates when prison dont have exclued dates', () => {
    return request(app)
      .get(`/prisons/${prison.code}/exclusion-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('h2').text().trim()).toBe('Exclusion dates')
        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)
        expect($('[data-test="remove-date-button"]').length).toBe(0)
        expect($('.govuk-body').text()).toContain('No existing dates to exclude')
      })
  })

  it('GET /prisons/{:prisonId}/exclusion-dates when prison has excluded dates', () => {
    prisonService.getPrison.mockResolvedValue({ prison: prisonWithExcludeDates, prisonName })

    return request(app)
      .get(`/prisons/${prison.code}/exclusion-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('h2').text().trim()).toBe('Exclusion dates')
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
      message: `2024-12-25 has been successfully added.`,
    }

    return request(app)
      .get(`/prisons/${prison.code}/exclusion-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h2').text().trim()).toBe('Exclusion dates')
        expect($('.moj-banner__message').text()).toBe(`2024-12-25 has been successfully added.`)
      })
  })

  it('should render any error messages set in flash', () => {
    const wrongDate = '2025-13-34'
    const error: FieldValidationError = {
      type: 'field',
      location: 'body',
      path: 'prisonId',
      value: 'X',
      msg: `Failed to add date ${wrongDate}`,
    }
    flashData = { errors: [error] }

    return request(app)
      .get(`/prisons/${prison.code}/exclusion-dates`)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.govuk-error-summary').text()).toContain(error.msg)
      })
  })

  describe('Add date to excluded dates', () => {
    it('POST /prisons/{:prisonId}/exclusion-dates', () => {
      const date = '2023-12-26'
      const body = { validExcludeDate: { year: '2023', month: '12', day: '26' } }

      return request(app)
        .post(`/prisons/${prison.code}/exclude-date/add`)
        .send(body)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/exclusion-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', `${date} has been successfully added.`)
          expect(prisonService.addExcludeDate).toHaveBeenCalledTimes(1)
          expect(prisonService.addExcludeDate).toHaveBeenCalledWith('user1', prison.code, date)
        })
    })
  })

  describe('Remove date from excluded dates', () => {
    it('POST /prisons/{:prisonId}/exclusion-dates/remove', () => {
      const date = '2023-12-26'

      return request(app)
        .post(`/prisons/${prison.code}/exclude-date/remove`)
        .send({ excludeDate: date })
        .expect(302)
        .expect('location', `/prisons/${prison.code}/exclusion-dates`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', `${date} has been successfully removed.`)
          expect(prisonService.removeExcludeDate).toHaveBeenCalledTimes(1)
          expect(prisonService.removeExcludeDate).toHaveBeenCalledWith('user1', prison.code, date)
        })
    })
  })
})
