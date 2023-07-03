import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage | Record<string, string>[]>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const prisonNames = TestData.prisonNames()
const prison = TestData.prison()
const prisonName = prisonNames[prison.code]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getPrisonNames.mockResolvedValue(prisonNames)
  prisonService.getPrison.mockResolvedValue({ prison, prisonName })

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add a session template', () => {
  const url = `/prisons/${prison.code}/session-templates/add`

  describe('GET /prisons/{:prisonId}/session-templates/add', () => {
    it('should render add session template form with any errors and form data pre-populated', () => {
      const formValues = {
        name: 'a',
        dayOfWeek: 'MONDAY',
        startTime: '1',
        endTime: '2',
        weeklyFrequency: '0',
        validFromDateDay: '1',
        validFromDateMonth: '2',
        validFromDateYear: '3',
        hasEndDate: 'yes',
        validToDateDay: '4',
        validToDateMonth: '5',
        validToDateYear: '6',
        openCapacity: 'aa',
        closedCapacity: 'bb',
        visitRoom: 'ab',
      }
      const errors = [
        { path: 'name', msg: 'name error' },
        { path: 'dayOfWeek', msg: 'dayOfWeek error' },
        { path: 'startTime', msg: 'startTime error' },
        { path: 'endTime', msg: 'endTime error' },
        { path: 'weeklyFrequency', msg: 'weeklyFrequency error' },
        { path: 'validFromDate', msg: 'validFromDate error' },
        { path: 'hasEndDate', msg: 'hasEndDate error' },
        { path: 'openCapacity', msg: 'openCapacity error' },
        { path: 'closedCapacity', msg: 'closedCapacity error' },
        { path: 'visitRoom', msg: 'visitRoom error' },
      ]

      flashData = { errors, formValues: [formValues] }

      return request(app)
        .get(url)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1 span').text().trim()).toBe(prisonName)
          expect($('h1').text().trim()).toContain('Add session template')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#name-error"]').length).toBe(1)
          expect($('#name-error').text()).toContain('name error')
          expect($('#name').attr('value')).toBe('a')

          expect($('.govuk-error-summary a[href="#dayOfWeek-error"]').length).toBe(1)
          expect($('#dayOfWeek-error').text()).toContain('dayOfWeek error')
          expect($('#dayOfWeek option[value="MONDAY"]').attr('selected')).toBe('selected')

          expect($('.govuk-error-summary a[href="#startTime-error"]').length).toBe(1)
          expect($('#startTime-error').text()).toContain('startTime error')
          expect($('#startTime').attr('value')).toBe('1')

          expect($('.govuk-error-summary a[href="#endTime-error"]').length).toBe(1)
          expect($('#endTime-error').text()).toContain('endTime error')
          expect($('#endTime').attr('value')).toBe('2')

          expect($('.govuk-error-summary a[href="#weeklyFrequency-error"]').length).toBe(1)
          expect($('#weeklyFrequency-error').text()).toContain('weeklyFrequency error')
          expect($('#weeklyFrequency').attr('value')).toBe('0')

          expect($('.govuk-error-summary a[href="#validFromDate-error"]').length).toBe(1)
          expect($('#validFromDate-error').text()).toContain('validFromDate error')
          expect($('#validFromDate-validFromDateDay').attr('value')).toBe('1')
          expect($('#validFromDate-validFromDateMonth').attr('value')).toBe('2')
          expect($('#validFromDate-validFromDateYear').attr('value')).toBe('3')

          expect($('.govuk-error-summary a[href="#hasEndDate-error"]').length).toBe(1)
          expect($('#hasEndDate-error').text()).toContain('hasEndDate error')
          expect($('#hasEndDate').attr('value')).toBe('yes')
          expect($('#validToDate-validToDateDay').attr('value')).toBe('4')
          expect($('#validToDate-validToDateMonth').attr('value')).toBe('5')
          expect($('#validToDate-validToDateYear').attr('value')).toBe('6')

          expect($('.govuk-error-summary a[href="#openCapacity-error"]').length).toBe(1)
          expect($('#openCapacity-error').text()).toContain('openCapacity error')
          expect($('#openCapacity').attr('value')).toBe('aa')

          expect($('.govuk-error-summary a[href="#closedCapacity-error"]').length).toBe(1)
          expect($('#closedCapacity-error').text()).toContain('closedCapacity error')
          expect($('#closedCapacity').attr('value')).toBe('bb')

          expect($('.govuk-error-summary a[href="#visitRoom-error"]').length).toBe(1)
          expect($('#visitRoom-error').text()).toContain('visitRoom error')
          expect($('#visitRoom').attr('value')).toBe('ab')

          expect($('[data-test="submit"]').text().trim()).toBe('Add')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/add', () => {
    it('should set validation errors for invalid form data and set data in formValues - basic', () => {
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'name', msg: 'Enter a name between 3 and 100 characters long' }),
        expect.objectContaining({ path: 'dayOfWeek', msg: 'Select a day of the week' }),
        expect.objectContaining({ path: 'startTime', msg: 'Enter a valid time' }),
        expect.objectContaining({ path: 'endTime', msg: 'Enter a valid time' }),
        expect.objectContaining({ path: 'weeklyFrequency', msg: 'Enter a weekly frequency value between 1 and 12' }),
        expect.objectContaining({
          path: 'validFromDateDay',
          msg: 'Enter the date in number format for template start date',
        }),
        expect.objectContaining({
          path: 'validFromDateMonth',
          msg: 'Enter the date in number format for template start date',
        }),
        expect.objectContaining({
          path: 'validFromDateYear',
          msg: 'Enter the date in number format for template start date',
        }),
        expect.objectContaining({ path: 'hasEndDate', msg: 'Enter a valid date for template end date' }),
        expect.objectContaining({ path: 'openCapacity', msg: 'Enter a capacity for either open or closed' }),
        expect.objectContaining({ path: 'closedCapacity', msg: 'Enter a capacity for either open or closed' }),
        expect.objectContaining({ path: 'visitRoom', msg: 'Enter a name over 3 characters long' }),
      ]

      const expectedFormValues = {
        name: 'a',
        dayOfWeek: 'XXX',
        startTime: '123',
        endTime: '456',
        weeklyFrequency: '0',
        validFromDateDay: 'a',
        validFromDateMonth: 'b',
        validFromDateYear: 'c',
        hasEndDate: 'yes',
        validToDateDay: '31',
        validToDateMonth: '02',
        validToDateYear: '2000',
        openCapacity: '0',
        closedCapacity: '0',
        visitRoom: 'z',
      }

      return request(app)
        .post(url)
        .send('name=a')
        .send('dayOfWeek=XXX')
        .send('startTime=123')
        .send('endTime=456')
        .send('weeklyFrequency=0')
        .send('validFromDateDay=a')
        .send('validFromDateMonth=b')
        .send('validFromDateYear=c')
        .send('hasEndDate=yes')
        .send('validToDateDay=31')
        .send('validToDateMonth=02')
        .send('validToDateYear=2000')
        .send('openCapacity=0')
        .send('closedCapacity=0')
        .send('visitRoom=z')
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(sessionTemplateService.createSessionTemplate).not.toHaveBeenCalled()
        })
    })
  })
})
