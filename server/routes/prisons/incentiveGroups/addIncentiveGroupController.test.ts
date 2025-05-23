import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockIncentiveGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const incentiveGroupService = createMockIncentiveGroupService()

const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService, incentiveGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add an incentive group', () => {
  const url = `/prisons/${prison.code}/incentive-groups/add`

  describe('GET /prisons/{:prisonId}/incentive-groups/add', () => {
    it('should render add incentive group form with no errors and form data pre-populated', () => {
      const formValues = {
        name: 'Incentive group 1',
        incentiveLevels: ['BASIC', 'ENHANCED'],
      }

      const errors = <FieldValidationError[]>[{ path: 'name', msg: 'name error' }]

      flashData = { errors, formValues: [formValues] }

      return request(app)
        .get(url)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/incentive-groups')
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Add an incentive level group')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#name-error"]').length).toBe(1)
          expect($('#name-error').text()).toContain('name error')

          expect($('input#name').val()).toBe('Incentive group 1')

          expect($('#incentiveLevels').val()).toBe('ENHANCED')
          expect($('#incentiveLevels').prop('checked')).toBe(true)

          expect($('#incentiveLevels-2').val()).toBe('ENHANCED_2')
          expect($('#incentiveLevels-2').prop('checked')).toBe(false)

          expect($('#incentiveLevels-3').val()).toBe('ENHANCED_3')
          expect($('#incentiveLevels-3').prop('checked')).toBe(false)

          expect($('#incentiveLevels-4').val()).toBe('BASIC')
          expect($('#incentiveLevels-4').prop('checked')).toBe(true)

          expect($('#incentiveLevels-5').val()).toBe('STANDARD')
          expect($('#incentiveLevels-5').prop('checked')).toBe(false)

          expect($('[data-test="submit"]').text().trim()).toBe('Add')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/incentive-groups/add', () => {
    it('should send valid data to create an incentive group and redirect to view template', () => {
      const createIncentiveGroupDto = TestData.createIncentiveGroupDto()

      const incentiveGroup = TestData.incentiveGroup({ ...createIncentiveGroupDto })
      incentiveGroupService.createIncentiveGroup.mockResolvedValue(incentiveGroup)

      return request(app)
        .post(url)
        .send(`name=${createIncentiveGroupDto.name}`)
        .send('incentiveLevels=ENHANCED')
        .expect(302)
        .expect('location', `/prisons/${prison.code}/incentive-groups/${incentiveGroup.reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)

          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Incentive level group created',
            text: `Incentive level group '${createIncentiveGroupDto.name}' has been created`,
          })

          expect(incentiveGroupService.createIncentiveGroup).toHaveBeenCalledWith('user1', createIncentiveGroupDto)
        })
    })

    it('should set validation errors for invalid form data and set data in formValues', () => {
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'name', msg: 'Enter a name between 3 and 100 characters long' }),
        expect.objectContaining({ path: 'incentiveLevels', msg: 'Invalid value entered' }),
      ]

      const expectedFormValues = {
        name: 'a',
        incentiveLevels: ['BASIC', 'STANDARD', 'ENHANC'],
      }

      return request(app)
        .post(url)
        .send('name=a')
        .send('incentiveLevels=BASIC')
        .send('incentiveLevels=STANDARD')
        .send('incentiveLevels=ENHANC')
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(incentiveGroupService.createIncentiveGroup).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      const createIncentiveGroupDto = TestData.createIncentiveGroupDto()
      incentiveGroupService.createIncentiveGroup.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(url)
        .send(`name=${createIncentiveGroupDto.name}`)
        .send('incentiveLevels=ENHANCED')
        .expect(302)
        .expect('location', `/prisons/${prison.code}/incentive-groups/add`)
        .expect(() => {
          expect(incentiveGroupService.createIncentiveGroup).toHaveBeenCalledWith('user1', createIncentiveGroupDto)
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', {
            name: createIncentiveGroupDto.name,
            incentiveLevels: createIncentiveGroupDto.incentiveLevels,
          })
        })
    })
  })
})
