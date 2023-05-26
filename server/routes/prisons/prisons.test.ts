import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../testutils/appSetup'
import { createMockPrisonService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'

let app: Express

const prisonService = createMockPrisonService()

const allPrisons = TestData.prisons()
const prisonNames = TestData.prisonNames()

beforeEach(() => {
  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrisonNames.mockResolvedValue(prisonNames)

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

        expect($('[data-test="prison-code"]').eq(0).text()).toBe('HEI')
        expect($('[data-test="prison-code"]').eq(2).text()).toBe('WWI')

        expect($('[data-test="prison-name"]').eq(0).text()).toContain('Hewell')
        expect($('[data-test="prison-name"]').eq(2).text()).toContain('Wandsworth')

        expect($('[data-test="prison-status"]').eq(0).text().trim()).toBe('Active')
        expect($('[data-test="prison-status"]').eq(2).text().trim()).toBe('Inactive')

        expect($('[data-test="prison-edit-link"] a').eq(0).attr('href')).toBe('/prisons/HEI/edit')
        expect($('[data-test="prison-edit-link"] a').eq(2).attr('href')).toBe('/prisons/WWI/edit')
      })
  })
})
