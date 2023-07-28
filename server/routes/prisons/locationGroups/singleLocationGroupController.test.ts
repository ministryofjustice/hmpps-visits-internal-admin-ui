import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockLocationGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const locationGroupService = createMockLocationGroupService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

const locationGroup = TestData.locationGroup()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getAllPrisons.mockResolvedValue(allPrisons)
  prisonService.getPrison.mockResolvedValue(prison)

  locationGroupService.getSingleLocationGroup.mockResolvedValue(locationGroup)

  app = appWithAllRoutes({ services: { prisonService, locationGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Single location group page', () => {
  describe('GET /prisons/{:prisonId}/location-groups/{:reference}', () => {
    it('should display all location group information', () => {
      return request(app)
        .get('/prisons/HEI/location-groups/-afe~dcb~fb')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/location-groups')
          expect($('h1').text()).toContain('Hewell (HMP)')
          expect($('h1').text()).toContain(locationGroup.name)
          expect($('h2').text()).toContain(locationGroup.reference)

          expect($('.govuk-table__body > tr:nth-child(1) > td').text()).toBe('A---')

          expect($('[data-test="location-delete-form"]').attr('action')).toBe(
            `/prisons/${prison.code}/location-groups/${locationGroup.reference}/delete`,
          )
        })
    })

    it('should have the correct back link, when coming from the session template', () => {
      return request(app)
        .get(`/prisons/HEI/location-groups/${locationGroup.reference}?sessionTemplateRef=-afe.dcc.a8`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe('/prisons/HEI/session-templates/-afe.dcc.a8')
          expect($('h1').text()).toContain('Hewell (HMP)')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/location-groups/{:reference}/delete', () => {
    it('should delete location group and set flash message', () => {
      // Then
      return request(app)
        .post(`/prisons/HEI/location-groups/-afe~dcb~fb/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `Location group '${locationGroup.name}' has been deleted`,
          )
          expect(locationGroupService.deleteLocationGroup).toHaveBeenCalledTimes(1)
          expect(locationGroupService.deleteLocationGroup).toHaveBeenCalledWith('user1', '-afe~dcb~fb')
        })
    })
  })
})
