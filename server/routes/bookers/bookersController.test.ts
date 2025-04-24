import { NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockBookerService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { FlashErrorMessage } from '../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | Record<string, string>[] | FlashErrorMessage>

const bookerService = createMockBookerService()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  app = appWithAllRoutes({ services: { bookerService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Search for a booker', () => {
  describe('GET /bookers', () => {
    it('should render the booker search page', () => {
      return request(app)
        .get('/bookers')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')

          expect($('h1').text().trim()).toBe('Search for a booker')

          expect($('.moj-banner__message').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('input[name=booker]').length).toBe(1)
          expect($('[data-test=submit]').text().trim()).toBe('Search')
        })
    })

    it('should render validation errors and flash messages', () => {
      const error: FieldValidationError = {
        type: 'field',
        location: 'body',
        path: 'booker',
        value: 'invalid',
        msg: 'Validation error',
      }
      const message = { text: 'Booker message', type: 'information' }

      flashData = {
        errors: [error],
        message: [message],
      }
      return request(app)
        .get('/bookers')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe('Search for a booker')

          expect($('.moj-banner__message').text()).toBe(message.text)
          expect($('.govuk-error-summary').text()).toContain(error.msg)
          expect($('#booker-error').text()).toContain(error.msg)
        })
    })
  })

  describe('GET /bookers/add', () => {
    it('should render the booker search page', () => {
      return request(app)
        .get('/bookers/add')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')

          expect($('h1').text().trim()).toBe('Add a new booker')

          expect($('.moj-banner__message').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('input[name=booker]').length).toBe(1)
          expect($('[data-test=submit]').text().trim()).toBe('Add new booker')
        })
    })
  })

  describe('POST /bookers/search', () => {
    const booker = TestData.bookerDto()

    it('should search for booker by email using BookerService and redirect to booker details', () => {
      bookerService.getBookersByEmail.mockResolvedValue([booker])

      return request(app)
        .post('/bookers/search')
        .send({ booker: booker.email })
        .expect(302)
        .expect('location', '/bookers/booker/details')
        .expect(() => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(bookerService.getBookersByEmail).toHaveBeenCalledWith('user1', booker.email)
        })
    })

    it('should search for booker by email and redirect to Add booker when not found', () => {
      bookerService.getBookersByEmail.mockRejectedValue(new NotFound())

      return request(app)
        .post('/bookers/search')
        .send({ booker: booker.email })
        .expect(302)
        .expect('location', '/bookers/add')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledTimes(2)
          expect(flashProvider).toHaveBeenCalledWith('formValues', { booker: booker.email })
          expect(flashProvider).toHaveBeenCalledWith('message', {
            text: 'No existing booker found with email: user@example.com',
            type: 'information',
          })
          expect(bookerService.getBookersByEmail).toHaveBeenCalledWith('user1', booker.email)
        })
    })

    it('should reject an invalid email address and redirect with validation error', () => {
      const expectedError: FieldValidationError = {
        type: 'field',
        location: 'body',
        path: 'booker',
        value: 'INVALID',
        msg: 'Enter a valid email address',
      }

      return request(app)
        .post('/bookers/search')
        .send({ booker: 'INVALID' })
        .expect(302)
        .expect('location', '/bookers')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledTimes(2)
          expect(flashProvider).toHaveBeenCalledWith('formValues', { booker: 'INVALID' })
          expect(flashProvider).toHaveBeenCalledWith('errors', [expectedError])
          expect(bookerService.getBookersByEmail).not.toHaveBeenCalled()
        })
    })
  })

  describe('POST /bookers/add', () => {
    const booker = TestData.bookerDto()

    it('should add booker by email using BookerService and redirect to booker details', () => {
      bookerService.createBooker.mockResolvedValue(booker)

      return request(app)
        .post('/bookers/add')
        .send({ booker: booker.email })
        .expect(302)
        .expect('location', '/bookers/booker/details')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledTimes(1)
          expect(flashProvider).toHaveBeenCalledWith('message', { text: 'Booker record created', type: 'success' })
          expect(bookerService.createBooker).toHaveBeenCalledWith('user1', booker.email)
        })
    })

    it('should handle errors adding booker and redirect to Add booker page', () => {
      bookerService.createBooker.mockRejectedValue(new NotFound())

      return request(app)
        .post('/bookers/add')
        .send({ booker: booker.email })
        .expect(302)
        .expect('location', '/bookers/booker/add')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledTimes(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '404 Not Found' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', { booker: booker.email })
          expect(bookerService.createBooker).toHaveBeenCalledWith('user1', booker.email)
        })
    })
  })
})
