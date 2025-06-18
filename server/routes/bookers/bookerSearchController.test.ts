import { NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { SessionData } from 'express-session'
import { appWithAllRoutes, FlashData, flashProvider } from '../testutils/appSetup'
import { createMockBookerService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { MoJAlert } from '../../@types/visits-admin'

let app: Express
let flashData: FlashData
let sessionData: SessionData

const bookerService = createMockBookerService()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  sessionData = {} as SessionData

  app = appWithAllRoutes({ services: { bookerService }, sessionData })
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

          expect($('h1').text().trim()).toBe('Search for a booker account')

          expect($('.moj-alert').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('input[name=search]').length).toBe(1)
          expect($('[data-test=submit]').text().trim()).toBe('Search')
        })
    })

    it('should render validation errors and flash messages', () => {
      const error: FieldValidationError = {
        type: 'field',
        location: 'body',
        path: 'search',
        value: 'invalid',
        msg: 'Validation error',
      }
      const message: MoJAlert = {
        variant: 'information',
        title: 'Search message',
        text: 'Search message',
      }

      flashData = {
        errors: [error],
        messages: [message],
      }
      return request(app)
        .get('/bookers')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe('Search for a booker account')

          expect($('.moj-alert__content').text()).toBe(message.text)
          expect($('.govuk-error-summary').text()).toContain(error.msg)
          expect($('#search-error').text()).toContain(error.msg)
        })
    })
  })

  describe('POST /bookers/search', () => {
    const booker = TestData.bookerDto()

    describe('Single booker record', () => {
      it('should search for booker by email using BookerService and redirect to booker details', () => {
        bookerService.getBookersByEmailOrReference.mockResolvedValue([booker])

        return request(app)
          .post('/bookers/search')
          .send({ search: booker.email })
          .expect(302)
          .expect('location', `/bookers/booker/${booker.reference}`)
          .expect(() => {
            expect(flashProvider).not.toHaveBeenCalled()
            expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', booker.email)
            expect(sessionData).toStrictEqual({})
          })
      })

      it('should search for booker by reference using BookerService and redirect to booker details', () => {
        bookerService.getBookersByEmailOrReference.mockResolvedValue([booker])

        return request(app)
          .post('/bookers/search')
          .send({ search: booker.reference })
          .expect(302)
          .expect('location', `/bookers/booker/${booker.reference}`)
          .expect(() => {
            expect(flashProvider).not.toHaveBeenCalled()
            expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', booker.reference)
            expect(sessionData).toStrictEqual({})
          })
      })
    })

    describe('Multiple booker records (for search by email)', () => {
      const booker2 = TestData.bookerDto({ reference: 'additional-booker-ref' })

      it('should search for booker by email, store result in session and redirect to results page', () => {
        bookerService.getBookersByEmailOrReference.mockResolvedValue([booker, booker2])

        return request(app)
          .post('/bookers/search')
          .send({ search: booker.email })
          .expect(302)
          .expect('location', '/bookers/search/results')
          .expect(() => {
            expect(flashProvider).not.toHaveBeenCalled()
            expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', booker.email)
            expect(sessionData).toStrictEqual({ bookerSearchResults: [booker, booker2] })
          })
      })
    })

    describe('Error handling', () => {
      it('should search for booker by email and redirect to booker search when not found', () => {
        bookerService.getBookersByEmailOrReference.mockRejectedValue(new NotFound())

        return request(app)
          .post('/bookers/search')
          .send({ search: booker.email })
          .expect(302)
          .expect('location', '/bookers')
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledTimes(2)
            expect(flashProvider).toHaveBeenCalledWith('formValues', { search: booker.email })
            expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
              variant: 'information',
              title: 'No booker found',
              text: 'No existing booker found for: user@example.com',
            })
            expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', booker.email)
            expect(sessionData).toStrictEqual({})
          })
      })

      it('should reject an invalid search term and redirect with validation error', () => {
        const expectedError: FieldValidationError = {
          type: 'field',
          location: 'body',
          path: 'search',
          value: 'invalid',
          msg: 'Enter a valid email address or booker reference',
        }

        return request(app)
          .post('/bookers/search')
          .send({ search: 'INVALID' })
          .expect(302)
          .expect('location', '/bookers')
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledTimes(2)
            expect(flashProvider).toHaveBeenCalledWith('formValues', { search: 'invalid' })
            expect(flashProvider).toHaveBeenCalledWith('errors', [expectedError])
            expect(bookerService.getBookersByEmailOrReference).not.toHaveBeenCalled()
            expect(sessionData).toStrictEqual({})
          })
      })
    })
  })
})
