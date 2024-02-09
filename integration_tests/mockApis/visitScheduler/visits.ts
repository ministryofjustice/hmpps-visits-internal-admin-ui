import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import { PageVisitDto } from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubGetBookedVisitsByDate: ({
    prisonCode,
    date,
    visits,
  }: {
    prisonCode: string
    date: string
    visits: PageVisitDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: '/visitScheduler/visits/search',
        queryParameters: {
          prisonId: { equalTo: prisonCode },
          visitStartDate: { equalTo: date },
          visitEndDate: { equalTo: date },
          visitStatus: { equalTo: 'BOOKED' },
          page: { equalTo: '0' },
          size: { equalTo: '1000' },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: visits,
      },
    })
  },
}
