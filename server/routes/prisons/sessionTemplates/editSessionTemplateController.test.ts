import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import {
  createMockPrisonService,
  createMockSessionTemplateService,
  createMockIncentiveGroupService,
  createMockCategoryGroupService,
  createMockLocationGroupService,
} from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'
import { setFeature } from '../../../data/testutils/mockFeature'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()
const incentiveGroupService = createMockIncentiveGroupService()
const categoryGroupService = createMockCategoryGroupService()
const locationGroupService = createMockLocationGroupService()

const prison = TestData.prison()
const reference = '-afe.dcc.0f'
const sessionTemplate = TestData.sessionTemplate()
const visitStatsSummary = TestData.visitStatsSummary()

beforeEach(() => {
  setFeature('ageRestrictions', { enabled: true })

  sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplate)
  sessionTemplateService.getTemplateStats.mockResolvedValue(visitStatsSummary)

  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

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
        expect($('.moj-primary-navigation__item').length).toBe(3)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

        expect($('h1 span').text().trim()).toBe(prison.name)
        expect($('h1').text().trim()).toContain('Update session template')

        expect($('[data-test="visit-stats"]').length).toBe(1)

        expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

        expect($('#name').attr('value')).toBe('WEDNESDAY, 2023-03-21, 13:45')

        expect($('#validFromDate-validFromDateDay').attr('value')).toBe('21')
        expect($('#validFromDate-validFromDateMonth').attr('value')).toBe('03')
        expect($('#validFromDate-hint').text().trim()).toContain('This must be before: 8 January 2023')

        expect($('#validToDate-hint').text().trim()).toContain('This must be after: 8 January 2023')

        expect($('#openCapacity').attr('value')).toBe('35')
        expect($('#closedCapacity').attr('value')).toBe('2')

        expect($('#visitRoom').attr('value')).toBe('Visits Main Room')
        expect($('#hideInPublicServices').prop('checked')).toBe(false)
        expect($('#isAgeRestricted').prop('checked')).toBe(false)

        expect($('[data-test="submit"]').text().trim()).toBe('Update')
      })
    })

    it('should NOT render the age-restriction option if the feature is DISABLED', () => {
      setFeature('ageRestrictions', { enabled: false })
      app = appWithAllRoutes({
        services: {
          prisonService,
          sessionTemplateService,
          incentiveGroupService,
          categoryGroupService,
          locationGroupService,
        },
      })

      const results = request(app).get(url)

      return results.expect('Content-Type', /html/).expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text().trim()).toContain('Update session template')
        expect($('#isAgeRestricted').length).toBe(0)
      })
    })
  })

  describe('POST /prisons/{:prisonId}/session-templates/add', () => {
    it('should send valid data to update session template and redirect to view template', () => {
      // Given
      const updateSessionTemplateDto = TestData.updateSessionTemplateDto({
        name: 'new session template name',
        sessionDateRange: { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
        clients: [
          { active: true, userType: 'STAFF' },
          { active: false, userType: 'PUBLIC' },
        ],
        isAgeRestricted: true,
        ageRestriction: 18,
      })

      sessionTemplateService.updateSessionTemplate.mockResolvedValue(
        TestData.sessionTemplate({ name: 'new session template name' }),
      )

      const validateRequest = true

      // When
      const results = request(app)
        .post(url)
        .send(`name=${updateSessionTemplateDto.name}`)
        .send('validFromDateDay=01')
        .send('validFromDateMonth=02')
        .send('validFromDateYear=2023')
        .send('hasEndDate=yes')
        .send('validToDateDay=31')
        .send('validToDateMonth=12')
        .send('validToDateYear=2024')
        .send('visitOrderRestriction=VO_PVO')
        .send('openCapacity=10')
        .send('closedCapacity=5')
        .send('visitRoom=visit room name')
        .send('categoryGroupBehaviour=include')
        .send('incentiveGroupBehaviour=include')
        .send('locationGroupBehaviour=include')
        .send('hasCategoryGroups=yes')
        .send('hasIncentiveGroups=yes')
        .send('hasLocationGroups=yes')
        .send('categoryGroupReferences=-cat~abc~de')
        .send('incentiveGroupReferences=-inc~abc~de')
        .send('locationGroupReferences=-loc~abc~de')
        .send('hideInPublicServices=yes')
        .send('isAgeRestricted=yes')
        .send('ageRestriction=18')

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/${reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Session template updated',
            text: `Session template '${updateSessionTemplateDto.name}' has been updated`,
          })
          expect(sessionTemplateService.updateSessionTemplate).toHaveBeenCalledWith(
            'user1',
            reference,
            updateSessionTemplateDto,
            validateRequest,
          )
        })
    })

    it('should NOT send age-restriction properties if feature is DISABLED', () => {
      setFeature('ageRestrictions', { enabled: false })
      app = appWithAllRoutes({
        services: {
          prisonService,
          sessionTemplateService,
          incentiveGroupService,
          categoryGroupService,
          locationGroupService,
        },
      })

      // Given
      const updateSessionTemplateDto = TestData.updateSessionTemplateDto({
        name: 'new session template name',
        sessionDateRange: { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
        clients: [
          { active: true, userType: 'STAFF' },
          { active: false, userType: 'PUBLIC' },
        ],
      })
      delete updateSessionTemplateDto.isAgeRestricted
      delete updateSessionTemplateDto.ageRestriction

      sessionTemplateService.updateSessionTemplate.mockResolvedValue(
        TestData.sessionTemplate({ name: 'new session template name' }),
      )

      const validateRequest = true

      // When
      const results = request(app)
        .post(url)
        .send(`name=${updateSessionTemplateDto.name}`)
        .send('validFromDateDay=01')
        .send('validFromDateMonth=02')
        .send('validFromDateYear=2023')
        .send('hasEndDate=yes')
        .send('validToDateDay=31')
        .send('validToDateMonth=12')
        .send('validToDateYear=2024')
        .send('visitOrderRestriction=VO_PVO')
        .send('openCapacity=10')
        .send('closedCapacity=5')
        .send('visitRoom=visit room name')
        .send('categoryGroupBehaviour=include')
        .send('incentiveGroupBehaviour=include')
        .send('locationGroupBehaviour=include')
        .send('hasCategoryGroups=yes')
        .send('hasIncentiveGroups=yes')
        .send('hasLocationGroups=yes')
        .send('categoryGroupReferences=-cat~abc~de')
        .send('incentiveGroupReferences=-inc~abc~de')
        .send('locationGroupReferences=-loc~abc~de')
        .send('hideInPublicServices=yes')
        .send('isAgeRestricted=yes')
        .send('ageRestriction=18')

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/${reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Session template updated',
            text: `Session template '${updateSessionTemplateDto.name}' has been updated`,
          })
          expect(sessionTemplateService.updateSessionTemplate).toHaveBeenCalledWith(
            'user1',
            reference,
            updateSessionTemplateDto,
            validateRequest,
          )
        })
    })
  })
})
