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

    it('should clear any previous search value from session', () => {
      sessionData.bookerEmail = 'booker@example.com'

      return request(app)
        .get('/bookers')
        .expect('Content-Type', /html/)
        .expect(() => expect(sessionData.bookerEmail).toBeUndefined())
    })
  })

  describe('GET /bookers/search/results', () => {
    it('should render booker accounts for email set in session, sorted by created time desc', () => {
      const email = 'booker@example.com'
      sessionData.bookerEmail = email

      const booker1 = TestData.bookerDto({
        reference: 'aaaa-bbbb-cccc',
        email,
        permittedPrisoners: [],
        createdTimestamp: '2025-06-01T09:00:00',
      })
      const booker2 = TestData.bookerDto({
        reference: 'bbbb-cccc-dddd',
        email,
        permittedPrisoners: [TestData.permittedPrisonerDto({ active: true })],
        createdTimestamp: '2025-06-02T09:00:00',
      })
      const booker3 = TestData.bookerDto({
        reference: 'cccc-dddd-eee',
        email,
        permittedPrisoners: [
          TestData.permittedPrisonerDto({ active: true }),
          TestData.permittedPrisonerDto({ active: false }),
        ],
        createdTimestamp: '2025-06-03T09:00:00',
      })
      bookerService.getBookersByEmailOrReference.mockResolvedValue([booker1, booker2, booker3])

      return request(app)
        .get('/bookers/search/results')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')

          expect($('h1').text().trim()).toBe('Select a booker account')

          expect($('[data-test=booker-email-1]').text()).toBe(email)
          expect($('[data-test=booker-reference-1]').text()).toBe(booker3.reference)
          expect($('[data-test=booker-reference-1] a').attr('href')).toBe(`/bookers/booker/${booker3.reference}`)
          expect($('[data-test=booker-prisoners-1] .govuk-tag').eq(0).text().trim()).toBe('1 active')
          expect($('[data-test=booker-prisoners-1] .govuk-tag').eq(1).text().trim()).toBe('1 inactive')
          expect($('[data-test=booker-created-date-1]').text()).toBe('3 June 2025')

          expect($('[data-test=booker-email-2]').text()).toBe(email)
          expect($('[data-test=booker-reference-2]').text()).toBe(booker2.reference)
          expect($('[data-test=booker-reference-2] a').attr('href')).toBe(`/bookers/booker/${booker2.reference}`)
          expect($('[data-test=booker-prisoners-2] .govuk-tag').eq(0).text().trim()).toBe('1 active')
          expect($('[data-test=booker-created-date-2]').text()).toBe('2 June 2025')

          expect($('[data-test=booker-email-3]').text()).toBe(email)
          expect($('[data-test=booker-reference-3]').text()).toBe(booker1.reference)
          expect($('[data-test=booker-reference-3] a').attr('href')).toBe(`/bookers/booker/${booker1.reference}`)
          expect($('[data-test=booker-prisoners-3]').text().trim()).toBe('None')
          expect($('[data-test=booker-created-date-3]').text()).toBe('1 June 2025')

          expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', email)
        })
    })

    it('should redirect to booker search if booker email not set in session', () => {
      return request(app).get('/bookers/search/results').expect(302).expect('location', '/bookers')
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
      it('should search for booker by email, store email in session and redirect to results page', () => {
        bookerService.getBookersByEmailOrReference.mockResolvedValue([booker, booker])

        return request(app)
          .post('/bookers/search')
          .send({ search: booker.email })
          .expect(302)
          .expect('location', '/bookers/search/results')
          .expect(() => {
            expect(flashProvider).not.toHaveBeenCalled()
            expect(bookerService.getBookersByEmailOrReference).toHaveBeenCalledWith('user1', booker.email)
            expect(sessionData).toStrictEqual({ bookerEmail: booker.email })
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
