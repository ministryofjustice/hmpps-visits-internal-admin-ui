import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()

const prison = TestData.prison({
  clients: [
    TestData.prisonUserClientDto(),
    TestData.prisonUserClientDto({
      active: false,
      userType: 'PUBLIC',
      policyNoticeDaysMin: 1,
      policyNoticeDaysMax: 14,
    }),
  ],
})

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Prison booking windows edit', () => {
  const baseUrl = `/prisons/HEI/configuration/booking-windows/edit`

  describe('GET /prisons/{:prisonId}/configuration/booking-windows/edit', () => {
    it('should render edit booking windows form', () => {
      prisonService.getPrison.mockResolvedValue(prison)

      return request(app)
        .get(baseUrl)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text().trim()).toContain('Edit prison booking windows')

          expect($('h2').text().trim()).toMatch(/Booking windows:\s+STAFF/)
          expect($('input[name="minDays[STAFF]"]').val()).toBe('2')
          expect($('input[name="maxDays[STAFF]"]').val()).toBe('28')

          expect($('h2').text().trim()).toMatch(/Booking windows:\s+PUBLIC\s+\(not enabled\)/)
          expect($('input[name="minDays[PUBLIC]"]').val()).toBe('1')
          expect($('input[name="maxDays[PUBLIC]"]').val()).toBe('14')

          expect($('[data-test="submit"]').text().trim()).toBe('Update')
        })
        .expect(() => {
          expect(prisonService.getPrison).toHaveBeenCalledTimes(1)
        })
    })
  })

  describe('POST /prisons/{:prisonId}/configuration/booking-windows/edit', () => {
    prisonService.getPrison.mockResolvedValue(prison)

    it('should send valid data to edit booking windows and redirect to view template', () => {
      const updatePrisonDto = TestData.updatePrisonDto({
        clients: [
          TestData.prisonUserClientDto({ policyNoticeDaysMin: 1, policyNoticeDaysMax: 10 }),
          TestData.prisonUserClientDto({
            active: false,
            userType: 'PUBLIC',
            policyNoticeDaysMin: 2,
            policyNoticeDaysMax: 15,
          }),
        ],
      })

      return request(app)
        .post(baseUrl)
        .send({ minDays: { STAFF: 1, PUBLIC: 2 }, maxDays: { STAFF: 10, PUBLIC: 15 } })
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Booking windows updated',
            text: 'Booking windows updated',
          })
          expect(prisonService.updatePrison).toHaveBeenCalledWith('user1', prison.code, updatePrisonDto)
        })
    })

    it('should set validation errors when min and max are too low', () => {
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'minDays.STAFF', msg: 'Enter a minimum booking window value of at least 0' }),
        expect.objectContaining({ path: 'maxDays.STAFF', msg: 'Enter a maximum booking window value of at least 1' }),
      ]

      const expectedFormValues = { minDays: { STAFF: -1 }, maxDays: { STAFF: 0 } }

      return request(app)
        .post(baseUrl)
        .send({ minDays: { STAFF: -1 }, maxDays: { STAFF: 0 } })
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-windows/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrison).not.toHaveBeenCalled()
        })
    })

    it('should set validation errors when min is greater than max', () => {
      const expectedValidationErrors = [
        expect.objectContaining({
          path: 'minDays.STAFF',
          msg: 'Enter a minimum window less than or equal to the maximum',
        }),
      ]

      const expectedFormValues = { minDays: { STAFF: 10 }, maxDays: { STAFF: 1 } }

      return request(app)
        .post(baseUrl)
        .send({ minDays: { STAFF: 10 }, maxDays: { STAFF: 1 } })
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-windows/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrison).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      prisonService.updatePrison.mockRejectedValue({ responseStatus: 400, message: 'API error!' } as SanitisedError)

      return request(app)
        .post(baseUrl)
        .send({ minDays: { STAFF: 2, PUBLIC: 1 }, maxDays: { STAFF: 28, PUBLIC: 14 } })
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration/booking-windows/edit`)
        .expect(() => {
          expect(prisonService.updatePrison).toHaveBeenCalledWith('user1', prison.code, { clients: prison.clients })
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', {
            minDays: { STAFF: 2, PUBLIC: 1 },
            maxDays: { STAFF: 28, PUBLIC: 14 },
          })
        })
    })
  })
})
