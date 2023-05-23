import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisons', () => {
  it('should render the Supported prisons index page', () => {
    app = appWithAllRoutes({})

    return request(app)
      .get('/prisons')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe('Supported prisons')

        expect($('.card').length).toBe(1)
        expect($('[data-test="supported-prisons"] .card__link').text()).toBe('View supported prisons')
        expect($('[data-test="supported-prisons"] .card__link').attr('href')).toBe('/prisons/supported')
      })
  })
})
