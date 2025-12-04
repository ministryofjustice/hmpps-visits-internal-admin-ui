import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockBookerService, createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'

let app: Express
let flashData: FlashData

const bookerService = createMockBookerService()
const prisonService = createMockPrisonService()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrisonNames.mockResolvedValue({ HEI: 'Hewell (HMP)' })

  app = appWithAllRoutes({ services: { bookerService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Booker details', () => {
  describe('GET /bookers/booker/{:reference}', () => {
    const prisoner = TestData.permittedPrisonerDto()
    const booker = TestData.bookerDto({ permittedPrisoners: [prisoner] })

    beforeEach(() => {
      bookerService.getBookerByReference.mockResolvedValue(booker)
    })

    it('should render the booker details page', () => {
      return request(app)
        .get(`/bookers/booker/${booker.reference}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')
          expect($('.govuk-back-link').attr('href')).toBe('/bookers')

          expect($('h1').text().trim()).toBe('Booker details')

          expect($('.moj-alert').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('[data-test=booker-email]').text()).toBe(booker.email)
          expect($('[data-test=booker-reference]').text()).toBe(booker.reference)

          expect($('[data-test=prison-number-1]').text()).toBe(prisoner.prisonerId)
          expect($('[data-test=prison-name-1]').text()).toBe('Hewell (HMP)')
          expect($('[data-test=prisoner-visitors-1]').text().trim()).toBe('1')

          expect(bookerService.getBookerByReference).toHaveBeenCalledWith('user1', booker.reference)
          expect(prisonService.getPrisonNames).toHaveBeenCalledWith('user1')
        })
    })

    it('should render correct back link if coming from booker search results page', () => {
      return request(app)
        .get(`/bookers/booker/${booker.reference}?from=search-results`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-back-link').attr('href')).toBe('/bookers/search/results')
        })
    })

    it('should redirect to booker search if invalid booker reference in URL', () => {
      return request(app).get('/bookers/booker/not-a-booker-ref').expect(302).expect('location', '/bookers')
    })
  })
})
