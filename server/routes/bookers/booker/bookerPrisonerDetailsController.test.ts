import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockBookerService, createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import config from '../../../config'

let app: Express
let flashData: FlashData

const bookerService = createMockBookerService()
const prisonService = createMockPrisonService()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrisonName.mockResolvedValue('Hewell (HMP)')

  app = appWithAllRoutes({ services: { bookerService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Booker prisoner details', () => {
  describe('GET /bookers/booker/{:reference}/prisoner/{:prisonerId}', () => {
    const prisoner = TestData.permittedPrisonerDto()
    const booker = TestData.bookerDto({ permittedPrisoners: [prisoner] })

    beforeEach(() => {
      bookerService.getBookerByReference.mockResolvedValue(booker)
    })

    it('should render the prisoner details page', () => {
      return request(app)
        .get(`/bookers/booker/${booker.reference}/prisoner/${prisoner.prisonerId}`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')
          expect($('.govuk-back-link').attr('href')).toBe(`/bookers/booker/${booker.reference}`)

          expect($('h1').text().trim()).toBe('Prisoner details')

          expect($('.moj-alert').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('[data-test=booker-email]').text()).toBe(booker.email)
          expect($('[data-test=booker-reference]').text()).toBe(booker.reference)

          expect($('[data-test=prisoner-number]').text()).toBe(prisoner.prisonerId)
          expect($('[data-test=registered-prison-name]').text()).toBe('Hewell (HMP)')

          expect($('[data-test=linked-visitor-count]').text().trim()).toBe('1')

          expect($('[data-test=staff-service-booker-link]').attr('href')).toBe(
            `${config.staffServiceUrl}/manage-bookers/${booker.reference}/booker-details`,
          )

          expect(bookerService.getBookerByReference).toHaveBeenCalledWith('user1', booker.reference)
          expect(prisonService.getPrisonName).toHaveBeenCalledWith('user1', prisoner.prisonCode)
        })
    })

    it('should redirect to booker details if invalid prisoner reference in URL', () => {
      return request(app)
        .get(`/bookers/booker/${booker.reference}/prisoner/NOT-A-PRISONER`)
        .expect(302)
        .expect('location', `/bookers/booker/${booker.reference}`)
    })
  })
})
