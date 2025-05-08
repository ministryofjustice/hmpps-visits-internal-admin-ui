import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { FieldValidationError } from 'express-validator'
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

describe('Edit visitor configuration', () => {
  const url = `/prisons/${prison.code}/configuration/visitors/edit`

  describe(`GET ${url}`, () => {
    it('should render edit visitor config form with any errors and form data pre-populated', () => {
      const formValues = {
        maxTotalVisitors: '6',
        maxAdultVisitors: '2',
        maxChildVisitors: '4',
        adultAgeYears: '16',
      }
      const errors = <FieldValidationError[]>[
        { path: 'maxTotalVisitors', msg: 'total visitors error' },
        { path: 'maxAdultVisitors', msg: 'max adults error' },
        { path: 'maxChildVisitors', msg: 'max children error' },
        { path: 'adultAgeYears', msg: 'adult age error' },
      ]

      flashData = { errors, formValues: [formValues] }

      return request(app)
        .get(url)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Edit visitor configuration')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#maxTotalVisitors-error"]').text()).toBe('total visitors error')
          expect($('.govuk-error-summary a[href="#maxAdultVisitors-error"]').text()).toBe('max adults error')
          expect($('.govuk-error-summary a[href="#maxChildVisitors-error"]').text()).toBe('max children error')
          expect($('.govuk-error-summary a[href="#adultAgeYears-error"]').text()).toBe('adult age error')

          expect($('#maxTotalVisitors-error').text()).toContain('total visitors error')
          expect($('#maxAdultVisitors-error').text()).toContain('max adults error')
          expect($('#maxChildVisitors-error').text()).toContain('max children error')
          expect($('#adultAgeYears-error').text()).toContain('adult age error')

          expect($('input#maxTotalVisitors').val()).toBe('6')
          expect($('input#maxAdultVisitors').val()).toBe('2')
          expect($('input#maxChildVisitors').val()).toBe('4')
          expect($('input#adultAgeYears').val()).toBe('16')

          expect($('[data-test="submit"]').text().trim()).toBe('Update')
        })
    })
  })

  describe(`POST ${url}`, () => {
    it('should send valid data to edit visitor config and redirect to view template', () => {
      const updatePrisonDto = TestData.updatePrisonDto({
        maxTotalVisitors: 6,
        maxAdultVisitors: 2,
        maxChildVisitors: 3,
        adultAgeYears: 16,
      })
      prisonService.updatePrison.mockResolvedValue(prison)

      return request(app)
        .post(url)
        .send(updatePrisonDto)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Visitor configuration updated',
            text: 'Visitor configuration updated',
          })

          expect(prisonService.updatePrison).toHaveBeenCalledWith('user1', prison.code, updatePrisonDto)
        })
    })

    it('should set validation errors for invalid form data and set data in formValues', () => {
      const formData = {
        maxTotalVisitors: '0',
        maxAdultVisitors: '0',
        maxChildVisitors: 'X',
        adultAgeYears: '20',
      }

      const expectedValidationErrors = [
        expect.objectContaining({ path: 'maxTotalVisitors', msg: 'Enter a value of at least 1' }),
        expect.objectContaining({ path: 'maxAdultVisitors', msg: 'Enter a value of at least 1' }),
        expect.objectContaining({ path: 'maxChildVisitors', msg: 'Enter a value of at least 0' }),
        expect.objectContaining({ path: 'adultAgeYears', msg: 'Enter a value between 0 and 18' }),
      ]

      const expectedFormValues = {
        maxTotalVisitors: 0,
        maxAdultVisitors: 0,
        maxChildVisitors: NaN,
        adultAgeYears: 20,
      }

      return request(app)
        .post(url)
        .send(formData)
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(prisonService.updatePrison).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      const updatePrisonDto = TestData.updatePrisonDto({
        maxTotalVisitors: 6,
        maxAdultVisitors: 2,
        maxChildVisitors: 3,
        adultAgeYears: 16,
      })

      prisonService.updatePrison.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(url)
        .send(updatePrisonDto)
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
        })
    })
  })
})
