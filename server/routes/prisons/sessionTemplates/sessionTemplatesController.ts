import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'
import { SessionTemplate, SessionTemplatesRangeType } from '../../../data/visitSchedulerApiTypes'
import sessionTemplatesFilterRanges from '../../../constants/sessionTemplatesFilterRanges'

export default class SessionTemplatesController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const defaultRange: SessionTemplatesRangeType = 'ACTIVE_OR_FUTURE'
      const selectedRange = this.isSessionTemplateRangeType(req.query?.rangeType) ? req.query.rangeType : defaultRange

      const { prison, prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const sessionTemplates = await this.sessionTemplateService.getSessionTemplates(
        res.locals.username,
        prisonId,
        selectedRange,
      )

      const sessionTemplatesByDay: Record<SessionTemplate['dayOfWeek'], SessionTemplate[]> = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
      }
      sessionTemplates.forEach(template => sessionTemplatesByDay[template.dayOfWeek].push(template))

      return res.render('pages/prisons/viewSessionTemplates', {
        prison,
        prisonName,
        sessionTemplatesByDay,
        selectedRange,
        sessionTemplatesFilterRanges,
      })
    }
  }

  private isSessionTemplateRangeType(rangeType: unknown): rangeType is SessionTemplatesRangeType {
    return typeof rangeType === 'string' && rangeType in sessionTemplatesFilterRanges
  }
}
