import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()

const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Prison booking window edit', () => {
  const baseUrl = `/prisons/HEI/configuration/booking-window/edit`

  describe('GET /prisons/{:prisonId}/configuration/booking-window/edit', () => {
    it('should render edit booking window form', () => {
      prisonService.getPrison.mockResolvedValue(prison)

      return request(app)
        .get(baseUrl)
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

  describe('POST /prisons/{:prisonId}/configuration/booking-window/edit', () => {
    prisonService.getPrison.mockResolvedValue(prison)

    it('should send valid data to edit booking window and redirect to view template', () => {
      const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })

      return request(app)
        .post(baseUrl)
        .send(`policyNoticeDaysMin=${updatePrisonDto.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${updatePrisonDto.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Booking window updated',
            text: 'Booking window updated',
          })
          expect(prisonService.updatePrison).toHaveBeenCalledWith('user1', prison.code, updatePrisonDto)
        })
    })

    it('should set validation errors when min and max are below 0 form data', () => {
      const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: -1, policyNoticeDaysMax: -1 })

      const expectedValidationErrors = [
        expect.objectContaining({ path: 'policyNoticeDaysMin', msg: 'Enter a min booking window value of at least 1' }),
        expect.objectContaining({ path: 'policyNoticeDaysMax', msg: 'Enter a max booking window value of at least 1' }),
      ]

      const expectedFormValues = updatePrisonDto

      return request(app)
        .post(baseUrl)
        .send(`policyNoticeDaysMin=${updatePrisonDto.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${updatePrisonDto.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-window/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrison).not.toHaveBeenCalled()
        })
    })

    it('should set validation errors when min is greater than max', () => {
      const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 1 })

      const expectedValidationErrors = [
        expect.objectContaining({
          path: 'policyNoticeDaysMin',
          msg: 'Enter a Min window less than or equal to the Max',
        }),
      ]

      const expectedFormValues = updatePrisonDto

      return request(app)
        .post(baseUrl)
        .send(`policyNoticeDaysMin=${updatePrisonDto.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${updatePrisonDto.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/HEI/configuration/booking-window/edit`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrison).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      const updatePrisonDto = TestData.updatePrisonDto({ policyNoticeDaysMin: 10, policyNoticeDaysMax: 20 })
      prisonService.updatePrison.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(baseUrl)
        .send(`policyNoticeDaysMin=${updatePrisonDto.policyNoticeDaysMin}`)
        .send(`policyNoticeDaysMax=${updatePrisonDto.policyNoticeDaysMax}`)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration/booking-window/edit`)
        .expect(() => {
          expect(prisonService.updatePrison).toHaveBeenCalledWith('user1', prison.code, updatePrisonDto)
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', updatePrisonDto)
        })
    })
  })
})
