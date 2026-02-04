import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'
import { SessionTemplate, SessionTemplatesRangeType } from '../../../data/visitSchedulerApiTypes'
import sessionTemplatesFilterRanges from '../../../constants/sessionTemplatesFilterRanges'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class SessionTemplatesController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const defaultRange: SessionTemplatesRangeType = 'CURRENT_OR_FUTURE'
      const selectedRange = this.isSessionTemplateRangeType(req.query?.rangeType) ? req.query.rangeType : defaultRange

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

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

      return res.render('pages/prisons/sessionTemplates/viewSessionTemplates', {
        prison,
        sessionTemplatesByDay,
        selectedRange,
        sessionTemplatesFilterRanges,
        messages: req.flash('messages'),
      })
    }
  }

  private isSessionTemplateRangeType(rangeType: unknown): rangeType is SessionTemplatesRangeType {
    return typeof rangeType === 'string' && rangeType in sessionTemplatesFilterRanges
  }
}
