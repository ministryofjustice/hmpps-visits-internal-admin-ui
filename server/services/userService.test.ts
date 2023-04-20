import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'

jest.mock('../data/hmppsAuthClient')

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      // Given
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      // When
      const result = await userService.getUser(token)

      // Then
      expect(result.displayName).toEqual('John Smith')
    })
    it('Propagates error', async () => {
      // Given
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      // When
      const result = await userService.getUser(token)

      // Then
      expect(result).rejects.toEqual(new Error('some error'))
    })
  })


  describe('getToken', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      // Given
      hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

      // When
      const result = await userService.getToken(token)

      // Then
      expect(result).toEqual(token)
    })
    it('Propagates error', async () => {
      // Given
      hmppsAuthClient.getSystemClientToken.mockRejectedValue(new Error('some error'))

      // When
      const result = await userService.getToken(token)

      // Then
      expect(result).rejects.toEqual(new Error('some error'))
    })
  })


})
