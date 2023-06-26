import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const allPrisons = TestData.prisons()
const prisonNames = TestData.prisonNames()
const activePrison = TestData.prison()
const inactivePrison = TestData.prison({ active: false })
const prisonName = prisonNames[activePrison.code]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrisonNames.mockResolvedValue(prisonNames)
  prisonService.getPrison.mockResolvedValue({ prison: activePrison, prisonName })

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Prison status page', () => {
  describe('GET /prisons/{:prisonId}/status', () => {
    describe('Prison status', () => {
      it('should display prison status information and offer correct action (active prison)', () => {
        return request(app)
          .get('/prisons/HEI/status')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)

            expect($('.moj-primary-navigation__item').length).toBe(2)
            expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

            expect($('h1').text().trim()).toBe(prisonName)

            expect($('.moj-banner__message').length).toBe(0)
            expect($('.govuk-error-summary').length).toBe(0)

            expect($('[data-test="prison-status"]').text().trim()).toBe('active')

            expect($('.moj-sub-navigation__item').length).toBe(6)
            expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Status')
            expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe('/prisons/HEI/status')

            expect($('h2').text().trim()).toContain('Change prison status')

            expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/deactivate')
            expect($('[data-test="prison-change-status"]').text().trim()).toBe('Deactivate')
          })
      })

      it('should display prison status information and offer correct action (inactive prison)', () => {
        prisonService.getPrison.mockResolvedValue({ prison: inactivePrison, prisonName })

        return request(app)
          .get('/prisons/HEI/status')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(prisonName)

            expect($('[data-test="prison-status"]').text().trim()).toBe('inactive')

            expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/activate')
            expect($('[data-test="prison-change-status"]').text().trim()).toBe('Activate')
          })
      })

      it('should render success message set in flash', () => {
        flashData = {
          message: 'activated',
        }

        return request(app)
          .get('/prisons/HEI/status')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(prisonName)
            expect($('.moj-banner__message').text()).toBe('Hewell (HMP) has been activated.')
          })
      })

      it('should render any error messages set in flash', () => {
        const error = { msg: 'Failed to change prison status' }
        flashData = { errors: [error] }

        return request(app)
          .get('/prisons/HEI/status')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(prisonName)
            expect($('.govuk-error-summary').text()).toContain(error.msg)
          })
      })
    })
  })

  describe('POST /prisons/{:prisonId}/activate', () => {
    it('should change prison status and set flash message', () => {
      prisonService.activatePrison.mockResolvedValue(activePrison)

      return request(app)
        .post('/prisons/HEI/activate')
        .expect(302)
        .expect('location', `/prisons/HEI/status`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', 'activated')
          expect(prisonService.activatePrison).toHaveBeenCalledTimes(1)
          expect(prisonService.activatePrison).toHaveBeenCalledWith('user1', 'HEI')
        })
    })

    it('should set error in flash if prison status not changed', () => {
      prisonService.activatePrison.mockResolvedValue(inactivePrison)
      const error = { msg: 'Failed to change prison status' }

      return request(app)
        .post('/prisons/HEI/activate')
        .expect(302)
        .expect('location', `/prisons/HEI/status`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(prisonService.activatePrison).toHaveBeenCalledTimes(1)
          expect(prisonService.activatePrison).toHaveBeenCalledWith('user1', 'HEI')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/deactivate', () => {
    it('should change prison status and set flash message', () => {
      prisonService.deactivatePrison.mockResolvedValue(inactivePrison)

      return request(app)
        .post('/prisons/HEI/deactivate')
        .expect(302)
        .expect('location', `/prisons/HEI/status`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('message', 'deactivated')
          expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
          expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
        })
    })

    it('should set error in flash if prison status not changed', () => {
      prisonService.deactivatePrison.mockResolvedValue(activePrison)
      const error = { msg: 'Failed to change prison status' }

      return request(app)
        .post('/prisons/HEI/deactivate')
        .expect(302)
        .expect('location', `/prisons/HEI/status`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
          expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
        })
    })
  })
})