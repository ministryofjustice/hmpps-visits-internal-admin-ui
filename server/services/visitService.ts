import { VisitSchedulerApiClient } from '../data'

export default class VisitService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getVisitCountByDate(prisonId: string, date: string): Promise<number> {
    const visits = await this.visitSchedulerApiClient.getBookedVisitsByDate(prisonId, date)

    return visits.totalElements ?? 0
  }
}
