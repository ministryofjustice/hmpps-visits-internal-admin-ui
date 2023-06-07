import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockPrisonService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'

let app: Express

const prisonService = createMockPrisonService()

const allPrisons = TestData.prisons()
const prisonNames = TestData.prisonNames()
const prison = TestData.prison()
const prisonName = 'Hewell (HMP)'

beforeEach(() => {
  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrisonNames.mockResolvedValue(prisonNames)
  prisonService.getPrison.mockResolvedValue({ prison, prisonName })

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

describe('POST /prisons', () => {
  it('should add prison to list of supported prisons and display message', () => {
    return request(app)
      .post('/prisons')
      .send('prisonId=BWI')
      .expect(302)
      .expect('location', `/prisons`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('message', 'BWI')
        expect(prisonService.createPrison).toHaveBeenCalledTimes(1)
        expect(prisonService.createPrison).toHaveBeenCalledWith('user1', 'BWI')
      })
  })
})

describe('GET /prisons/HEI/edit', () => {
  it('should display correct prison specific information and offer correct action', () => {
    return request(app)
      .get('/prisons/HEI/edit')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe(prisonName)

        expect($('[data-test="prison-name-status"]').eq(0).text()).toContain(prisonName)
        expect($('[data-test="prison-name-status"]').eq(0).text()).toContain('Active')

        expect($('.govuk-button').text()).toContain('Deactivate')
      })
  })
})

describe('POST /prisons/HEI/edit', () => {
  it('should change prison status and display message when submit (deactivate)', () => {
    const inactivePrison = TestData.prison({ active: false })
    prisonService.deactivatePrison.mockResolvedValue(inactivePrison)
    return request(app)
      .post('/prisons/HEI/edit')
      .send('action=deactivate')
      .expect(302)
      .expect('location', `/prisons/HEI/edit`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('message', 'deactivated')
        expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
        expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
        expect(prisonService.activatePrison).toHaveBeenCalledTimes(0)
      })
  })

  it('should change prison status and display message when submit (activate)', () => {
    prisonService.activatePrison.mockResolvedValue(prison)
    return request(app)
      .post('/prisons/HEI/edit')
      .send('action=activate')
      .expect(302)
      .expect('location', `/prisons/HEI/edit`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('message', 'activated')
        expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(0)
        expect(prisonService.activatePrison).toHaveBeenCalledTimes(1)
        expect(prisonService.activatePrison).toHaveBeenCalledWith('user1', 'HEI')
      })
  })
})
