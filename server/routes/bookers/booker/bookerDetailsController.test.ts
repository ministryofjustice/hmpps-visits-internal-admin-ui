import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import {
  createMockBookerService,
  createMockPrisonerContactsService,
  createMockPrisonService,
} from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'

let app: Express
let flashData: FlashData

const bookerService = createMockBookerService()
const prisonerContactsService = createMockPrisonerContactsService()
const prisonService = createMockPrisonService()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrisonName.mockResolvedValue('Hewell (HMP)')

  app = appWithAllRoutes({ services: { bookerService, prisonerContactsService, prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Booker details', () => {
  describe('GET /bookers/booker/{:reference}', () => {
    const contact = TestData.contact()
    const prisoner = TestData.permittedPrisonerDto({
      permittedVisitors: [{ visitorId: contact.personId, active: true }],
    })
    const booker = TestData.bookerDto({ permittedPrisoners: [prisoner] })

    beforeEach(() => {
      bookerService.getBookerByReference.mockResolvedValue(booker)
      prisonerContactsService.getSocialContacts.mockResolvedValue([contact])
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

          expect($('[data-test=prisoner-number]').text()).toBe(prisoner.prisonerId)
          expect($('[data-test=registered-prison-name]').text()).toBe('Hewell (HMP)')
          expect($('[data-test=prisoner-status]').text().trim()).toBe('Active')

          expect($('[data-test=visitor-name-1]').text()).toBe(`${contact.firstName} ${contact.lastName}`)
          expect($('[data-test=visitor-id-1]').text()).toBe(contact.personId.toString())
          expect($('[data-test=visitor-dob-1]').text()).toContain('28 July 1986')
          expect($('[data-test=visitor-approved-1]').text()).toBe('Yes')
          expect($('[data-test=visitor-restrictions-1]').text().trim()).toBe('None')
          expect($('[data-test=visitor-status-1]').text().trim()).toBe('Active')

          expect(bookerService.getBookerByReference).toHaveBeenCalledWith('user1', booker.reference)
          expect(prisonerContactsService.getSocialContacts).toHaveBeenCalledWith({
            username: 'user1',
            prisonerId: prisoner.prisonerId,
            approvedOnly: false,
          })
          expect(prisonService.getPrisonName).toHaveBeenCalledWith('user1', prisoner.prisonCode)
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
