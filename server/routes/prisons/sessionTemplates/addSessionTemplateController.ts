import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService, SessionTemplateService } from '../../../services'
import { CreateSessionTemplateDto } from '../../../data/visitSchedulerApiTypes'

export default class AddSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public view(): RequestHandler {
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

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/session-templates/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

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
        req.flash('errors', [{ msg: `${error.status} ${error.message}` }])
        return res.redirect(originalUrl)
      }

      return res.redirect(`/prisons/${prisonId}/session-templates`)
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Enter a name between 3 and 100 characters long'),
      body('weeklyFrequency')
        .trim()
        .isInt({ min: 1, max: 12 })
        .withMessage('Enter a weekly frequency value between 1 and 12'),
    ]
  }
}
