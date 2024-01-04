import { BadRequest } from 'http-errors'
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
const activePrison = TestData.prison()
const inactivePrison = TestData.prison({ active: false })
const prisonContactDetails = TestData.prisonContactDetails()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(activePrison)
  prisonService.getPrisonContactDetails.mockResolvedValue(prisonContactDetails)

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Prison booking window edit', () => {
  const editBookingWindowUrl = `/prisons/HEI/configuration/booking-window/edit`

  describe(`GET ${editBookingWindowUrl}`, () => {
    it('should render edit booking window form', () => {
      prisonService.getPrison.mockResolvedValue(activePrison)

      return request(app)
        .get(editBookingWindowUrl)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toContain('Edit prison booking window')
          expect($('#policyNoticeDaysMin').val()).toBe('2')
          expect($('#policyNoticeDaysMax').val()).toBe('28')
          expect($('[data-test="submit"]').text().trim()).toBe('Update')
        })
        .expect(() => {
          expect(prisonService.getPrison).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe(`POST  ${editBookingWindowUrl}`, () => {
    prisonService.getPrison.mockResolvedValue(activePrison)

    it('should send valid data to edit booking window and redirect to view template', () => {
      const testUpdateData = { policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 }

      return request(app)
        .post(editBookingWindowUrl)
        .send(`policyNoticeDaysMin=${testUpdateData.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${testUpdateData.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/${activePrison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('message', 'Booking window updated')
          expect(prisonService.updatePrisonDetails).toHaveBeenCalledWith('user1', activePrison.code, testUpdateData)
        })
    })

    it('should set validation errors when min and max are below 0 form data', () => {
      const testUpdateData = { policyNoticeDaysMin: -1, policyNoticeDaysMax: -1 }

      const expectedValidationErrors = [
        expect.objectContaining({ path: 'policyNoticeDaysMin', msg: 'Enter a min booking window value of at least 1' }),
        expect.objectContaining({ path: 'policyNoticeDaysMax', msg: 'Enter a max booking window value of at least 1' }),
      ]

      const expectedFormValues = testUpdateData

      return request(app)
        .post(editBookingWindowUrl)
        .send(`policyNoticeDaysMin=${testUpdateData.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${testUpdateData.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-window/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrisonDetails).not.toHaveBeenCalled()
        })
    })

    it('should set validation errors when min is greater than max', () => {
      const testUpdateData = { policyNoticeDaysMin: 10, policyNoticeDaysMax: 1 }

      const expectedValidationErrors = [
        expect.objectContaining({
          path: 'policyNoticeDaysMin',
          msg: 'Enter a Min window less than or equal to the Max',
        }),
      ]

      const expectedFormValues = testUpdateData

      return request(app)
        .post(editBookingWindowUrl)
        .send(`policyNoticeDaysMin=${testUpdateData.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${testUpdateData.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-window/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrisonDetails).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      const testUpdateData = { policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 }
      prisonService.updatePrisonDetails.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(editBookingWindowUrl)
        .send(`policyNoticeDaysMin=${testUpdateData.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${testUpdateData.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/${activePrison.code}/configuration/booking-window/edit`)
        .expect(() => {
          expect(prisonService.updatePrisonDetails).toHaveBeenCalledWith('user1', activePrison.code, testUpdateData)
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', testUpdateData)
        })
    })
  })
})

describe('Prison configuration', () => {
  describe('GET /prisons/{:prisonId}/configuration', () => {
    describe('Key page elements and navigation', () => {
      it('should display key page elements and navigation', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)

            expect($('.moj-primary-navigation__item').length).toBe(2)
            expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

            expect($('h1').text().trim()).toBe(activePrison.name)

            expect($('.moj-banner__message').length).toBe(0)
            expect($('.govuk-error-summary').length).toBe(0)

            expect($('[data-test="prison-status"]').text().trim()).toBe('Active')

            expect($('.moj-sub-navigation__item').length).toBe(6)
            expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Configuration')
            expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe('/prisons/HEI/configuration')

            expect($('h2').eq(0).text().trim()).toContain('Contact details')
            expect($('h2').eq(1).text().trim()).toContain('Change booking window')
            expect($('h2').eq(2).text().trim()).toContain('Change prison status')
          })
      })

      it('should render success message set in flash', () => {
        flashData = {
          message: 'Hewell (HMP) has been activated',
        }

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(activePrison.name)
            expect($('.moj-banner__message').text()).toBe('Hewell (HMP) has been activated')
          })
      })

      it('should render any error messages set in flash', () => {
        const error = { msg: 'Failed to change prison status' }
        flashData = { errors: [error] }

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(activePrison.name)
            expect($('.govuk-error-summary').text()).toContain(error.msg)
          })
      })
    })

    describe('Prison contact details', () => {
      it('should display no prison contact details and add button for prison with no contact details', () => {
        prisonService.getPrisonContactDetails.mockResolvedValue(null)

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('main').text()).toContain('No contact details have been entered for this prison')
            expect($('[data-test="contact-details-add"]').length).toBe(1)
            expect($('[data-test="contact-details-add"]').prop('href')).toBe(
              '/prisons/HEI/configuration/contact-details/add',
            )
          })
      })

      it('should display prison contact details and edit button for prison with contact details', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('.test-contact-email').text().trim()).toBe(prisonContactDetails.emailAddress)
            expect($('.test-contact-phone').text().trim()).toBe(prisonContactDetails.phoneNumber)
            expect($('.test-contact-web').text().trim()).toBe(prisonContactDetails.webAddress)
            expect($('.test-contact-web a').prop('href')).toBe(prisonContactDetails.webAddress)
            expect($('[data-test="contact-details-edit"]').length).toBe(1)
            expect($('[data-test="contact-details-edit"]').prop('href')).toBe(
              '/prisons/HEI/configuration/contact-details/edit',
            )
          })
      })

      it('should display prison contact details and handle null values', () => {
        prisonService.getPrisonContactDetails.mockResolvedValue(
          TestData.prisonContactDetails({ emailAddress: null, phoneNumber: null, webAddress: null }),
        )

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('.test-contact-email').text().trim()).toBe('Not set')
            expect($('.test-contact-phone').text().trim()).toBe('Not set')
            expect($('.test-contact-web').text().trim()).toBe('Not set')
            expect($('[data-test="contact-details-edit"]').length).toBe(1)
          })
      })
    })

    describe('Prison status', () => {
      it('should display prison status information and offer correct action (active prison)', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('[data-test="prison-status"]').text().trim()).toBe('Active')
            expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/deactivate')
            expect($('[data-test="prison-change-status"]').text().trim()).toBe('Deactivate')
          })
      })

      it('should display prison status information and offer correct action (inactive prison)', () => {
        prisonService.getPrison.mockResolvedValue(inactivePrison)

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('[data-test="prison-status"]').text().trim()).toBe('Inactive')
            expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/activate')
            expect($('[data-test="prison-change-status"]').text().trim()).toBe('Activate')
          })
      })
    })

    describe('Prison booking window', () => {
      it('should display prison booking window information and offer correct action (active prison)', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('.test-policy-notice-days-min').text().trim()).toBe('2 days')
            expect($('.test-policy-notice-days-max').text().trim()).toBe('28 days')
          })
      })
    })
  })

  describe('POST requests', () => {
    describe('POST /prisons/{:prisonId}/activate', () => {
      it('should change prison status and set flash message', () => {
        prisonService.activatePrison.mockResolvedValue(activePrison)
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        return request(app)
          .post('/prisons/HEI/activate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('message', 'Hewell (HMP) has been activated')
            expect(prisonService.getPrisonName).toHaveBeenCalledTimes(1)
            expect(prisonService.activatePrison).toHaveBeenCalledTimes(1)
            expect(prisonService.activatePrison).toHaveBeenCalledWith('user1', 'HEI')
          })
      })

      it('should set error in flash if API error when activating prison', () => {
        prisonService.activatePrison.mockRejectedValue(new BadRequest())
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        const error = { msg: '400 Bad Request' }

        return request(app)
          .post('/prisons/HEI/activate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
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
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        return request(app)
          .post('/prisons/HEI/deactivate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('message', 'Hewell (HMP) has been deactivated')
            expect(prisonService.getPrisonName).toHaveBeenCalledTimes(1)
            expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
            expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
          })
      })

      it('should set error in flash if API error when deactivatinig prison', () => {
        prisonService.deactivatePrison.mockRejectedValue(new BadRequest())
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        const error = { msg: '400 Bad Request' }

        return request(app)
          .post('/prisons/HEI/deactivate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('errors', [error])
            expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
            expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
          })
      })
    })
  })
})
