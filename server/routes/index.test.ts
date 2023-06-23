import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET / - Home page', () => {
  it('should render the home page cards', () => {
    app = appWithAllRoutes({})

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/')

        expect($('h1').text().trim()).toBe('Visits internal admin')

        expect($('.card').length).toBe(1)
        expect($('[data-test="administer-prisons"] .card__link').text()).toBe('Supported prisons')
        expect($('[data-test="administer-prisons"] .card__link').attr('href')).toBe('/prisons')
      })
  })
})
