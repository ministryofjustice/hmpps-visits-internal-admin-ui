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

  let prisonService: PrisonService

  const PrisonRegisterApiClientFactory = jest.fn()
  const VisitSchedulerApiClientFactory = jest.fn()

  const prisonDto = TestData.prisonDto()
  const prison = TestData.prison()
  const updatePrisonDto = TestData.updatePrisonDto()
  const prisonNames = TestData.prisonNames()

  beforeEach(() => {
    PrisonRegisterApiClientFactory.mockReturnValue(prisonRegisterApiClient)
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    prisonService = new PrisonService(VisitSchedulerApiClientFactory, PrisonRegisterApiClientFactory, hmppsAuthClient)

    prisonRegisterApiClient.getPrisonNames.mockResolvedValue(prisonNames)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrison', () => {
    it('should return a Prison', async () => {
      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonDto)
      const results = await prisonService.getPrison('user', prisonDto.code)

      expect(visitSchedulerApiClient.getPrison).toHaveBeenCalledWith(prisonDto.code)
      expect(results).toStrictEqual(prison)
    })

    it('should return Prison with UNKNOWN name if not in prison register', async () => {
      const prisonDtoNotInRegister = TestData.prisonDto({ code: 'XYZ' })
      const prisonNotInRegister = TestData.prison({ ...prisonDtoNotInRegister, name: 'UNKNOWN' })

      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonDtoNotInRegister)
      const results = await prisonService.getPrison('user', prisonDtoNotInRegister.code)

      expect(results).toStrictEqual(prisonNotInRegister)
    })
  })

  describe('updatePrison', () => {
    it('should return a Prison', async () => {
      visitSchedulerApiClient.updatePrison.mockResolvedValue(prisonDto)
      const results = await prisonService.updatePrison('user', prisonDto.code, updatePrisonDto)

      expect(visitSchedulerApiClient.updatePrison).toHaveBeenCalledWith(prisonDto.code, updatePrisonDto)
      expect(results).toStrictEqual(prisonDto)
    })

    it('should return Prison with UNKNOWN name if not in prison register', async () => {
      const prisonDtoNotInRegister = TestData.prisonDto({ code: 'XYZ' })
      const prisonNotInRegister = TestData.prison({ ...prisonDtoNotInRegister, name: 'UNKNOWN' })

      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonDtoNotInRegister)
      const results = await prisonService.getPrison('user', prisonDtoNotInRegister.code)

      expect(visitSchedulerApiClient.getPrison).toHaveBeenCalledWith('XYZ')
      expect(results).toStrictEqual(prisonNotInRegister)
    })
  })

  describe('getAllPrisons', () => {
    const allPrisonDtos = TestData.prisonDtos()
    const allPrisons = TestData.prisons()

    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(allPrisonDtos)

      const results = await prisonService.getAllPrisons('user')

      expect(results).toStrictEqual(allPrisons)
    })

    it('should return an array of all supported Prisons sorted by prison name', async () => {
      const unsortedPrisonDtos = [allPrisonDtos[2], allPrisonDtos[0], allPrisonDtos[1]]
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(unsortedPrisonDtos)

      const results = await prisonService.getAllPrisons('user')

      expect(results).toStrictEqual(allPrisons)
    })
  })

  describe('Prison contact details', () => {
    const prisonContactDetails = TestData.prisonContactDetails()

    const prisonContactDetailsEmptyStrings = TestData.prisonContactDetails({
      emailAddress: '',
      phoneNumber: '',
      webAddress: '',
    })

    const prisonContactDetailsNulls = TestData.prisonContactDetails({
      emailAddress: null,
      phoneNumber: null,
      webAddress: null,
    })

    describe('getPrisonContactDetails', () => {
      it('should return prison SOCIAL_VISIT contact details from the Prison Register', async () => {
        prisonRegisterApiClient.getPrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonService.getPrisonContactDetails('user', prison.code)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.getPrisonContactDetails).toHaveBeenCalledWith('HEI')
      })
    })

    describe('createPrisonContactDetails', () => {
      it('should create prison SOCIAL_VISIT contact details for selected prison', async () => {
        prisonRegisterApiClient.createPrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonService.createPrisonContactDetails('user', prison.code, prisonContactDetails)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.createPrisonContactDetails).toHaveBeenCalledWith('HEI', prisonContactDetails)
      })

      it('should create prison SOCIAL_VISIT contact details for selected prison - with empty values sent as NULL', async () => {
        prisonRegisterApiClient.createPrisonContactDetails.mockResolvedValue(prisonContactDetailsNulls)

        const results = await prisonService.createPrisonContactDetails(
          'user',
          prison.code,
          prisonContactDetailsEmptyStrings,
        )
        expect(results).toStrictEqual(prisonContactDetailsNulls)
        expect(prisonRegisterApiClient.createPrisonContactDetails).toHaveBeenCalledWith(
          'HEI',
          prisonContactDetailsNulls,
        )
      })
    })

    describe('deletePrisonContactDetails', () => {
      it('should delete prison SOCIAL_VISIT contact details for selected prison', async () => {
        await prisonService.deletePrisonContactDetails('user', prison.code)
        expect(prisonRegisterApiClient.deletePrisonContactDetails).toHaveBeenCalledWith('HEI')
      })
    })

    describe('updatePrisonContactDetails', () => {
      it('should update prison SOCIAL_VISIT contact details for selected prison', async () => {
        prisonRegisterApiClient.updatePrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonService.updatePrisonContactDetails('user', prison.code, prisonContactDetails)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.updatePrisonContactDetails).toHaveBeenCalledWith('HEI', prisonContactDetails)
      })

      it('should update prison SOCIAL_VISIT contact details for selected prison - with empty values sent as NULL', async () => {
        prisonRegisterApiClient.updatePrisonContactDetails.mockResolvedValue(prisonContactDetailsNulls)

        const results = await prisonService.updatePrisonContactDetails(
          'user',
          prison.code,
          prisonContactDetailsEmptyStrings,
        )
        expect(results).toStrictEqual(prisonContactDetailsNulls)
        expect(prisonRegisterApiClient.updatePrisonContactDetails).toHaveBeenCalledWith(
          'HEI',
          prisonContactDetailsNulls,
        )
      })
    })
  })

  describe('createPrison', () => {
    it('should add prison that is inactive and with default data to supported prisons', async () => {
      const newPrison = TestData.prisonDto({ active: false })

      await prisonService.createPrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.createPrison).toHaveBeenCalledWith(newPrison)
    })
  })

  describe('getPrisonName', () => {
    it('should return prison name for given prison ID', async () => {
      const results = await prisonService.getPrisonName('user', prisonNames[0].prisonId)
      expect(results).toBe(prisonNames[0].prisonName)
    })

    it('should throw a 404 error if no name found for prison ID', async () => {
      await expect(prisonService.getPrisonName('user', 'XYZ')).rejects.toThrow(NotFound)
    })
  })

  describe('activatePrison', () => {
    it('should change prison to active', async () => {
      await prisonService.activatePrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.activatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('deactivatePrison', () => {
    it('should change prison to inactive', async () => {
      await prisonService.deactivatePrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.deactivatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('activatePrisonClientType', () => {
    it('should activate the given client type for the prison', async () => {
      await prisonService.activatePrisonClientType('user', prisonDto.code, 'STAFF')
      expect(visitSchedulerApiClient.activatePrisonClientType).toHaveBeenCalledWith('HEI', 'STAFF')
    })
  })

  describe('deactivatePrisonClientType', () => {
    it('should deactivate the given client type for the prison', async () => {
      await prisonService.deactivatePrisonClientType('user', prisonDto.code, 'STAFF')
      expect(visitSchedulerApiClient.deactivatePrisonClientType).toHaveBeenCalledWith('HEI', 'STAFF')
    })
  })

  describe('API response caching', () => {
    it('should call Prison register API to get all prison names and then use internal cache for subsequent calls', async () => {
      const results = []

      results[0] = await prisonService.getPrisonName('user', prisonNames[0].prisonId)
      results[1] = await prisonService.getPrisonName('user', prisonNames[0].prisonId)

      expect(results[0]).toEqual(prisonNames[0].prisonName)
      expect(results[1]).toEqual(prisonNames[0].prisonName)
      expect(prisonRegisterApiClient.getPrisonNames).toHaveBeenCalledTimes(1)
    })

    it('should refresh internal cache of all prisons after 24 hours', async () => {
      jest.useFakeTimers()

      const A_DAY_IN_MS = 24 * 60 * 60 * 1000
      const results = []

      results[0] = await prisonService.getPrisonName('user', prisonNames[0].prisonId)
      results[1] = await prisonService.getPrisonName('user', prisonNames[0].prisonId)
      jest.advanceTimersByTime(A_DAY_IN_MS)
      results[2] = await prisonService.getPrisonName('user', prisonNames[0].prisonId)

      expect(results[0]).toEqual(prisonNames[0].prisonName)
      expect(results[1]).toEqual(prisonNames[0].prisonName)
      expect(results[2]).toEqual(prisonNames[0].prisonName)
      expect(prisonRegisterApiClient.getPrisonNames).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })
})
