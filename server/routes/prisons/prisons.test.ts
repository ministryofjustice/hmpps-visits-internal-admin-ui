import { BadRequest, NotFound } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, flashProvider } from '../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../services/testutils/mocks'
import TestData from '../testutils/testData'
import { FlashErrorMessage } from '../../@types/vists-admin'
import { SessionTemplate } from '../../data/visitSchedulerApiTypes'

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

describe('Supported prisons page', () => {
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

          expect($('h1').text().trim()).toBe(prisonName)

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

describe('View single session template page', () => {
  describe('GET /prisons/{:prisonId}/session-templates/{:reference}', () => {
    let singleSessionTemplate: SessionTemplate

    beforeEach(() => {
      singleSessionTemplate = TestData.sessionTemplate()
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(singleSessionTemplate)
    })

    it('should display all session template information', () => {
      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(singleSessionTemplate.name)

          expect($('.test-template-reference').text()).toContain(singleSessionTemplate.reference)
          expect($('.test-template-dayOfWeek').text()).toContain('Wednesday')
          expect($('.test-template-startTime').text()).toContain(singleSessionTemplate.sessionTimeSlot.startTime)
          expect($('.test-template-endTime').text()).toContain(singleSessionTemplate.sessionTimeSlot.endTime)
          expect($('.test-template-openCapacity').text()).toContain(
            singleSessionTemplate.sessionCapacity.open.toString(),
          )
          expect($('.test-template-closedCapacity').text()).toContain(
            singleSessionTemplate.sessionCapacity.closed.toString(),
          )
          expect($('.test-template-validFromDate').text()).toContain('21 March 2023')
          expect($('.test-template-validToDate').text()).toContain('No end date')
          expect($('.test-template-visitRoom').text()).toContain(singleSessionTemplate.visitRoom)
          expect($('.test-template-biWeekly').text()).toContain('No')
          expect($('.test-template-locationGroups').text()).toContain('None')
          expect($('.test-template-categoryGroups').text()).toContain('None')
          expect($('.test-template-incentiveGroups').text()).toContain('None')
        })
    })

    it('should display all session template information - end date and groups', () => {
      singleSessionTemplate.sessionDateRange.validToDate = '2023-04-21'
      singleSessionTemplate.prisonerCategoryGroups = [{ categories: [], name: 'Category group 1', reference: '' }]
      singleSessionTemplate.prisonerIncentiveLevelGroups = [
        { incentiveLevels: [], name: 'Incentive group 1', reference: '' },
      ]
      singleSessionTemplate.permittedLocationGroups = [{ locations: [], name: 'Location group 1', reference: '' }]

      return request(app)
        .get('/prisons/HEI/session-templates/-afe.dcc.0f')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.test-template-validToDate').text()).toContain('21 April 2023')
          expect($('.test-template-locationGroups li').eq(0).text()).toBe('Location group 1')
          expect($('.test-template-incentiveGroups li').eq(0).text()).toBe('Incentive group 1')
          expect($('.test-template-categoryGroups li').eq(0).text()).toBe('Category group 1')
        })
    })
  })
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
