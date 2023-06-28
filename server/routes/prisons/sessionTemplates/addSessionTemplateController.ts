import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'
import { CreateSessionTemplateDto } from '../../../data/visitSchedulerApiTypes'

export default class AddSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public add(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const formValues = req.flash('formValues')?.[0] || {}

      res.render('pages/prisons/addSessionTemplate', {
        errors: req.flash('errors'),
        message: req.flash('message'),
        prisonId,
        prisonName,
        formValues,
      })
    }
  }

  public create(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const createSessionTemplateDto: CreateSessionTemplateDto = {
        name: req.body.name,
        weeklyFrequency: req.body.weeklyFrequency,
        dayOfWeek: req.body.dayOfWeek,
        prisonId,
        sessionCapacity: {
          open: req.body.openCapacity,
          closed: req.body.closedCapacity,
        },
        sessionDateRange: {
          validFromDate: `${req.body.validFromDateYear}-${req.body.validFromDateMonth}-${req.body.validFromDateDay}`,
          validToDate: req.body.hasEndDate
            ? `${req.body.validToDateYear}-${req.body.validToDateMonth}-${req.body.validToDateDay}`
            : undefined,
        },
        sessionTimeSlot: {
          startTime: req.body.startTime,
          endTime: req.body.endTime,
        },
        visitRoom: req.body.visitRoom,
      }

      try {
        await this.sessionTemplateService.createSessionTemplate(res.locals.user.username, createSessionTemplateDto)
        // req.flash('message', sessionTemplate)
      } catch (error) {
        req.flash('formValues', req.body)
        req.flash('errors', [{ msg: `${error.status} ${error.message}` }])
        return res.redirect(`/prisons/${prisonId}/session-templates/add`)
      }

      return res.redirect(`/prisons/${prisonId}/session-templates`)
    }
  }
}
