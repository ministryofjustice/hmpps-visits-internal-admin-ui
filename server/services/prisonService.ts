import { NotFound } from 'http-errors'
import { HmppsAuthClient, PrisonRegisterApiClient, RestClientBuilder, VisitSchedulerApiClient } from '../data'
import { PrisonDto } from '../data/visitSchedulerApiTypes'
import logger from '../../logger'
import { Prison } from '../@types/visits-admin'
import { PrisonContactDetails } from '../data/prisonRegisterApiTypes'

const A_DAY_IN_MS = 24 * 60 * 60 * 1000

export default class PrisonService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly prisonRegisterApiClientFactory: RestClientBuilder<PrisonRegisterApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  // store all prison names in an object by prisonId, e.g. { HEI: 'Hewell (HMP), ... }
  private prisonNames: Record<string, string>

  private lastUpdated = 0

  async getPrison(username: string, prisonId: string): Promise<Prison> {
    await this.refreshPrisonNames(username)
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const prisonDto = await visitSchedulerApiClient.getPrison(prisonId)
    const name = this.prisonNames[prisonId] || 'UNKNOWN'

    return { ...prisonDto, name }
  }

  async getAllPrisons(username: string): Promise<Prison[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const prisons = await visitSchedulerApiClient.getAllPrisons()
    const prisonNames = await this.getPrisonNames(username)

    const allPrisonsWithNames: Prison[] = prisons.map(prison => {
      return { ...prison, name: prisonNames[prison.code] }
    })

    allPrisonsWithNames.sort((a, b) => a.name.localeCompare(b.name))

    return allPrisonsWithNames
  }

  async getPrisonContactDetails(username: string, prisonCode: string): Promise<PrisonContactDetails | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

    return prisonRegisterApiClient.getPrisonContactDetails(prisonCode)
  }

  async createPrisonContactDetails(
    username: string,
    prisonCode: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

    return prisonRegisterApiClient.createPrisonContactDetails(
      prisonCode,
      this.contactDetailsEmptyToNull(prisonContactDetails),
    )
  }

  async deletePrisonContactDetails(username: string, prisonCode: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

    return prisonRegisterApiClient.deletePrisonContactDetails(prisonCode)
  }

  async updatePrisonContactDetails(
    username: string,
    prisonCode: string,
    contactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

    return prisonRegisterApiClient.updatePrisonContactDetails(
      prisonCode,
      this.contactDetailsEmptyToNull(contactDetails),
    )
  }

  async createPrison(username: string, prisonCode: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const prison: PrisonDto = {
      active: false,
      code: prisonCode,
      excludeDates: [],
    }

    logger.info(`Prison ${prisonCode} created by ${username}`)
    await visitSchedulerApiClient.createPrison(prison)
  }

  async activatePrison(username: string, prisonCode: string): Promise<PrisonDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Prison ${prisonCode} activated by ${username}`)
    return visitSchedulerApiClient.activatePrison(prisonCode)
  }

  async deactivatePrison(username: string, prisonCode: string): Promise<PrisonDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Prison ${prisonCode} deactivated by ${username}`)
    return visitSchedulerApiClient.deactivatePrison(prisonCode)
  }

  async addExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<PrisonDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Exclude date ${excludeDate} added to prison ${prisonCode} by ${username}`)
    return visitSchedulerApiClient.addExcludeDate(prisonCode, excludeDate)
  }

  async removeExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Exclude date ${excludeDate} removed from prison ${prisonCode} by ${username}`)
    await visitSchedulerApiClient.removeExcludeDate(prisonCode, excludeDate)
  }

  async getPrisonName(username: string, prisonId: string): Promise<string> {
    await this.refreshPrisonNames(username)
    const prisonName = this.prisonNames[prisonId]

    if (!prisonName) throw new NotFound(`Prison ID '${prisonId}' not found`)

    return prisonName
  }

  private async getPrisonNames(username: string): Promise<Record<string, string>> {
    await this.refreshPrisonNames(username)

    return this.prisonNames
  }

  private async refreshPrisonNames(username: string): Promise<void> {
    if (this.lastUpdated <= Date.now() - A_DAY_IN_MS) {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

      const prisonNamesArray = await prisonRegisterApiClient.getPrisonNames()

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
