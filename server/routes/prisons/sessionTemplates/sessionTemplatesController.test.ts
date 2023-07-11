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
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Session templates listing page', () => {
  describe('GET /prisons/{:prisonId}/session-templates', () => {
    const sessionTemplates = [TestData.sessionTemplate()]

    beforeEach(() => {
      sessionTemplateService.getSessionTemplates.mockResolvedValue(sessionTemplates)
    })

    it('should display session templates listing page for the prison', () => {
      return request(app)
        .get('/prisons/HEI/session-templates')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prison.name)

          expect($('[data-test="prison-status"]').text().trim()).toBe('active')

          expect($('.moj-sub-navigation__item').length).toBe(6)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Session templates')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe('/prisons/HEI/session-templates')

          expect($('h2').text().trim()).toContain('Session templates')

          // TODO - add tests for the session template filter buttons and listing table
        })
    })
  })
})
