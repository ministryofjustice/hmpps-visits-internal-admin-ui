import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { SessionData } from 'express-session'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockBookerService, createMockPrisonerContactsService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | Record<string, string>[] | FlashErrorMessage>

const bookerService = createMockBookerService()
const prisonerContactsService = createMockPrisonerContactsService()
let sessionData: SessionData

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])
  sessionData = {} as SessionData

  app = appWithAllRoutes({ services: { bookerService, prisonerContactsService }, sessionData })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Booker details', () => {
  describe('GET /bookers/booker/details', () => {
    it('should render the booker details page', () => {
      const contact = TestData.contact()
      const prisoner = TestData.permittedPrisonerDto({
        permittedVisitors: [{ visitorId: contact.personId, active: true }],
      })
      const booker = TestData.bookerDto({ permittedPrisoners: [prisoner] })
      sessionData.booker = booker
      bookerService.getBookerByEmail.mockResolvedValue(booker)
      prisonerContactsService.getSocialContacts.mockResolvedValue([contact])

      return request(app)
        .get('/bookers/booker/details')
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/bookers')

          expect($('h1').text().trim()).toBe('Booker details')

          expect($('.moj-banner__message').length).toBe(0)
          expect($('.govuk-error-summary').length).toBe(0)

          expect($('[data-test=booker-email]').text()).toBe(booker.email)
          expect($('[data-test=booker-reference]').text()).toBe(booker.reference)

          expect($('[data-test=prisoner-number]').text()).toBe(prisoner.prisonerId)
          expect($('[data-test=prisoner-status]').text().trim()).toBe('Active')

          expect($('[data-test=visitor-name-1]').text()).toBe(`${contact.firstName} ${contact.lastName}`)
          expect($('[data-test=visitor-id-1]').text()).toBe(contact.personId.toString())
          expect($('[data-test=visitor-dob-1]').text()).toContain('28 July 1986')
          expect($('[data-test=visitor-approved-1]').text()).toBe('Yes')
          expect($('[data-test=visitor-restrictions-1]').text().trim()).toBe('None')
          expect($('[data-test=visitor-status-1]').text().trim()).toBe('Active')

          expect(bookerService.getBookerByEmail).toHaveBeenCalledWith('user1', booker.email)
          expect(prisonerContactsService.getSocialContacts).toHaveBeenCalledWith({
            username: 'user1',
            prisonerId: prisoner.prisonerId,
            approvedOnly: false,
          })
        })
    })

    it('should redirect to booker search if no booker in session', () => {
      return request(app).get('/bookers/booker/details').expect(302).expect('location', '/bookers')
    })
  })
})