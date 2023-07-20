import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockCategoryGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage | Record<string, string | Record<string, string>[]>[]>

const prisonService = createMockPrisonService()
const categoryGroupService = createMockCategoryGroupService()

const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService, categoryGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add a category group', () => {
  const url = `/prisons/${prison.code}/category-groups/add`

  describe('GET /prisons/{:prisonId}/category-groups/add', () => {
    it('should render add category group form with any errors and form data pre-populated', () => {
      const formValues = {
        name: 'a',
      }
      const errors = [
        { path: 'name', msg: 'name error' },
        { path: 'prisonerCategories', msg: 'prisonerCategories error' },
      ]

      flashData = { errors, formValues: [formValues] }

      return request(app)
        .get(url)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Add a category group')
          expect($('h1[class=govuk-fieldset__heading]').text().trim()).toBe('Which categories is this group for?')
          expect($('div[id=prisonerCategories-hint]').text().trim()).toContain('Select all that apply.')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#name-error"]').text()).toBe('name error')
          expect($('.govuk-error-summary a[href="#prisonerCategories-error"]').text()).toBe('prisonerCategories error')

          expect($('#name-error').text()).toContain('name error')
          expect($('#prisonerCategories-error').text()).toContain('prisonerCategories error')
          expect($('input#name').val()).toBe('a')
          expect($('input#prisonerCategories').val()).toBe('A_EXCEPTIONAL')
          expect($('input#prisonerCategories-2').val()).toBe('A_HIGH')
          expect($('[data-test="submit"]').text().trim()).toBe('Add')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/category-groups/add', () => {
    it('should send valid data to create a category group and redirect to view template', () => {
      const createCategoryGroupDto = TestData.createCategoryGroupDto({
        categories: ['C', 'D'],
      })

      const categoryGroup = TestData.categoryGroup({ ...createCategoryGroupDto })
      categoryGroupService.createCategoryGroup.mockResolvedValue(categoryGroup)

      return request(app)
        .post(url)
        .send(`name=${createCategoryGroupDto.name}`)
        .send('prisonerCategories[0]=C')
        .send('prisonerCategories[1]=D')
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/category-groups/${categoryGroup.reference}`)
        .expect(() => {
          expect(flashProvider).not.toHaveBeenCalledWith('errors')
          expect(flashProvider).not.toHaveBeenCalledWith('formValues')

          expect(categoryGroupService.createCategoryGroup).toHaveBeenCalledWith('user1', createCategoryGroupDto)
        })
    })

    it('should set validation errors for invalid form data and set data in formValues', () => {
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'name', msg: 'Enter a name between 3 and 100 characters long' }),
        expect.objectContaining({ path: 'prisonerCategories', msg: 'Select at least one option' }),
      ]

      const expectedFormValues = {
        name: 'a',
        prisonerCategories: [] as string[],
      }

      return request(app)
        .post(url)
        .send('name=a')
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(categoryGroupService.createCategoryGroup).not.toHaveBeenCalled()
        })
    })
  })
})
