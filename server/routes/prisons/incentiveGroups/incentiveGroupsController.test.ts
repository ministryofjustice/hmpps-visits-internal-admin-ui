import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockIncentiveGroupService, createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'
import incentiveLevels from '../../../constants/incentiveLevels'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const incentiveGroupService = createMockIncentiveGroupService()
const prisonService = createMockPrisonService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { incentiveGroupService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Incentive level groups listing page', () => {
  describe('GET /prisons/{:prisonId}/incentive-groups', () => {
    const incentiveGroups = [TestData.incentiveGroup()]

    beforeEach(() => {
      incentiveGroupService.getIncentiveGroups.mockResolvedValue(incentiveGroups)
    })

    it('should display incentive groups listing page for the prison', () => {
      return request(app)
        .get(`/prisons/${prison.code}/incentive-groups`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('.moj-primary-navigation__item').length).toBe(2)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1').text().trim()).toBe(prison.name)

          expect($('[data-test="prison-status"]').text().trim()).toBe('Active')

          expect($('.moj-sub-navigation__item').length).toBe(6)
          expect($('.moj-sub-navigation__link[aria-current]').text()).toBe('Incentive level groups')
          expect($('.moj-sub-navigation__link[aria-current]').attr('href')).toBe(
            `/prisons/${prison.code}/incentive-groups`,
          )

          expect($('h2').text().trim()).toContain('Incentive level groups')

          expect($('[data-test="add-incentive-group"]').attr('href')).toBe(
            `/prisons/${prison.code}/incentive-groups/add`,
          )

          expect($('[data-test="incentive-group-name"]').eq(0).text()).toBe(incentiveGroups[0].name)
          expect($('[data-test="incentive-group-name"]').eq(0).find('a').attr('href')).toBe(
            `/prisons/${prison.code}/incentive-groups/${incentiveGroups[0].reference}`,
          )
          incentiveGroups[0].incentiveLevels.forEach((level, index) => {
            expect($('[data-test="incentive-group-levels"]').eq(0).find('li').eq(index).text()).toBe(
              incentiveLevels[level],
            )
          })
        })
    })
  })
})
