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
    const sessionTemplate = TestData.sessionTemplate()

    beforeEach(() => {
      sessionTemplateService.getSessionTemplates.mockResolvedValue([sessionTemplate])
    })

    it('should display session templates listing page for the prison', () => {
      return request(app)
        .get(`/prisons/${prison.code}/session-templates`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prison.name)

          expect($('[data-test="prison-status"]').text().trim()).toBe('Active')
          expect($('[data-test="prison-clients"]').text().trim()).toBe('Staff')

          expect($('.moj-sub-navigation__item').length).toBe(6)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Session templates')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe(
            `/prisons/${prison.code}/session-templates`,
          )

          expect($('h2').text().trim()).toContain('Session templates')
          expect($('[data-test="add-session-template"]').attr('href')).toBe(
            `/prisons/${prison.code}/session-templates/add`,
          )

          expect($('h3').eq(0).text().toLocaleUpperCase()).toBe(sessionTemplate.dayOfWeek)

          expect($('[data-test="template-name"]').text()).toBe(sessionTemplate.name)
          expect($('[data-test="template-name"] a').attr('href')).toBe(
            `/prisons/${prison.code}/session-templates/${sessionTemplate.reference}`,
          )
          expect($('[data-test="template-status"]').text().trim()).toBe('Active')
          expect($('[data-test="template-start-end-time"]').text().trim()).toBe('13:45 to 14:45')
          expect($('[data-test="template-capacity-open"]').text().trim()).toBe('35')
          expect($('[data-test="template-capacity-closed"]').text().trim()).toBe('2')
          expect($('[data-test="template-valid-from-date"]').text().trim()).toBe('21 Mar 2023')
          expect($('[data-test="template-valid-to-date"]').text().trim()).toBe('No end date')
          expect($('[data-test="template-weekly-frequency"]').text().trim()).toBe('1 week')
          expect($('[data-test="template-groups"]').text().trim()).toBe('None')

          expect(sessionTemplateService.getSessionTemplates).toHaveBeenCalledWith(
            undefined,
            prison.code,
            'CURRENT_OR_FUTURE',
          )
        })
    })
  })
})
