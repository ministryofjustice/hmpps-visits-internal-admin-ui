import { NotFound } from 'http-errors'
import PrisonService from './prisonService'
import TestData from '../routes/testutils/testData'
import {
  createMockHmppsAuthClient,
  createMockPrisonRegisterApiClient,
  createMockVisitSchedulerApiClient,
} from '../data/testutils/mocks'

const token = 'some token'

describe('Prisons service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const prisonRegisterApiClient = createMockPrisonRegisterApiClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let prisonsService: PrisonService

  const PrisonRegisterApiClientFactory = jest.fn()
  const VisitSchedulerApiClientFactory = jest.fn()

  const allPrisons = TestData.prisonDtos()
  const prison = TestData.prisonDto()
  const prisonNames = TestData.prisonNames()
  const prisonRegisterPrisons = TestData.prisonRegisterPrisons()

  beforeEach(() => {
    PrisonRegisterApiClientFactory.mockReturnValue(prisonRegisterApiClient)
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    prisonsService = new PrisonService(VisitSchedulerApiClientFactory, PrisonRegisterApiClientFactory, hmppsAuthClient)

    prisonRegisterApiClient.getPrisons.mockResolvedValue(prisonRegisterPrisons)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrison', () => {
    it('should return Prison and PrisonName', async () => {
      visitSchedulerApiClient.getPrison.mockResolvedValue(prison)
      const results = await prisonsService.getPrison('user', prison.code)

      expect(results).toEqual({
        prison,
        prisonName: prisonNames[prison.code],
      })
    })

    it('should return Prison and UNKNOWN PrisonName if not in prison register', async () => {
      const prisonNotInRegister = TestData.prisonDto({ code: 'XYZ' })
      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonNotInRegister)
      const results = await prisonsService.getPrison('user', prisonNotInRegister.code)

      expect(results).toEqual({
        prison: prisonNotInRegister,
        prisonName: 'UNKNOWN',
      })
    })
  })

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(allPrisons)

      const results = await prisonsService.getAllPrisons('user')

      expect(results).toEqual(allPrisons)
    })
  })

  describe('createPrison', () => {
    it('should add prison to supported prisons', async () => {
      const newPrison = TestData.prisonDto({ active: false })

      await prisonsService.createPrison('user', prison.code)
      expect(visitSchedulerApiClient.createPrison).toHaveBeenCalledWith(newPrison)
    })
  })

  describe('getPrisonName', () => {
    it('should return prison name for given prison ID', async () => {
      const results = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      expect(results).toBe(prisonRegisterPrisons[0].prisonName)
    })

    it('should throw a 404 error if no name found for prison ID', async () => {
      await expect(prisonsService.getPrisonName('user', 'XYZ')).rejects.toThrow(NotFound)
    })
  })

  describe('getPrisonNames', () => {
    it('should return object with all prisonId / prisonNames as key / value', async () => {
      const results = await prisonsService.getPrisonNames('user')
      expect(results).toStrictEqual({
        [prisonRegisterPrisons[0].prisonId]: prisonRegisterPrisons[0].prisonName,
        [prisonRegisterPrisons[1].prisonId]: prisonRegisterPrisons[1].prisonName,
        [prisonRegisterPrisons[2].prisonId]: prisonRegisterPrisons[2].prisonName,
      })
    })
  })

  describe('activatePrison', () => {
    it('should change prison to active', async () => {
      await prisonsService.activatePrison('user', prison.code)
      expect(visitSchedulerApiClient.activatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('deactivatePrison', () => {
    it('should change prison to inactive', async () => {
      await prisonsService.deactivatePrison('user', prison.code)
      expect(visitSchedulerApiClient.deactivatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('addExcludeDate', () => {
    it('should add an exclude date to a prison', async () => {
      const excludeDate = '2023-07-06'
      await prisonsService.addExcludeDate('user', prison.code, excludeDate)
      expect(visitSchedulerApiClient.addExcludeDate).toHaveBeenCalledWith('HEI', excludeDate)
    })
  })

  describe('removeExcludeDate', () => {
    it('should remove an exclude date to a prison', async () => {
      const excludeDate = '2023-07-06'
      await prisonsService.removeExcludeDate('user', prison.code, excludeDate)
      expect(visitSchedulerApiClient.removeExcludeDate).toHaveBeenCalledWith('HEI', excludeDate)
    })
  })

  describe('API response caching', () => {
    it('should call Prison register API to get all prison names and then use internal cache for subsequent calls', async () => {
      const results = []

      results[0] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(1)
    })

    it('should refresh internal cache of all prisons after 24 hours', async () => {
      jest.useFakeTimers()

      const A_DAY_IN_MS = 24 * 60 * 60 * 1000
      const results = []

      results[0] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      jest.advanceTimersByTime(A_DAY_IN_MS)
      results[2] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[2]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })
})
