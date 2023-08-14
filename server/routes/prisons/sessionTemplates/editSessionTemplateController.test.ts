import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import {
  createMockPrisonService,
  createMockSessionTemplateService,
  createMockIncentiveGroupService,
  createMockCategoryGroupService,
  createMockLocationGroupService,
} from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage | Record<string, string>[]>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()
const incentiveGroupService = createMockIncentiveGroupService()
const categoryGroupService = createMockCategoryGroupService()
const locationGroupService = createMockLocationGroupService()

const prison = TestData.prison()
const reference = '-afe.dcc.0f'

beforeEach(() => {
  const sessionTemplate = TestData.sessionTemplate()
  const visitStats = TestData.visitStats()
  sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplate)
  sessionTemplateService.getTemplateStats.mockResolvedValue(visitStats)

  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({
    services: {
      prisonService,
      sessionTemplateService,
      incentiveGroupService,
      categoryGroupService,
      locationGroupService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Update a session template', () => {
  const url = `/prisons/${prison.code}/session-templates/${reference}/edit`

  describe('GET /prisons/{:prisonId}/session-templates/{:reference}/edit', () => {
    it('should render update session template form with form data pre-populated', () => {
      const results = request(app).get(url)

      return results.expect('Content-Type', /html/).expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(2)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

        expect($('h1 span').text().trim()).toBe(prison.name)
        expect($('h1').text().trim()).toContain('Update session template')

        expect($('[data-test="total-booked-test"]').text().trim()).toBe(
          'This visit session template currently has 4 future visits booked',
        )
        expect($('.moj-banner').text().trim()).toContain(
          'For the date: 8 January 2023, there is currently 4 visits booked',
        )

        expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

        expect($('#name').attr('value')).toBe('WEDNESDAY, 2023-03-21, 13:45')

        expect($('#validFromDate-validFromDateDay').attr('value')).toBe('21')
        expect($('#validFromDate-validFromDateMonth').attr('value')).toBe('03')
        expect($('#validFromDate-hint').text().trim()).toContain('This must be before: 8 January 2023')

        expect($('#validToDate-hint').text().trim()).toContain('This must be after: 8 January 2023')

        expect($('#openCapacity').attr('value')).toBe('35')
        expect($('#openCapacity-hint').text().trim()).toContain('The minimum allowed is currently: 3')

        expect($('#closedCapacity').attr('value')).toBe('2')
        expect($('#closedCapacity-hint').text().trim()).toContain('The minimum allowed is currently: 1')

        expect($('#visitRoom').attr('value')).toBe('Visits Main Room')

        expect($('[data-test="submit"]').text().trim()).toBe('Update')
      })
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/add', () => {
    it('should send valid data to create session template and redirect to view template', () => {
      // Given
      const updateSessionTemplateDto = TestData.updateSessionTemplateDto({
        sessionDateRange: { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
      })

      // When
      const results = request(app)
        .post(url)
        .send('name=session template name')
        .send('validFromDateDay=01')
        .send('validFromDateMonth=02')
        .send('validFromDateYear=2023')
        .send('hasEndDate=yes')
        .send('validToDateDay=31')
        .send('validToDateMonth=12')
        .send('validToDateYear=2024')
        .send('openCapacity=10')
        .send('closedCapacity=5')
        .send('visitRoom=visit room name')

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/${reference}/edit`)
        .expect(() => {
          expect(flashProvider).not.toHaveBeenCalledWith('errors')
          expect(flashProvider).not.toHaveBeenCalledWith('formValues')
          expect(sessionTemplateService.updateSessionTemplate).toHaveBeenCalledWith(
            'user1',
            reference,
            updateSessionTemplateDto,
          )
        })
    })
  })
})
