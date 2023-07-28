import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockCategoryGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

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
        .get(`/prisons/HEI/category-groups/${categoryGroup.reference}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/category-groups')
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(categoryGroup.name)
          expect($('.test-template-reference').text()).toContain(categoryGroup.reference)

          expect($('.test-template-categories li').text()).toContain('Category A - Exceptional Risk')
          expect($('.test-template-categories li').text()).toContain('Category A - High Risk')
          expect($('.test-template-categories li').text()).toContain('Category A - Provisional')
          expect($('.test-template-categories li').text()).toContain('Category A - Standard')

          expect($('[data-test="category-delete-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/category-groups/${categoryGroup.reference}/delete`,
          )
        })
    })
  })

  describe('POST /prisons/{:prisonId}/category-groups/{:reference}/delete', () => {
    it('should delete category group and set flash message', () => {
      // Then
      return request(app)
        .post(`/prisons/HEI/category-groups/${categoryGroup.reference}/delete`)
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
  })
})
