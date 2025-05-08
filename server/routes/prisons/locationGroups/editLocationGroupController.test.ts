import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockLocationGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()
const locationGroupService = createMockLocationGroupService()

const prison = TestData.prison()
const reference = '-afe~dcb~fb'
const singleLocationGroup = TestData.locationGroup()

beforeEach(() => {
  locationGroupService.getSingleLocationGroup.mockResolvedValue(singleLocationGroup)

  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({
    services: {
      prisonService,
      locationGroupService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Update a location group', () => {
  const url = `/prisons/${prison.code}/location-groups/${reference}/edit`

  describe('GET /prisons/{:prisonId}/location-groups/{:reference}/edit', () => {
    it('should render update location group form with form data pre-populated', () => {
      const results = request(app).get(url)

      return results.expect('Content-Type', /html/).expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.moj-primary-navigation__item').length).toBe(3)
        expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

        expect($('.govuk-back-link').eq(0).attr('href')).toBe(`/prisons/${prison.code}/location-groups/${reference}`)

        expect($('h1 span').text().trim()).toBe(prison.name)
        expect($('h1').text().trim()).toContain('Update location group')

        expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

        expect($('#name').attr('value')).toBe(singleLocationGroup.name)

        expect($('input#location\\[0\\]\\[levelOneCode\\]').val()).toBe('A')
        expect($('input#location\\[0\\]\\[levelTwoCode\\]').val()).toBe(undefined)
        expect($('input#location\\[0\\]\\[levelThreeCode\\]').val()).toBe(undefined)
        expect($('input#location\\[0\\]\\[levelFourCode\\]').val()).toBe(undefined)

        expect($('[data-test="submit"]').text().trim()).toBe('Update')
      })
    })
  })

  describe('POST /prisons/{:prisonId}/location-groups/{:reference}/edit', () => {
    it('should send valid data to update location group and redirect to view group', () => {
      // Given
      const locationGroupDto = TestData.locationGroup({
        locations: [{ levelOneCode: 'A', levelTwoCode: '02', levelThreeCode: '03' }],
      })
      const updateLocationGroupDto = TestData.updateLocationGroupDto({
        name: locationGroupDto.name,
        locations: locationGroupDto.locations,
      })
      locationGroupService.updateLocationGroup.mockResolvedValue(locationGroupDto)

      // When
      const results = request(app)
        .post(url)
        .send(`name=${locationGroupDto.name}`)
        .send('location[0][levelOneCode]=A')
        .send('location[0][levelTwoCode]=02')
        .send('location[0][levelThreeCode]=03')

      // Then
      return results
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups/${reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Location group updated',
            text: `Location group '${locationGroupDto.name}' has been updated`,
          })
          expect(locationGroupService.updateLocationGroup).toHaveBeenCalledWith(
            'user1',
            reference,
            updateLocationGroupDto,
          )
        })
    })
  })
})
