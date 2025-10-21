import { BadRequest } from 'http-errors'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockVisitAllocationService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { UserClientDto } from '../../../data/visitSchedulerApiTypes'
import { FlashErrorMessage, MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const visitAllocationService = createMockVisitAllocationService()

const activePrison = TestData.prison()
const inactivePrison = TestData.prison({ active: false })
const prisonContactDetails = TestData.prisonContactDetails()
const negativeBalanceCount = TestData.prisonNegativeBalanceCount()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(activePrison)
  prisonService.getPrisonContactDetails.mockResolvedValue(prisonContactDetails)

  visitAllocationService.getNegativeBalanceCount.mockResolvedValue(negativeBalanceCount)

  app = appWithAllRoutes({ services: { prisonService, visitAllocationService } })
})

afterEach(() => {
  jest.resetAllMocks()
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

            expect($('.moj-primary-navigation__item').length).toBe(3)
            expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

            expect($('h1').text().trim()).toBe(activePrison.name)

            expect($('.moj-alert').length).toBe(0)
            expect($('.govuk-error-summary').length).toBe(0)

            expect($('[data-test="prison-status"]').text().trim()).toBe('Active')
            expect($('[data-test="prison-clients"]').text().trim()).toBe('Staff')

            expect($('.moj-sub-navigation__item').length).toBe(6)
            expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Configuration')
            expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe('/prisons/HEI/configuration')

            expect($('h2').eq(0).text().trim()).toContain('Booking window')
            expect($('h2').eq(1).text().trim()).toContain('Contact details')
            expect($('h2').eq(2).text().trim()).toContain('Enabled services')
            expect($('h2').eq(3).text().trim()).toContain('Visitor configuration')
            expect($('h2').eq(4).text().trim()).toContain('Visit allocation balances')
            expect($('h2').eq(5).text().trim()).toContain('Prison status')
          })
      })

      it('should render success message set in flash', () => {
        flashData = {
          messages: [{ variant: 'success', title: 'Prison activated', text: 'Hewell (HMP) has been activated' }],
        }

        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text().trim()).toBe(activePrison.name)
            expect($('.moj-alert__content').text()).toBe('Hewell (HMP) has been activated')
          })
      })

      it('should render any error messages set in flash', () => {
        const error: FlashErrorMessage = { msg: 'Failed to change prison status' }
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

    describe('Prison booking window', () => {
      it('should display prison booking window information and edit action', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('.test-policy-notice-days-min').text().trim()).toBe('2 days')
            expect($('.test-policy-notice-days-max').text().trim()).toBe('28 days')
            expect($('[data-test="booking-window-edit"]').length).toBe(1)
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

    describe('Enabled services', () => {
      it('should display services this prison has enabled', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('input[name=enabledServices]').length).toBe(2)
            expect($('input[name=enabledServices][value=STAFF]').prop('checked')).toBe(true)
            expect($('input[name=enabledServices][value=PUBLIC]').prop('checked')).toBe(false)
            expect($('[data-test="update-enabled-services"]').length).toBe(1)
          })
      })
    })

    describe('Prison visitor configuration', () => {
      it('should display prison visitor configuration information and edit action', () => {
        return request(app)
          .get('/prisons/HEI/configuration')
          .expect('Content-Type', /html/)
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('.test-max-total-visitors').text().trim()).toBe('6')
            expect($('.test-max-adult-visitors').text().trim()).toBe('3')
            expect($('.test-max-child-visitors').text().trim()).toBe('3')
            expect($('.test-adult-age').text().trim()).toBe('18')
            expect($('[data-test="visitor-config-edit"]').length).toBe(1)
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
            expect($('[data-test="prison-clients"]').text().trim()).toBe('Staff')
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
            expect($('[data-test="prison-clients"]').text().trim()).toBe('Staff')
            expect($('[data-test="prison-change-status-form"]').attr('action').trim()).toBe('/prisons/HEI/activate')
            expect($('[data-test="prison-change-status"]').text().trim()).toBe('Activate')
          })
      })
    })
  })

  describe('Change enabled services', () => {
    beforeEach(() => {
      prisonService.activatePrisonClientType.mockResolvedValue({} as UserClientDto)
      prisonService.deactivatePrisonClientType.mockResolvedValue({} as UserClientDto)
    })

    it('should deactivate STAFF and PUBLIC services', () => {
      return request(app)
        .post('/prisons/HEI/update-enabled-services')
        .expect(302)
        .expect('location', `/prisons/HEI/configuration`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Enabled services updated',
            text: 'Enabled services have been updated',
          })
          expect(prisonService.deactivatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'PUBLIC')
          expect(prisonService.deactivatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'STAFF')
          expect(prisonService.activatePrisonClientType).not.toHaveBeenCalled()
        })
    })

    it('should activate STAFF and PUBLIC services', () => {
      return request(app)
        .post('/prisons/HEI/update-enabled-services')
        .send({ enabledServices: ['STAFF', 'PUBLIC'] })
        .expect(302)
        .expect('location', `/prisons/HEI/configuration`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Enabled services updated',
            text: 'Enabled services have been updated',
          })
          expect(prisonService.activatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'PUBLIC')
          expect(prisonService.activatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'STAFF')
          expect(prisonService.deactivatePrisonClientType).not.toHaveBeenCalled()
        })
    })

    it('should activate a single service', () => {
      return request(app)
        .post('/prisons/HEI/update-enabled-services')
        .send({ enabledServices: 'STAFF' })
        .expect(302)
        .expect('location', `/prisons/HEI/configuration`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Enabled services updated',
            text: 'Enabled services have been updated',
          })
          expect(prisonService.activatePrisonClientType).toHaveBeenCalledTimes(1)
          expect(prisonService.activatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'STAFF')
          expect(prisonService.deactivatePrisonClientType).toHaveBeenCalledTimes(1)
          expect(prisonService.deactivatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'PUBLIC')
        })
    })

    it('should validate data', () => {
      return request(app)
        .post('/prisons/HEI/update-enabled-services')
        .send({ enabledServices: 'XYZ' })
        .expect(302)
        .expect('location', `/prisons/HEI/configuration`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', <FieldValidationError[]>[
            {
              location: 'body',
              msg: 'Invalid value',
              path: 'enabledServices',
              type: 'field',
              value: 'XYZ',
            },
          ])
          expect(prisonService.activatePrisonClientType).not.toHaveBeenCalled()
          expect(prisonService.deactivatePrisonClientType).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors', () => {
      prisonService.deactivatePrisonClientType.mockRejectedValue(new BadRequest())
      const error = { msg: '400 Bad Request' }
      return request(app)
        .post('/prisons/HEI/update-enabled-services')
        .expect(302)
        .expect('location', `/prisons/HEI/configuration`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [error])
          expect(prisonService.activatePrisonClientType).not.toHaveBeenCalled()
          expect(prisonService.deactivatePrisonClientType).toHaveBeenCalledWith('user1', 'HEI', 'PUBLIC')
        })
    })
  })

  describe('Visit allocation balances', () => {
    it('should render negative visit allocation balance count', () => {
      return request(app)
        .get('/prisons/HEI/configuration')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-test=negative-balance-count]').text()).toBe('3 prisoners')
          expect($('[data-test=visit-allocation-reset]').text().trim()).toBe('Reset negative balances')
          expect($('[data-test=visit-allocation-reset]').attr('href')).toBe('/prisons/HEI/allocations/reset/confirm')
        })
    })
  })

  describe('Change prison status', () => {
    describe('Activate a prison', () => {
      it('should activate prison and set flash message', () => {
        prisonService.activatePrison.mockResolvedValue(activePrison)
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        return request(app)
          .post('/prisons/HEI/activate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
              variant: 'success',
              title: 'Prison activated',
              text: 'Hewell (HMP) has been activated',
            })
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

    describe('Deactivate a prison', () => {
      it('should deactivate prison and set flash message', () => {
        prisonService.deactivatePrison.mockResolvedValue(inactivePrison)
        prisonService.getPrisonName.mockResolvedValue(activePrison.name)

        return request(app)
          .post('/prisons/HEI/deactivate')
          .expect(302)
          .expect('location', `/prisons/HEI/configuration`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
              variant: 'success',
              title: 'Prison deactivated',
              text: 'Hewell (HMP) has been deactivated',
            })
            expect(prisonService.getPrisonName).toHaveBeenCalledTimes(1)
            expect(prisonService.deactivatePrison).toHaveBeenCalledTimes(1)
            expect(prisonService.deactivatePrison).toHaveBeenCalledWith('user1', 'HEI')
          })
      })

      it('should set error in flash if API error when deactivating a prison', () => {
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
