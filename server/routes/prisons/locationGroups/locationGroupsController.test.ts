import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockLocationGroupService, createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const locationGroupService = createMockLocationGroupService()
const prisonService = createMockPrisonService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { locationGroupService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Location groups listing page', () => {
  describe('GET /prisons/{:prisonId}/location-groups', () => {
    const locationGroups = [TestData.locationGroup()]

    beforeEach(() => {
      locationGroupService.getLocationGroups.mockResolvedValue(locationGroups)
    })

    it('should display location groups listing page for the prison', () => {
      return request(app)
        .get(`/prisons/${prison.code}/location-groups`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prison.name)

          expect($('[data-test="prison-status"]').text().trim()).toBe('Active')
          expect($('[data-test="prison-clients"]').text().trim()).toBe('Staff')

          expect($('.moj-sub-navigation__item').length).toBe(6)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Location groups')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe(
            `/prisons/${prison.code}/location-groups`,
          )

          expect($('h2').text().trim()).toContain('Location groups')

          expect($('[data-test="add-location-group"]').attr('href')).toBe(`/prisons/${prison.code}/location-groups/add`)

          expect($('[data-test="location-group-name"]').eq(0).text()).toBe(locationGroups[0].name)
          expect($('[data-test="location-group-name"]').eq(0).find('a').attr('href')).toBe(
            `/prisons/${prison.code}/location-groups/${locationGroups[0].reference}`,
          )
          expect($('[data-test="location-group-count"]').eq(0).text()).toBe('1')
        })
    })
  })
})
