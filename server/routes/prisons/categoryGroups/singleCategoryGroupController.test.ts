import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockCategoryGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'
import prisonerCategories from '../../../constants/prisonerCategories'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const categoryGroupService = createMockCategoryGroupService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

const categoryGroup = TestData.categoryGroup()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  categoryGroupService.getSingleCategoryGroup.mockResolvedValue(categoryGroup)

  app = appWithAllRoutes({ services: { prisonService, categoryGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Single category group page', () => {
  describe('GET /prisons/{:prisonId}/category-groups/{:reference}', () => {
    it('should display all category group information', () => {
      return request(app)
        .get(`/prisons/${prison.code}/category-groups/${categoryGroup.reference}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe(`/prisons/${prison.code}/category-groups`)
          expect($('h1').text()).toContain(prison.name)
          expect($('h1').text()).toContain(categoryGroup.name)
          expect($('.test-template-reference').text()).toContain(categoryGroup.reference)

          categoryGroup.categories.forEach((category, index) => {
            expect($('.test-template-categories li').eq(index).text()).toBe(prisonerCategories[category])
          })

          expect($('[data-test="category-delete-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/category-groups/${categoryGroup.reference}/delete`,
          )
        })
    })
    it('should have the correct back link, when coming from the session template', () => {
      return request(app)
        .get(`/prisons/${prison.code}/category-groups/${categoryGroup.reference}?sessionTemplateRef=-afe.dcc.a8`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe(`/prisons/${prison.code}/session-templates/-afe.dcc.a8`)
          expect($('h1').text()).toContain(prison.name)
        })
    })
  })

  describe('POST /prisons/{:prisonId}/category-groups/{:reference}/delete', () => {
    it('should delete category group and set flash message', () => {
      return request(app)
        .post(`/prisons/${prison.code}/category-groups/${categoryGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/category-groups`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `Category group '${categoryGroup.name}' has been deleted`,
          )
          expect(categoryGroupService.deleteCategoryGroup).toHaveBeenCalledTimes(1)
          expect(categoryGroupService.deleteCategoryGroup).toHaveBeenCalledWith('user1', categoryGroup.reference)
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      categoryGroupService.deleteCategoryGroup.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(`/prisons/${prison.code}/category-groups/${categoryGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/category-groups/${categoryGroup.reference}`)
        .expect(() => {
          expect(categoryGroupService.deleteCategoryGroup).toHaveBeenCalledTimes(1)
          expect(categoryGroupService.deleteCategoryGroup).toHaveBeenCalledWith('user1', categoryGroup.reference)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
        })
    })
  })
})
