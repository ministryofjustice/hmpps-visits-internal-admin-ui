import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'

export default class VisitService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getVisitCountByDate(username: string, prisonId: string, date: string): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const visits = await visitSchedulerApiClient.getBookedVisitsByDate(prisonId, date)

    return visits.totalElements ?? 0
  }
}
