import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import TestData from '../routes/testutils/testData'

describe('prisonRegisterApiClient', () => {
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let prisonRegisterApiClient: PrisonRegisterApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    prisonRegisterApiClient = new PrisonRegisterApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getPrisonNames', () => {
    it('should return all prisons from the Prison Register', async () => {
      const prisonNames = TestData.prisonNames()

      nock(config.apis.prisonRegister.url)
        .get('/prisons/names')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, prisonNames)

      const output = await prisonRegisterApiClient.getPrisonNames()
      expect(output).toEqual(prisonNames)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('Prison contact details', () => {
    describe('getPrisonContactDetails', () => {
      it('should return prison SOCIAL_VISIT contact details from the Prison Register', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        nock(config.apis.prisonRegister.url)
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(200, prisonContactDetails)

        const output = await prisonRegisterApiClient.getPrisonContactDetails('HEI')
        expect(output).toEqual(prisonContactDetails)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })

      it('should return null if prison SOCIAL_VISIT contact details not found', async () => {
        nock(config.apis.prisonRegister.url)
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(404)

        const output = await prisonRegisterApiClient.getPrisonContactDetails('HEI')
        expect(output).toEqual(null)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })

      it('should throw API errors', async () => {
        nock(config.apis.prisonRegister.url)
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(400)

        await expect(prisonRegisterApiClient.getPrisonContactDetails('HEI')).rejects.toThrow('Bad Request')

        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('createPrisonContactDetails', () => {
      it('should create prison SOCIAL_VISIT contact details for selected prison', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        nock(config.apis.prisonRegister.url)
          .post('/secure/prisons/id/HEI/department/contact-details', prisonContactDetails)
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(201, prisonContactDetails)

        const output = await prisonRegisterApiClient.createPrisonContactDetails('HEI', prisonContactDetails)
        expect(output).toEqual(prisonContactDetails)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('deletePrisonContactDetails', () => {
      it('should delete prison SOCIAL_VISIT contact details for selected prison', async () => {
        nock(config.apis.prisonRegister.url)
          .delete('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(204)

        await prisonRegisterApiClient.deletePrisonContactDetails('HEI')
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('updatePrisonContactDetails', () => {
      it('should update prison SOCIAL_VISIT contact details for selected prison', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        nock(config.apis.prisonRegister.url)
          .put('/secure/prisons/id/HEI/department/contact-details', prisonContactDetails)
          .query({ removeIfNull: 'true' })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(201, prisonContactDetails)

        const output = await prisonRegisterApiClient.updatePrisonContactDetails('HEI', prisonContactDetails)
        expect(output).toEqual(prisonContactDetails)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })
  })
})
