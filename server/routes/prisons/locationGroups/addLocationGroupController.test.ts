import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockLocationGroupService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage | Record<string, string | Record<string, string>[]>[]>

const prisonService = createMockPrisonService()
const locationGroupService = createMockLocationGroupService()

const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService, locationGroupService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add a location group', () => {
  const url = `/prisons/${prison.code}/location-groups/add`

  describe('GET /prisons/{:prisonId}/location-groups/add', () => {
    it('should render add location group form with any errors and form data pre-populated', () => {
      const formValues = {
        name: 'a',
        location: [
          {
            levelOneCode: 'aaaaaa',
            levelTwoCode: 'b',
            levelThreeCode: 'c',
            levelFourCode: 'd',
          },
        ],
      }
      const errors = [
        { path: 'name', msg: 'name error' },
        { path: 'location[0].levelOneCode', msg: 'max chars error' },
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
          expect($('h1').text().trim()).toContain('Add a location group')

          expect($(`form[action=${url}][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#name-error"]').text()).toBe('name error')
          expect($('.govuk-error-summary a[href="#location[0].levelOneCode-error"]').text()).toBe('max chars error')

          expect($('#name-error').text()).toContain('name error')
          expect($('input#name').val()).toBe('a')
          expect($('#location\\[0\\]\\.levelOneCode-error').text()).toContain('max chars error')
          expect($('input#location\\[0\\]\\[levelOneCode\\]').val()).toBe('aaaaaa')
          expect($('input#location\\[0\\]\\[levelTwoCode\\]').val()).toBe('b')
          expect($('input#location\\[0\\]\\[levelThreeCode\\]').val()).toBe('c')
          expect($('input#location\\[0\\]\\[levelFourCode\\]').val()).toBe('d')

          expect($('[data-test="submit"]').text().trim()).toBe('Add')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/location-groups/add', () => {
    it('should send valid data to create a location group and redirect to view template', () => {
      const createLocationGroupDto = TestData.createLocationGroupDto({
        locations: [
          { levelOneCode: '1a', levelTwoCode: '2a', levelThreeCode: '3a', levelFourCode: '4a' },
          { levelOneCode: '1b', levelTwoCode: '2b', levelThreeCode: '3b', levelFourCode: '4b' },
        ],
      })

      const locationGroup = TestData.locationGroup({ ...createLocationGroupDto })
      locationGroupService.createLocationGroup.mockResolvedValue(locationGroup)

      return request(app)
        .post(url)
        .send(`name=${createLocationGroupDto.name}`)
        .send('location[0][levelOneCode]=1a')
        .send('location[0][levelTwoCode]=2a')
        .send('location[0][levelThreeCode]=3a')
        .send('location[0][levelFourCode]=4a')
        .send('location[1][levelOneCode]=1b')
        .send('location[1][levelTwoCode]=2b')
        .send('location[1][levelThreeCode]=3b')
        .send('location[1][levelFourCode]=4b')
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups/${locationGroup.reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `Location group '${createLocationGroupDto.name}' has been created`,
          )

          expect(locationGroupService.createLocationGroup).toHaveBeenCalledWith('user1', createLocationGroupDto)
        })
    })

    it('should not send entries for blank levels', () => {
      const createLocationGroupDto = TestData.createLocationGroupDto({
        locations: [{ levelOneCode: '1a' }, { levelOneCode: '1b', levelTwoCode: '2b' }],
      })

      const locationGroup = TestData.locationGroup({ ...createLocationGroupDto })
      locationGroupService.createLocationGroup.mockResolvedValue(locationGroup)

      return request(app)
        .post(url)
        .send(`name=${createLocationGroupDto.name}`)
        .send('location[0][levelOneCode]=1a')
        .send('location[0][levelTwoCode]=')
        .send('location[0][levelThreeCode]=')
        .send('location[0][levelFourCode]=')
        .send('location[1][levelOneCode]=1b')
        .send('location[1][levelTwoCode]=2b')
        .send('location[1][levelThreeCode]=')
        .send('location[1][levelFourCode]=')
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups/${locationGroup.reference}`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith(
            'message',
            `Location group '${createLocationGroupDto.name}' has been created`,
          )
          expect(locationGroupService.createLocationGroup.mock.calls[0]).toStrictEqual([
            'user1',
            createLocationGroupDto,
          ])
        })
    })

    it('should set validation errors for invalid form data and set data in formValues', () => {
      const expectedValidationErrors = [
        expect.objectContaining({ path: 'name', msg: 'Enter a name between 3 and 100 characters long' }),
        expect.objectContaining({ path: 'location[1].levelOneCode', msg: 'Level one code required' }),
        expect.objectContaining({ path: 'location[1].levelTwoCode', msg: 'Level two code required' }),
        expect.objectContaining({ path: 'location[1].levelThreeCode', msg: 'Level three code required' }),
      ]

      const expectedFormValues = {
        name: 'a',
        location: [
          {
            levelOneCode: '1a',
            levelTwoCode: '2a',
            levelThreeCode: '3a',
            levelFourCode: '4a',
          },
          {
            levelOneCode: '',
            levelTwoCode: '',
            levelThreeCode: '',
            levelFourCode: '4b',
          },
        ],
      }

      return request(app)
        .post(url)
        .send('name=a')
        .send('location[0][levelOneCode]=1a')
        .send('location[0][levelTwoCode]=2a')
        .send('location[0][levelThreeCode]=3a')
        .send('location[0][levelFourCode]=4a')
        .send('location[1][levelOneCode]=')
        .send('location[1][levelTwoCode]=')
        .send('location[1][levelThreeCode]=')
        .send('location[1][levelFourCode]=4b')
        .expect(302)
        .expect('location', url)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
          expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(locationGroupService.createLocationGroup).not.toHaveBeenCalled()
        })
    })

    it('should handle API errors by setting flash errors and redirecting to same page', () => {
      const createLocationGroupDto = TestData.createLocationGroupDto({
        locations: [{ levelOneCode: '1a', levelTwoCode: '2a', levelThreeCode: '3a', levelFourCode: '4a' }],
      })
      locationGroupService.createLocationGroup.mockRejectedValue(new BadRequest('API error!'))

      return request(app)
        .post(url)
        .send(`name=${createLocationGroupDto.name}`)
        .send(`location[0][levelOneCode]=${createLocationGroupDto.locations[0].levelOneCode}`)
        .send(`location[0][levelTwoCode]=${createLocationGroupDto.locations[0].levelTwoCode}`)
        .send(`location[0][levelThreeCode]=${createLocationGroupDto.locations[0].levelThreeCode}`)
        .send(`location[0][levelFourCode]=${createLocationGroupDto.locations[0].levelFourCode}`)
        .expect(302)
        .expect('location', `/prisons/${prison.code}/location-groups/add`)
        .expect(() => {
          expect(locationGroupService.createLocationGroup).toHaveBeenCalledWith('user1', createLocationGroupDto)
          expect(flashProvider.mock.calls.length).toBe(2)
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          expect(flashProvider).toHaveBeenCalledWith('formValues', {
            name: createLocationGroupDto.name,
            location: createLocationGroupDto.locations,
          })
        })
    })
  })
})
