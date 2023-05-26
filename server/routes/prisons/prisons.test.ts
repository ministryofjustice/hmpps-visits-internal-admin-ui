import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../testutils/appSetup'
import { createMockPrisonService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'

let app: Express

const prisonService = createMockPrisonService()

// const supportedPrisons = TestData.supportedPrisons()

beforeEach(() => {
  // supportedPrisonsService.getSupportedPrisons.mockResolvedValue(supportedPrisons)

  app = appWithAllRoutes({ services: { prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisons', () => {
  it('should render the list of supported prisons', () => {
    return request(app)
      .get('/prisons')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe('Supported prisons')

        // expect($('.govuk-body ul').text()).toContain('BLI - Bristol')
        // expect($('.govuk-body ul').text()).toContain('HEI - Hewell')
      })
  })
})
