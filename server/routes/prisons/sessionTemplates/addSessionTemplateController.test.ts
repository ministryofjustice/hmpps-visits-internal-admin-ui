import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import {
  createMockPrisonService,
  createMockSessionTemplateService,
  createMockIncentiveGroupService,
  createMockCategoryGroupService,
  createMockLocationGroupService,
} from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { IncentiveGroup, CategoryGroup, LocationGroup } from '../../../data/visitSchedulerApiTypes'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()
const incentiveGroupService = createMockIncentiveGroupService()
const categoryGroupService = createMockCategoryGroupService()
const locationGroupService = createMockLocationGroupService()

const prison = TestData.prison()

beforeEach(() => {
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

describe('Add a session template', () => {
  const url = `/prisons/${prison.code}/session-templates/add`

  describe('GET /prisons/{:prisonId}/session-templates/add', () => {
    it('should render add session template form with any errors and form data pre-populated', () => {
      // Given
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
        hasIncentiveGroups: 'yes',
        hasCategoryGroups: 'yes',
        hasLocationGroups: 'yes',
        visitOrderRestriction: 'VO',
      }
      const errors = <FieldValidationError[]>[
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
        { path: 'visitOrderRestriction', msg: 'visitOrderRestriction error' },
      ]

      flashData = { errors, formValues: [formValues] }

      // When
      const results = request(app).get(url)

      // Then
      return results.expect('Content-Type', /html/).expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(3)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

        expect($('h1 span').text().trim()).toBe(prison.name)
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

        expect($('#visitOrderRestriction-error').text()).toContain('visitOrderRestriction error')
        expect($('input[name=visitOrderRestriction]:checked').attr('value')).toBe('VO')
        expect($('input[name=visitOrderRestriction]:checked ~ label').text().trim()).toBe('VO only')

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
    it('should send valid data to create session template and redirect to view template', () => {
      // Given
      const incentiveLevelGroupReferences = ['tRef1', 'tRef2']
      const categoryGroupReferences = ['cRef1', 'cRef2']
      const locationGroupReferences = ['lRef1', 'lRef2']

      const createSessionTemplateDto = TestData.createSessionTemplateDto({
        includeIncentiveGroupType: false,
        incentiveLevelGroupReferences,
        includeCategoryGroupType: false,
        categoryGroupReferences,
        includeLocationGroupType: false,
        locationGroupReferences,
        clients: [
          { active: true, userType: 'STAFF' },
          { active: false, userType: 'PUBLIC' },
        ],
        visitOrderRestriction: 'PVO',
      })

      const sessionTemplate = TestData.sessionTemplate({ visitOrderRestriction: 'PVO' })
      sessionTemplate.prisonerIncentiveLevelGroups = [
        { reference: incentiveLevelGroupReferences[0] },
        { reference: incentiveLevelGroupReferences[1] },
      ] as IncentiveGroup[]

      sessionTemplate.prisonerCategoryGroups = [
        { reference: categoryGroupReferences[0] },
        { reference: categoryGroupReferences[1] },
      ] as CategoryGroup[]

      sessionTemplate.permittedLocationGroups = [
        { reference: locationGroupReferences[0] },
        { reference: locationGroupReferences[1] },
      ] as LocationGroup[]

      sessionTemplateService.createSessionTemplate.mockResolvedValue(sessionTemplate)

      // When
      const results = request(app)
        .post(url)
        .send('name=session template name')
        .send('dayOfWeek=MONDAY')
        .send('startTime=13:00')
        .send('endTime=14:00')
        .send('weeklyFrequency=2')
        .send('validFromDateDay=01')
        .send('validFromDateMonth=02')
        .send('validFromDateYear=2023')
        .send('hasEndDate=yes')
        .send('validToDateDay=31')
        .send('validToDateMonth=12')
        .send('validToDateYear=2024')
        .send('visitOrderRestriction=PVO')
        .send('openCapacity=10')
        .send('closedCapacity=5')
        .send('visitRoom=visit room name')
        .send('hasIncentiveGroups=yes')
        .send('incentiveGroupBehaviour=exclude')
        .send(`incentiveGroupReferences=${incentiveLevelGroupReferences[0]}`)
        .send(`incentiveGroupReferences=${incentiveLevelGroupReferences[1]}`)
        .send('hasCategoryGroups=yes')
        .send('categoryGroupBehaviour=exclude')
        .send(`categoryGroupReferences=${categoryGroupReferences[0]}`)
        .send(`categoryGroupReferences=${categoryGroupReferences[1]}`)
        .send('hasLocationGroups=yes')
        .send('locationGroupBehaviour=exclude')
        .send(`locationGroupReferences=${locationGroupReferences[0]}`)
        .send(`locationGroupReferences=${locationGroupReferences[1]}`)
        .send(`hideInPublicServices=yes`)

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/${sessionTemplate.reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Session template created',
            text: `Session template '${sessionTemplate.name}' has been created`,
          })
          expect(sessionTemplateService.createSessionTemplate).toHaveBeenCalledWith('user1', createSessionTemplateDto)
        })
    })

    it('should set validation errors for invalid form data and set data in formValues - basic', () => {
      // Given
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'name', msg: 'Enter a name between 3 and 100 characters long' }),
        expect.objectContaining({ path: 'dayOfWeek', msg: 'Select a day of the week' }),
        expect.objectContaining({ path: 'startTime', msg: 'Enter a valid time' }),
        expect.objectContaining({ path: 'endTime', msg: 'Enter a valid time' }),
        expect.objectContaining({
          path: 'weeklyFrequency',
          msg: 'Enter a weekly frequency value between 1 and 12',
        }),
        expect.objectContaining({
          path: 'validFromDateDay',
          msg: 'Enter a valid day',
        }),
        expect.objectContaining({
          path: 'validFromDateMonth',
          msg: 'Enter a valid month',
        }),
        expect.objectContaining({
          path: 'validFromDateYear',
          msg: 'Enter the year for template start date as 4 digits, e.g. 2023',
        }),
        expect.objectContaining({ path: 'hasEndDate', msg: 'Enter a valid date for template end date' }),
        expect.objectContaining({ path: 'openCapacity', msg: 'Enter a capacity for either open or closed' }),
        expect.objectContaining({ path: 'closedCapacity', msg: 'Enter a capacity for either open or closed' }),
        expect.objectContaining({ path: 'visitRoom', msg: 'Enter a name over 3 characters long' }),
        expect.objectContaining({
          path: 'incentiveGroupReferences',
          msg: 'You must select at least one incentive group',
        }),
        expect.objectContaining({
          path: 'categoryGroupReferences',
          msg: 'You must select at least one category group',
        }),
        expect.objectContaining({
          path: 'locationGroupReferences',
          msg: 'You must select at least one location group',
        }),
      ]

      const expectedFormValues = {
        name: 'a',
        dayOfWeek: 'XXX',
        startTime: '123',
        endTime: '456',
        weeklyFrequency: 0,
        validFromDateDay: 'a',
        validFromDateMonth: 'b',
        validFromDateYear: 'c',
        hasEndDate: 'yes',
        validToDateDay: '31',
        validToDateMonth: '02',
        validToDateYear: '2000',
        openCapacity: 0,
        closedCapacity: 0,
        visitRoom: 'z',
        hasIncentiveGroups: 'yes',
        incentiveGroupReferences: Array<string>(),
        hasCategoryGroups: 'yes',
        categoryGroupReferences: Array<string>(),
        hasLocationGroups: 'yes',
        locationGroupReferences: Array<string>(),
        hideInPublicServices: 'yes',
      }

      // When
      const results = request(app)
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
        .send('hasIncentiveGroups=yes')
        .send('hasCategoryGroups=yes')
        .send('hasLocationGroups=yes')
        .send('hideInPublicServices=yes')

      // Then
      return results
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

describe('Copy a session template', () => {
  const sessionTemplateToCopy = TestData.sessionTemplate({
    prisonerIncentiveLevelGroups: [TestData.incentiveGroup()],
    prisonerCategoryGroups: [TestData.categoryGroup()],
    permittedLocationGroups: [TestData.locationGroup()],
    visitOrderRestriction: 'NONE',
  })

  const expectedFormValues: Record<string, string | string[]> = {
    name: 'COPY - WEDNESDAY, 2023-03-21, 13:45',
    dayOfWeek: 'WEDNESDAY',
    startTime: '13:45',
    endTime: '14:45',
    weeklyFrequency: '1',
    validFromDateDay: '21',
    validFromDateMonth: '03',
    validFromDateYear: '2023',
    openCapacity: '35',
    closedCapacity: '2',
    visitRoom: 'Visits Main Room',
    hasIncentiveGroups: 'yes',
    incentiveGroupBehaviour: 'include',
    incentiveGroupReferences: [sessionTemplateToCopy.prisonerIncentiveLevelGroups[0].reference],
    hasCategoryGroups: 'yes',
    categoryGroupBehaviour: 'include',
    categoryGroupReferences: [sessionTemplateToCopy.prisonerCategoryGroups[0].reference],
    hasLocationGroups: 'yes',
    locationGroupBehaviour: 'include',
    locationGroupReferences: [sessionTemplateToCopy.permittedLocationGroups[0].reference],
    hideInPublicServices: 'no',
    visitOrderRestriction: 'NONE',
  }

  describe('POST /prisons/{:prisonId}/session-templates/copy', () => {
    it('should pre-populate formValues in flash and redirect to add template form - no end date', () => {
      // Given
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplateToCopy)

      // When
      const results = request(app).post(
        `/prisons/${prison.code}/session-templates/${sessionTemplateToCopy.reference}/copy`,
      )

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/add`)
        .expect(() => {
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledWith(
            'user1',
            sessionTemplateToCopy.reference,
          )
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
        })
    })

    it('should pre-populate formValues in flash and redirect to add template form - with end date', () => {
      // Given
      sessionTemplateToCopy.sessionDateRange.validToDate = '2023-12-31'
      sessionTemplateService.getSingleSessionTemplate.mockResolvedValue(sessionTemplateToCopy)

      const endDateValues = {
        hasEndDate: 'yes',
        validToDateDay: '31',
        validToDateMonth: '12',
        validToDateYear: '2023',
      }
      // When
      const results = request(app).post(
        `/prisons/${prison.code}/session-templates/${sessionTemplateToCopy.reference}/copy`,
      )

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/session-templates/add`)
        .expect(() => {
          expect(sessionTemplateService.getSingleSessionTemplate).toHaveBeenCalledWith(
            'user1',
            sessionTemplateToCopy.reference,
          )
          expect(flashProvider).toHaveBeenCalledWith('formValues', { ...expectedFormValues, ...endDateValues })
        })
    })
  })
})
