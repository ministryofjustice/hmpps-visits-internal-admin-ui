import { NotFound } from 'http-errors'
import { HmppsAuthClient, PrisonRegisterApiClient, RestClientBuilder, VisitSchedulerApiClient } from '../data'
import { Prison } from '../data/visitSchedulerApiTypes'
import logger from '../../logger'

const A_DAY_IN_MS = 24 * 60 * 60 * 1000

export default class PrisonService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly prisonRegisterApiClientFactory: RestClientBuilder<PrisonRegisterApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  // store all prisons in object by prisonId, e.g. { HEI: 'Hewell (HMP), ... }
  private allPrisonRegisterPrisons: Record<string, string>

  private lastUpdated = 0

  async getAllPrisons(username: string): Promise<Prison[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getAllPrisons()
  }

  async createPrison(prisonCode: string, username: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const prison = <Prison>{
      active: false,
      code: prisonCode,
      excludeDates: [],
    }

    logger.info(`Adding prison ${prisonCode} to list of supported prisons`)
    try {
      await visitSchedulerApiClient.createPrison(prison)
    } catch (error) {
      logger.error(`Couldn't add prison ${prisonCode} to list of supported prisons`, error)
    }
  }

  async getPrisonName(username: string, prisonId: string): Promise<string> {
    await this.refreshAllPrisons(username)
    const prisonName = this.allPrisonRegisterPrisons[prisonId]

    if (!prisonName) throw new NotFound(`Prison ID '${prisonId}' not found`)

    return prisonName
  }

  async getPrisonNames(username: string): Promise<Record<string, string>> {
    await this.refreshAllPrisons(username)

    return this.allPrisonRegisterPrisons
  }

  private async refreshAllPrisons(username: string): Promise<void> {
    if (this.lastUpdated <= Date.now() - A_DAY_IN_MS) {
      const token = await this.hmppsAuthClient.getSystemClientToken(username)
      const prisonRegisterApiClient = this.prisonRegisterApiClientFactory(token)

      const allPrisonsFullDetails = await prisonRegisterApiClient.getPrisons()
      this.allPrisonRegisterPrisons = {}

      allPrisonsFullDetails.forEach(prison => {
        this.allPrisonRegisterPrisons[prison.prisonId] = prison.prisonName
      })
      this.lastUpdated = Date.now()
    }
  }
}