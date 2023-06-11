import { BadRequest, NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockPrisonService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { FlashErrorMessage } from '../../@types/vists-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()

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

        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)

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

  it('should render prison added status message set in flash', () => {
    flashData = {
      message: 'HEI',
    }

    return request(app)
      .get('/prisons')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe('Supported prisons')
        expect($('.moj-banner__message').text()).toBe('Hewell (HMP) has been successfully added.')
      })
  })

  it('should render any error messages set in flash', () => {
    const error: FieldValidationError = {
      type: 'field',
      location: 'body',
      path: 'prisonId',
      value: 'X',
      msg: 'Enter a three letter prison code',
    }
    flashData = { errors: [error] }

    return request(app)
      .get('/prisons')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe('Supported prisons')
        expect($('.govuk-error-summary').text()).toContain(error.msg)
        expect($('#prisonId-error').text()).toContain(error.msg)
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

  it('should set a flash validation error if trying to add a prison which is not in prison register', () => {
    const error: FieldValidationError = {
      type: 'field',
      location: 'body',
      path: 'prisonId',
      value: 'XYZ',
      msg: "Prison 'XYZ' is not in the prison register",
    }

    prisonService.getPrisonName.mockRejectedValue(new NotFound())

    return request(app)
      .post('/prisons')
      .send('prisonId=XYZ')
      .expect(302)
      .expect('location', `/prisons`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [error])
        expect(prisonService.createPrison).not.toHaveBeenCalled()
      })
  })

  it('should set a flash error if there is an API error response', () => {
    const error = { msg: '400 Bad Request' }
    prisonService.createPrison.mockRejectedValue(new BadRequest())

    return request(app)
      .post('/prisons')
      .send('prisonId=HEI')
      .expect(302)
      .expect('location', `/prisons`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [error])
        expect(prisonService.createPrison).toHaveBeenCalledTimes(1)
        expect(prisonService.createPrison).toHaveBeenCalledWith('user1', 'HEI')
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

        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)

        expect($('[data-test="prison-name-status"]').eq(0).text()).toContain(prisonName)
        expect($('[data-test="prison-name-status"]').eq(0).text()).toContain('Active')

        expect($('.govuk-button').text()).toContain('Deactivate')
      })
  })

  it('should render success message set in flash', () => {
    flashData = {
      message: 'activated',
    }

    return request(app)
      .get('/prisons/HEI/edit')
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
      .get('/prisons/HEI/edit')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toBe(prisonName)
        expect($('.govuk-error-summary').text()).toContain(error.msg)
      })
  })
})

describe('POST /prisons/HEI/edit', () => {
  it('should change prison status and display message when submit (deactivate)', () => {
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
    prisonService.activatePrison.mockResolvedValue(activePrison)

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

  it('should set error in flash if prison status not changed', () => {
    prisonService.deactivatePrison.mockResolvedValue(activePrison)
    const error = { msg: 'Failed to change prison status' }

    return request(app)
      .post('/prisons/HEI/edit')
      .send('action=deactivate')
      .expect(302)
      .expect('location', `/prisons/HEI/edit`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [error])
        expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
        expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
        expect(prisonService.activatePrison).toHaveBeenCalledTimes(0)
      })
  })
})
