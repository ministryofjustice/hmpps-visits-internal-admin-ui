import nock from 'nock'
import config from '../config'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import TestData from '../routes/testutils/testData'
import { Prison } from './visitSchedulerApiTypes'

describe('visitSchedulerApiClient', () => {
  let fakeVisitSchedulerApi: nock.Scope
  let visitSchedulerApiClient: VisitSchedulerApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakeVisitSchedulerApi = nock(config.apis.visitScheduler.url)
    visitSchedulerApiClient = new VisitSchedulerApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      const results = TestData.prisons()

      fakeVisitSchedulerApi.get('/config/prisons').matchHeader('authorization', `Bearer ${token}`).reply(200, results)

      const output = await visitSchedulerApiClient.getAllPrisons()

      expect(output).toEqual(results)
    })
  })

  describe('getPrison', () => {
    it('should return details of specified prison', async () => {
      const prison = TestData.prison()

      fakeVisitSchedulerApi
        .get(`/config/prisons/prison/${prison.code}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.getPrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('createPrison', () => {
    it('should add prison to list of supported prisons', async () => {
      const prison: Prison = {
        active: false,
        code: 'BHI',
        excludeDates: [],
      }

      fakeVisitSchedulerApi
        .post('/config/prisons/prison', <Prison>{
          active: prison.active,
          code: prison.code,
          excludeDates: prison.excludeDates,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, prison)

      const output = await visitSchedulerApiClient.createPrison(prison)

      expect(output).toEqual(prison)
    })
  })

  describe('activatePrison', () => {
    it('should return activated prison', async () => {
      const prison = TestData.prison()

      fakeVisitSchedulerApi
        .put(`/config/prisons/prison/${prison.code}/activate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.activatePrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('deactivatePrison', () => {
    it('should return deactivated prison', async () => {
      const prison = TestData.prison()

      fakeVisitSchedulerApi
        .put(`/config/prisons/prison/${prison.code}/deactivate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.deactivatePrison(prison.code)

      expect(output).toEqual(prison)
    })
  })
})
