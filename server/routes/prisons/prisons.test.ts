import { BadRequest, NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { FlashErrorMessage } from '../../@types/vists-admin'

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

describe('GET /prisons', () => {
  it('should render the list of supported prisons', () => {
    return request(app)
      .get('/prisons')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

        expect($('h1').text().trim()).toBe('Supported prisons')

        expect($('.moj-banner__message').length).toBe(0)
        expect($('.govuk-error-summary').length).toBe(0)

        expect($('[data-test="prison-code"]').eq(0).text()).toBe('HEI')
        expect($('[data-test="prison-code"]').eq(2).text()).toBe('WWI')

        expect($('[data-test="prison-name"]').eq(0).text()).toContain('Hewell')
        expect($('[data-test="prison-name"] a').eq(0).attr('href')).toBe('/prisons/HEI/session-templates')
        expect($('[data-test="prison-name"]').eq(2).text()).toContain('Wandsworth')
        expect($('[data-test="prison-name"] a').eq(2).attr('href')).toBe('/prisons/WWI/session-templates')

        expect($('[data-test="prison-status"]').eq(0).text().trim()).toBe('Active')
        expect($('[data-test="prison-status"]').eq(2).text().trim()).toBe('Inactive')
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

describe('GET /prisons/{:prisonId}/session-templates', () => {
  const sessionTemplates = [TestData.sessionTemplate()]

  beforeEach(() => {
    sessionTemplateService.getSessionTemplates.mockResolvedValue(sessionTemplates)
  })

  describe('Prison status', () => {
    it('should display prison status information and offer correct action (active prison)', () => {
      return request(app)
        .get('/prisons/HEI/session-templates')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')
          expect($('.govuk-back-link').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prisonName)

          expect($('.moj-banner__message').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('[data-test="prison-status"]').text().trim()).toBe('active')

          expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/deactivate')
          expect($('[data-test="prison-change-status"]').text().trim()).toBe('Deactivate')
        })
    })

    it('should display prison status information and offer correct action (inactive prison)', () => {
      prisonService.getPrison.mockResolvedValue({ prison: inactivePrison, prisonName })

      return request(app)
        .get('/prisons/HEI/session-templates')
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
        .get('/prisons/HEI/session-templates')
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
        .get('/prisons/HEI/session-templates')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe(prisonName)
          expect($('.govuk-error-summary').text()).toContain(error.msg)
        })
    })
  })

  describe('Sub navigation', () => {
    it('should render sub navigation with session templates selected', () => {
      return request(app)
        .get('/prisons/HEI/session-templates')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toBe(prisonName)

          expect($('.moj-sub-navigation__item').length).toBe(5)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Session templates')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe('/prisons/HEI/session-templates')

          expect($('h2').text().trim()).toBe('Session templates')
        })
    })
  })
})

describe('GET /prisons/{:prisonId}/session-templates/{:reference}', () => {
  const singleSessionTemplate = TestData.sessionTemplate()

  beforeEach(() => {
    sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(singleSessionTemplate)
  })

  it('should display all session template information', () => {
    return request(app)
      .get('/prisons/HEI/session-templates/-afe.dcc.0f')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().replace(/\s+/g, ' ')).toContain('Hewell (HMP)')
        expect($('h1').text().replace(/\s+/g, ' ')).toContain(singleSessionTemplate.name)

        expect($('[data-test="reference"]').text()).toBe(singleSessionTemplate.reference)
        expect($('[data-test="dayOfWeek"]').text()).toBe('Wednesday')
        expect($('[data-test="startTime"]').text()).toBe(singleSessionTemplate.startTime)
        expect($('[data-test="endTime"]').text()).toBe(singleSessionTemplate.endTime)
        expect($('[data-test="openCapacity"]').text()).toBe(singleSessionTemplate.openCapacity.toString())
        expect($('[data-test="closedCapacity"]').text()).toBe(singleSessionTemplate.closedCapacity.toString())
        expect($('[data-test="validFromDate"]').text()).toBe('21 March 2023')
        // expect($('[data-test="validToDate"]').text()).toBe('No end date')
        expect($('[data-test="visitRoom"]').text()).toBe(singleSessionTemplate.visitRoom)
        // expect($('[data-test="biWeekly"]').text()).toBe('No')
        expect($('[data-test="locationGroups"]').text()).toBe('None')
        expect($('[data-test="categoryGroups"]').text()).toBe('None')
        expect($('[data-test="incentiveGroups"]').text()).toBe('None')
      })
  })
})

describe('POST /prisons/{:prisonId}/activate', () => {
  it('should change prison status and set flash message', () => {
    prisonService.activatePrison.mockResolvedValue(activePrison)

    return request(app)
      .post('/prisons/HEI/activate')
      .expect(302)
      .expect('location', `/prisons/HEI/session-templates`)
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
      .expect('location', `/prisons/HEI/session-templates`)
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
      .expect('location', `/prisons/HEI/session-templates`)
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
      .expect('location', `/prisons/HEI/session-templates`)
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [error])
        expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
        expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
      })
  })
})
