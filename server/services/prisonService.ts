import { NotFound } from 'http-errors'
import { PrisonRegisterApiClient, VisitSchedulerApiClient } from '../data'
import { PrisonDto, UserClientDto, UserClientType, UpdatePrisonDto } from '../data/visitSchedulerApiTypes'
import logger from '../../logger'
import { Prison } from '../@types/visits-admin'
import { PrisonContactDetails } from '../data/prisonRegisterApiTypes'

const A_DAY_IN_MS = 24 * 60 * 60 * 1000

export default class PrisonService {
  constructor(
    private readonly visitSchedulerApiClient: VisitSchedulerApiClient,
    private readonly prisonRegisterApiClient: PrisonRegisterApiClient,
  ) {}

  // store all prison names in an object by prisonId, e.g. { HEI: 'Hewell (HMP), ... }
  private prisonNames: Record<string, string>

  private lastUpdated = 0

  async getPrison(prisonId: string): Promise<Prison> {
    await this.refreshPrisonNames()
    const prisonDto = await this.visitSchedulerApiClient.getPrison(prisonId)
    const name = this.prisonNames[prisonId] || 'UNKNOWN'

    return { ...prisonDto, name }
  }

  async getAllPrisons(): Promise<Prison[]> {
    const prisons = await this.visitSchedulerApiClient.getAllPrisons()
    const prisonNames = await this.getPrisonNames()

    const allPrisonsWithNames: Prison[] = prisons.map(prison => {
      return { ...prison, name: prisonNames[prison.code] }
    })

    allPrisonsWithNames.sort((a, b) => a.name.localeCompare(b.name))

    return allPrisonsWithNames
  }

  async getPrisonContactDetails(prisonCode: string): Promise<PrisonContactDetails | null> {
    return this.prisonRegisterApiClient.getPrisonContactDetails(prisonCode)
  }

  async createPrisonContactDetails(
    prisonCode: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails | null> {
    return this.prisonRegisterApiClient.createPrisonContactDetails(
      prisonCode,
      this.contactDetailsEmptyToNull(prisonContactDetails),
    )
  }

  async deletePrisonContactDetails(prisonCode: string): Promise<void> {
    return this.prisonRegisterApiClient.deletePrisonContactDetails(prisonCode)
  }

  async updatePrisonContactDetails(
    prisonCode: string,
    contactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails | null> {
    return this.prisonRegisterApiClient.updatePrisonContactDetails(
      prisonCode,
      this.contactDetailsEmptyToNull(contactDetails),
    )
  }

  async createPrison(username: string, prisonCode: string): Promise<void> {
    const prison: PrisonDto = {
      active: false,
      adultAgeYears: 18,
      clients: [{ active: true, userType: 'STAFF' }],
      code: prisonCode,
      maxAdultVisitors: 3,
      maxChildVisitors: 3,
      maxTotalVisitors: 6,
      policyNoticeDaysMin: 2,
      policyNoticeDaysMax: 28,
    }

    logger.info(`Prison ${prisonCode} created by ${username}`)
    await this.visitSchedulerApiClient.createPrison(prison)
  }

  async updatePrison(username: string, prisonCode: string, updatePrison: UpdatePrisonDto): Promise<PrisonDto> {
    logger.info(`Prison updated ${prisonCode} by ${username}`)
    return this.visitSchedulerApiClient.updatePrison(prisonCode, updatePrison)
  }

  async activatePrison(username: string, prisonCode: string): Promise<PrisonDto> {
    logger.info(`Prison ${prisonCode} activated by ${username}`)
    return this.visitSchedulerApiClient.activatePrison(prisonCode)
  }

  async deactivatePrison(username: string, prisonCode: string): Promise<PrisonDto> {
    logger.info(`Prison ${prisonCode} deactivated by ${username}`)
    return this.visitSchedulerApiClient.deactivatePrison(prisonCode)
  }

  async activatePrisonClientType(username: string, prisonCode: string, type: UserClientType): Promise<UserClientDto> {
    logger.info(`Prison client type ${type} activated for ${prisonCode} by ${username}`)
    return this.visitSchedulerApiClient.activatePrisonClientType(prisonCode, type)
  }

  async deactivatePrisonClientType(username: string, prisonCode: string, type: UserClientType): Promise<UserClientDto> {
    logger.info(`Prison client type ${type} deactivated for ${prisonCode} by ${username}`)
    return this.visitSchedulerApiClient.deactivatePrisonClientType(prisonCode, type)
  }

  async getPrisonName(prisonId: string): Promise<string> {
    await this.refreshPrisonNames()
    const prisonName = this.prisonNames[prisonId]

    if (!prisonName) throw new NotFound(`Prison ID '${prisonId}' not found`)

    return prisonName
  }

  async getPrisonNames(): Promise<Record<string, string>> {
    await this.refreshPrisonNames()

    return this.prisonNames
  }

  private async refreshPrisonNames(): Promise<void> {
    if (this.lastUpdated <= Date.now() - A_DAY_IN_MS) {
      const prisonNamesArray = await this.prisonRegisterApiClient.getPrisonNames()

      this.prisonNames = {}
      prisonNamesArray.forEach(prison => {
        this.prisonNames[prison.prisonId] = prison.prisonName
      })

      this.lastUpdated = Date.now()
    }
  }

  private contactDetailsEmptyToNull(contactDetails: PrisonContactDetails): PrisonContactDetails {
    return {
      type: contactDetails.type,
      emailAddress: contactDetails.emailAddress || null,
      phoneNumber: contactDetails.phoneNumber || null,
      webAddress: contactDetails.webAddress || null,
    }
  }
}
