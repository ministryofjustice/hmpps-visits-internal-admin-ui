import { BadRequest, NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { FlashErrorMessage } from '../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const allPrisons = TestData.prisons()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Supported prisons', () => {
  describe('GET /prisons', () => {
    it('should render the list of supported prisons', () => {
      return request(app)
        .get('/prisons')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe('Supported prisons')

          expect($('.moj-banner__message').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('[data-test="prison-code"]').eq(0).text()).toBe('HEI')
          expect($('[data-test="prison-code"]').eq(2).text()).toBe('WWI')

          expect($('[data-test="prison-name"]').eq(0).text()).toContain('Hewell')
          expect($('[data-test="prison-name"] a').eq(0).attr('href')).toBe('/prisons/HEI/session-templates')
          expect($('[data-test="prison-name"]').eq(2).text()).toContain('Wandsworth')
          expect($('[data-test="prison-name"] a').eq(2).attr('href')).toBe('/prisons/WWI/session-templates')

          expect($('[data-test="prison-status"]').eq(0).text().trim()).toBe('Active')
          expect($('[data-test="prison-status"]').eq(2).text().trim()).toBe('Inactive')
        })
    })

    it('should render prison added status message set in flash', () => {
      flashData = {
        message: 'Hewell (HMP) has been successfully added.',
      }

      return request(app)
        .get('/prisons')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe('Supported prisons')
          expect($('.moj-banner__message').text()).toBe('Hewell (HMP) has been successfully added.')
        })
    })

    it('should render any error messages set in flash', () => {
      const error: FieldValidationError = {
        type: 'field',
        location: 'body',
        path: 'prisonId',
        value: 'X',
        msg: 'Enter a three letter prison code',
      }
      flashData = { errors: [error] }

      return request(app)
        .get('/prisons')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe('Supported prisons')
          expect($('.govuk-error-summary').text()).toContain(error.msg)
          expect($('#prisonId-error').text()).toContain(error.msg)
        })
    })
  })

  describe('POST /prisons', () => {
    it('should add prison to list of supported prisons and display message', () => {
      prisonService.getPrisonName.mockResolvedValue('Berwyn (HMP & YOI)')

      return request(app)
        .post('/prisons')
        .send('prisonId=BWI')
        .expect(302)
        .expect('location', `/prisons`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', 'Berwyn (HMP & YOI) has been successfully added.')
          expect(prisonService.createPrison).toHaveBeenCalledTimes(1)
          expect(prisonService.createPrison).toHaveBeenCalledWith('user1', 'BWI')
        })
    })

    it('should set a flash validation error if trying to add a prison which is not in prison register', () => {
      const error: FieldValidationError = {
        type: 'field',
        location: 'body',
        path: 'prisonId',
        value: 'XYZ',
        msg: "Prison 'XYZ' is not in the prison register",
      }

      prisonService.getPrisonName.mockRejectedValue(new NotFound())

      return request(app)
        .post('/prisons')
        .send('prisonId=XYZ')
        .expect(302)
        .expect('location', `/prisons`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(prisonService.createPrison).not.toHaveBeenCalled()
        })
    })

    it('should set a flash error if there is an API error response', () => {
      const expectedError = { msg: '400 Bad Request' }
      prisonService.createPrison.mockRejectedValue(new BadRequest())

      return request(app)
        .post('/prisons')
        .send('prisonId=HEI')
        .expect(302)
        .expect('location', `/prisons`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [expectedError])
          expect(prisonService.createPrison).toHaveBeenCalledTimes(1)
          expect(prisonService.createPrison).toHaveBeenCalledWith('user1', 'HEI')
        })
    })
  })
})
