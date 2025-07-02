import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import PrisonerContactRegistryApiClient from './prisonerContactRegistryApiClient'

describe('prisonerContactRegistryApiClient', () => {
  let fakePrisonerContactRegistryApi: nock.Scope
  let prisonerContactRegistryApiClient: PrisonerContactRegistryApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakePrisonerContactRegistryApi = nock(config.apis.prisonRegister.url)
    prisonerContactRegistryApiClient = new PrisonerContactRegistryApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getAllSocialContacts', () => {
    it('should get all social contacts for given prisoner', async () => {
      const prisoner = TestData.permittedPrisonerDto()
      const contacts = [TestData.contact()]

      fakePrisonerContactRegistryApi
        .get(`/v2/prisoners/${prisoner.prisonerId}/contacts/social`)
        .query({
          hasDateOfBirth: false,
          withAddress: false,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, contacts)

      const output = await prisonerContactRegistryApiClient.getAllSocialContacts(prisoner.prisonerId)
      expect(output).toStrictEqual(contacts)
    })
  })

  describe('getApprovedSocialContacts', () => {
    it('should get all approved social contacts for given prisoner', async () => {
      const prisoner = TestData.permittedPrisonerDto()
      const contacts = [TestData.contact()]

      fakePrisonerContactRegistryApi
        .get(`/v2/prisoners/${prisoner.prisonerId}/contacts/social/approved`)
        .query({
          hasDateOfBirth: false,
          withAddress: false,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, contacts)

      const output = await prisonerContactRegistryApiClient.getApprovedSocialContacts(prisoner.prisonerId)
      expect(output).toStrictEqual(contacts)
    })
  })
})
