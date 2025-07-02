import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockPrisonerContactRegistryApiClient } from '../data/testutils/mocks'
import PrisonerContactsService from './prisonerContactsService'

const token = 'some token'

describe('Prisoner Contacts service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const prisonerContactRegistryApiClient = createMockPrisonerContactRegistryApiClient()

  let prisonerContactsService: PrisonerContactsService

  const PrisonerContactRegistryApiClientFactory = jest.fn()

  beforeEach(() => {
    PrisonerContactRegistryApiClientFactory.mockReturnValue(prisonerContactRegistryApiClient)
    prisonerContactsService = new PrisonerContactsService(PrisonerContactRegistryApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSocialContacts', () => {
    it('should get social contacts for prisoner - approvedOnly = true', async () => {
      const contacts = [TestData.contact()]
      const prisoner = TestData.permittedPrisonerDto()

      prisonerContactRegistryApiClient.getApprovedSocialContacts.mockResolvedValue(contacts)
      const results = await prisonerContactsService.getSocialContacts({
        username: 'user',
        prisonerId: prisoner.prisonerId,
        approvedOnly: true,
      })

      expect(prisonerContactRegistryApiClient.getApprovedSocialContacts).toHaveBeenCalledWith(prisoner.prisonerId)
      expect(prisonerContactRegistryApiClient.getAllSocialContacts).not.toHaveBeenCalled()
      expect(results).toStrictEqual(contacts)
    })

    it('should get social contacts for prisoner - approvedOnly = false', async () => {
      const contacts = [TestData.contact()]
      const prisoner = TestData.permittedPrisonerDto()

      prisonerContactRegistryApiClient.getAllSocialContacts.mockResolvedValue(contacts)
      const results = await prisonerContactsService.getSocialContacts({
        username: 'user',
        prisonerId: prisoner.prisonerId,
        approvedOnly: false,
      })

      expect(prisonerContactRegistryApiClient.getAllSocialContacts).toHaveBeenCalledWith(prisoner.prisonerId)
      expect(prisonerContactRegistryApiClient.getApprovedSocialContacts).not.toHaveBeenCalled()
      expect(results).toStrictEqual(contacts)
    })
  })
})
