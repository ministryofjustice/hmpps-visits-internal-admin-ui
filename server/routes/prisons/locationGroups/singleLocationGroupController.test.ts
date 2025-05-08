import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockLocationGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const locationGroupService = createMockLocationGroupService()

const allPrisons = TestData.prisons()
const prison = TestData.prison()

const locationGroup = TestData.locationGroup()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

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
        .get(`/prisons/${prison.code}/location-groups/${locationGroup.reference}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe(`/prisons/${prison.code}/location-groups`)
          expect($('h1').text()).toContain(prison.name)
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
        .get(`/prisons/${prison.code}/location-groups/${locationGroup.reference}?sessionTemplateRef=-afe.dcc.a8`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').eq(0).attr('href')).toBe(`/prisons/${prison.code}/session-templates/-afe.dcc.a8`)
          expect($('h1').text()).toContain(prison.name)
        })
    })
  })

  describe('POST /prisons/{:prisonId}/location-groups/{:reference}/delete', () => {
    it('should delete location group and set flash message', () => {
      return request(app)
        .post(`/prisons/${prison.code}/location-groups/${locationGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Location group deleted',
            text: `Location group '${locationGroup.name}' has been deleted`,
          })
          expect(locationGroupService.deleteLocationGroup).toHaveBeenCalledWith('user1', `${locationGroup.reference}`)
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      locationGroupService.deleteLocationGroup.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(`/prisons/${prison.code}/location-groups/${locationGroup.reference}/delete`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups/${locationGroup.reference}`)
        .expect(() => {
          expect(locationGroupService.deleteLocationGroup).toHaveBeenCalledWith('user1', `${locationGroup.reference}`)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
        })
    })
  })
})
