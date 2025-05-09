import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { BadRequest } from 'http-errors'
import { FieldValidationError } from 'express-validator'
import { appWithAllRoutes, FlashData, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { MoJAlert } from '../../../@types/visits-admin'

let app: Express
let flashData: FlashData

const prisonService = createMockPrisonService()

const prison = TestData.prison()

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation((key: keyof FlashData) => flashData[key])

  prisonService.getPrison.mockResolvedValue(prison)

  app = appWithAllRoutes({ services: { prisonService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add / edit contact details', () => {
  const baseUrl = `/prisons/${prison.code}/configuration/contact-details`

  describe('GET /prisons/{:prisonId}/configuration/contact-details/add', () => {
    it('should render add contact details form with any errors and form data pre-populated', () => {
      const formValues = {
        emailAddress: 'a',
        phoneNumber: 'b',
        webAddress: 'c',
      }
      const errors = <FieldValidationError[]>[
        { path: 'emailAddress', msg: 'email error' },
        { path: 'phoneNumber', msg: 'phone error' },
        { path: 'webAddress', msg: 'web error' },
      ]

      flashData = { errors, formValues: [formValues] }

      return request(app)
        .get(`${baseUrl}/add`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.moj-primary-navigation__item').length).toBe(3)
          expect($('.moj-primary-navigation__link[aria-current]').attr('href')).toBe('/prisons')

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Add contact details')

          expect($(`form[action=${baseUrl}/add][method="POST"]`).length).toBe(1)

          expect($('.govuk-error-summary a[href="#emailAddress-error"]').text()).toBe('email error')
          expect($('.govuk-error-summary a[href="#phoneNumber-error"]').text()).toBe('phone error')
          expect($('.govuk-error-summary a[href="#webAddress-error"]').text()).toBe('web error')

          expect($('#emailAddress-error').text()).toContain('email error')
          expect($('#phoneNumber-error').text()).toContain('phone error')
          expect($('#webAddress-error').text()).toContain('web error')

          expect($('input#emailAddress').val()).toBe('a')
          expect($('input#phoneNumber').val()).toBe('b')
          expect($('input#webAddress').val()).toBe('c')

          expect($('[data-test="submit"]').text().trim()).toBe('Add')
        })
    })

    it('should render edit contact details form', () => {
      return request(app)
        .get(`${baseUrl}/edit`)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)

          expect($('h1 span').text().trim()).toBe(prison.name)
          expect($('h1').text().trim()).toContain('Edit contact details')

          expect($(`form[action=${baseUrl}/edit][method="POST"]`).length).toBe(1)
          expect($('[data-test="submit"]').text().trim()).toBe('Update')
        })
    })
  })

  describe('POST /prisons/{:prisonId}/configuration/contact-details/(add|edit)', () => {
    it('should send valid data to add contact details and redirect to view template', () => {
      const prisonContactDetails = TestData.prisonContactDetails()
      prisonService.createPrisonContactDetails.mockResolvedValue(prisonContactDetails)

      return request(app)
        .post(`${baseUrl}/add`)
        .send(`emailAddress=${prisonContactDetails.emailAddress}`)
        .send(`phoneNumber=${prisonContactDetails.phoneNumber}`)
        .send(`webAddress=${prisonContactDetails.webAddress}`)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Contact details added',
            text: 'Contact details added',
          })

          expect(prisonService.createPrisonContactDetails).toHaveBeenCalledWith(
            'user1',
            prison.code,
            prisonContactDetails,
          )
        })
    })

    it('should send valid data to edit contact details and redirect to view template', () => {
      const prisonContactDetails = TestData.prisonContactDetails()
      prisonService.updatePrisonContactDetails.mockResolvedValue(prisonContactDetails)

      return request(app)
        .post(`${baseUrl}/edit`)
        .send(`emailAddress=${prisonContactDetails.emailAddress}`)
        .send(`phoneNumber=${prisonContactDetails.phoneNumber}`)
        .send(`webAddress=${prisonContactDetails.webAddress}`)
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Contact details updated',
            text: 'Contact details updated',
          })

          expect(prisonService.updatePrisonContactDetails).toHaveBeenCalledWith(
            'user1',
            prison.code,
            prisonContactDetails,
          )
        })
    })

    it.each(['add', 'edit'])(
      'should set validation errors for invalid form data and set data in formValues - %s',
      (action: string) => {
        const expectedValidationErrors = [
          expect.objectContaining({ path: 'emailAddress', msg: 'Enter a valid email address' }),
          expect.objectContaining({ path: 'phoneNumber', msg: 'Enter a valid phone number' }),
          expect.objectContaining({ path: 'webAddress', msg: 'Enter a valid web address' }),
        ]

        const expectedFormValues = {
          emailAddress: 'a',
          phoneNumber: 'b',
          webAddress: 'c',
        }

        return request(app)
          .post(`${baseUrl}/${action}`)
          .send('emailAddress=a')
          .send('phoneNumber=b')
          .send('webAddress=c')
          .expect(302)
          .expect('location', `${baseUrl}/${action}`)
          .expect(() => {
            expect(flashProvider).toHaveBeenCalledWith('errors', expect.arrayContaining(expectedValidationErrors))
            expect(flashProvider).toHaveBeenCalledWith('formValues', expectedFormValues)
            expect(prisonService.createPrisonContactDetails).not.toHaveBeenCalled()
            expect(prisonService.updatePrisonContactDetails).not.toHaveBeenCalled()
          })
      },
    )

    it.each(['add', 'edit'])(
      'should handle API errors by setting flash errors and redirecting to same page - %s',
      (action: string) => {
        const prisonContactDetails = TestData.prisonContactDetails()

        prisonService.createPrisonContactDetails.mockRejectedValue(new BadRequest('API error!'))
        prisonService.updatePrisonContactDetails.mockRejectedValue(new BadRequest('API error!'))

        return request(app)
          .post(`${baseUrl}/${action}`)
          .send(`emailAddress=${prisonContactDetails.emailAddress}`)
          .send(`phoneNumber=${prisonContactDetails.phoneNumber}`)
          .send(`webAddress=${prisonContactDetails.webAddress}`)
          .expect(302)
          .expect('location', `${baseUrl}/${action}`)
          .expect(() => {
            expect(flashProvider.mock.calls.length).toBe(2)
            expect(flashProvider).toHaveBeenCalledWith('errors', [{ msg: '400 API error!' }])
          })
      },
    )

    it('should not add contact details if no data entered', () => {
      return request(app)
        .post(`${baseUrl}/add`)
        .send('emailAddress= ')
        .send('phoneNumber= ')
        .send('webAddress= ')
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'information',
            title: 'No contact details added',
            text: 'No contact details added (none entered)',
          })
          expect(prisonService.createPrisonContactDetails).not.toHaveBeenCalled()
          expect(prisonService.updatePrisonContactDetails).not.toHaveBeenCalled()
        })
    })

    it('should delete contact details if values all set to empty', () => {
      prisonService.deletePrisonContactDetails.mockResolvedValue()
      return request(app)
        .post(`${baseUrl}/edit`)
        .send('emailAddress= ')
        .send('phoneNumber= ')
        .send('webAddress= ')
        .expect(302)
        .expect('Location', `/prisons/${prison.code}/configuration`)
        .expect(() => {
          expect(flashProvider.mock.calls.length).toBe(1)
          expect(flashProvider).toHaveBeenCalledWith('messages', <MoJAlert>{
            variant: 'success',
            title: 'Contact details removed',
            text: 'Contact details removed (all values set to empty)',
          })
          expect(prisonService.createPrisonContactDetails).not.toHaveBeenCalled()
          expect(prisonService.updatePrisonContactDetails).not.toHaveBeenCalled()
          expect(prisonService.deletePrisonContactDetails).toHaveBeenCalledWith('user1', prison.code)
        })
    })
  })
})
