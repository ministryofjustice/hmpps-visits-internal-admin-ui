import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockCategoryGroupService, createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'
import prisonerCategories from '../../../constants/prisonerCategories'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const categoryGroupService = createMockCategoryGroupService()
const prisonService = createMockPrisonService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { categoryGroupService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Category groups listing page', () => {
  describe('GET /prisons/{:prisonId}/category-groups', () => {
    const categoryGroups = [TestData.categoryGroup()]

    beforeEach(() => {
      categoryGroupService.getCategoryGroups.mockResolvedValue(categoryGroups)
    })

    it('should display category groups listing page for the prison', () => {
      return request(app)
        .get(`/prisons/${prison.code}/category-groups`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prison.name)

          expect($('[data-test="prison-status"]').text().trim()).toBe('Active')

          expect($('.moj-sub-navigation__item').length).toBe(6)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Category groups')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe(
            `/prisons/${prison.code}/category-groups`,
          )

          expect($('h2').text().trim()).toContain('Category groups')

          expect($('[data-test="add-category-group"]').attr('href')).toBe(`/prisons/${prison.code}/category-groups/add`)

          expect($('[data-test="category-group-name"]').eq(0).text()).toBe(categoryGroups[0].name)
          expect($('[data-test="category-group-name"]').eq(0).find('a').attr('href')).toBe(
            `/prisons/${prison.code}/category-groups/${categoryGroups[0].reference}`,
          )
          categoryGroups[0].categories.forEach((category, index) => {
            expect($('[data-test="category-group-levels"]').eq(0).find('li').eq(index).text()).toBe(
              prisonerCategories[category],
            )
          })
        })
    })
  })
})
