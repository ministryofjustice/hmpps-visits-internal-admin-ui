import nock from 'nock'
import config from '../config'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import TestData from '../routes/testutils/testData'

describe('prisonRegisterApiClient', () => {
  let fakePrisonRegisterApi: nock.Scope
  let prisonRegisterApiClient: PrisonRegisterApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakePrisonRegisterApi = nock(config.apis.prisonRegister.url)
    prisonRegisterApiClient = new PrisonRegisterApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getPrisons', () => {
    it('should return all prisons from the Prison Register', async () => {
      const allPrisonRegisterPrisons = TestData.prisonRegisterPrisons()

      fakePrisonRegisterApi
        .get('/prisons')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, allPrisonRegisterPrisons)

      const output = await prisonRegisterApiClient.getPrisons()
      expect(output).toEqual(allPrisonRegisterPrisons)
    })
  })

  describe('Prison contact details', () => {
    describe('getPrisonContactDetails', () => {
      it('should return prison SOCIAL_VISIT contact details from the Prison Register', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        fakePrisonRegisterApi
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(200, prisonContactDetails)

        const output = await prisonRegisterApiClient.getPrisonContactDetails('HEI')
        expect(output).toEqual(prisonContactDetails)
      })

      it('should return null if prison SOCIAL_VISIT contact details not found', async () => {
        fakePrisonRegisterApi
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(404)

        const output = await prisonRegisterApiClient.getPrisonContactDetails('HEI')
        expect(output).toEqual(null)
      })

      it('should throw API errors', async () => {
        fakePrisonRegisterApi
          .get('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(400)

        await expect(prisonRegisterApiClient.getPrisonContactDetails('HEI')).rejects.toThrow('Bad Request')
      })
    })

    describe('createPrisonContactDetails', () => {
      it('should create prison SOCIAL_VISIT contact details for selected prison', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        fakePrisonRegisterApi
          .post('/secure/prisons/id/HEI/department/contact-details', prisonContactDetails)
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(201, prisonContactDetails)

        const output = await prisonRegisterApiClient.createPrisonContactDetails('HEI', prisonContactDetails)
        expect(output).toEqual(prisonContactDetails)
      })
    })

    describe('deletePrisonContactDetails', () => {
      it('should delete prison SOCIAL_VISIT contact details for selected prison', async () => {
        fakePrisonRegisterApi
          .delete('/secure/prisons/id/HEI/department/contact-details')
          .query({ departmentType: 'SOCIAL_VISIT' })
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(204)

        await prisonRegisterApiClient.deletePrisonContactDetails('HEI')
        expect(fakePrisonRegisterApi.isDone()).toBe(true)
      })
    })

    describe('updatePrisonContactDetails', () => {
      it('should update prison SOCIAL_VISIT contact details for selected prison', async () => {
        const prisonContactDetails = TestData.prisonContactDetails()

        fakePrisonRegisterApi
          .put('/secure/prisons/id/HEI/department/contact-details', prisonContactDetails)
          .query({ removeIfNull: 'true' })
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(201, prisonContactDetails)

        const output = await prisonRegisterApiClient.updatePrisonContactDetails('HEI', prisonContactDetails)
        expect(output).toEqual(prisonContactDetails)
      })
    })
  })
})
