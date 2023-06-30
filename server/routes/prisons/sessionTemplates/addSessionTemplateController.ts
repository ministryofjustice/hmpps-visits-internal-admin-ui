import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { getTime, isValid, parse, parseISO } from 'date-fns'
import { PrisonService, SessionTemplateService } from '../../../services'
import { CreateSessionTemplateDto } from '../../../data/visitSchedulerApiTypes'
import daysOfWeek from '../../../constants/daysOfWeek'

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
        prisonId,
        prisonName,
        daysOfWeek,
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
          validToDate:
            req.body.hasEndDate === 'yes'
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
        const { reference } = await this.sessionTemplateService.createSessionTemplate(
          res.locals.user.username,
          createSessionTemplateDto,
        )
        req.flash('message', `Session template '${reference}' has been created`)
        return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
      } catch (error) {
        req.flash('errors', [{ msg: `${error.status} ${error.message}` }])
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Enter a name between 3 and 100 characters long'),
      body('dayOfWeek').isIn(daysOfWeek).withMessage('Select a day of the week'),
      body('startTime').trim().isTime({ hourFormat: 'hour24' }).withMessage('Enter a valid time'),
      body('endTime').trim().isTime({ hourFormat: 'hour24' }).withMessage('Enter a valid time'),
      body('endTime').custom((_value, { req }) => {
        const startTime = getTime(parseISO(`2000-01-01T${req.body.startTime}`))
        const endTime = getTime(parseISO(`2000-01-01T${req.body.endTime}`))
        if (startTime >= endTime) {
          throw new Error('Enter an end time after the start time')
        }
        return true
      }),
      body('weeklyFrequency')
        .trim()
        .isInt({ min: 1, max: 12 })
        .withMessage('Enter a weekly frequency value between 1 and 12'),
      body(['validFromDateDay', 'validFromDateMonth', 'validFromDateYear'])
        .trim()
        .isInt({ min: 1 })
        .withMessage('Enter the date in number format for template start date'),
      body('validFromDate').custom((_value, { req }) => {
        const theDate = `${req.body.validFromDateYear}-${req.body.validFromDateMonth}-${req.body.validFromDateDay}`

        const validDate = isValid(parse(theDate, 'yyyy-MM-dd', new Date()))
        if (!validDate) {
          throw new Error('Enter a valid date for template start date')
        }
        return true
      }),
      // body(['validToDateDay', 'validToDateMonth', 'validToDateYear'])
      //   .optional({ values: 'null' })
      //   .trim()
      //   .isInt({ min: 1 })
      //   .withMessage('Enter the date in number format for template end date'),
      body('hasEndDate')
        .optional()
        .isIn(['yes'])
        .custom((_value, { req }) => {
          const endDate = `${req.body.validToDateYear}-${req.body.validToDateMonth}-${req.body.validToDateDay}`

          const validDate = isValid(parse(endDate, 'yyyy-MM-dd', new Date()))
          if (!validDate) {
            throw new Error('Enter a valid date for template end date')
          }
          return true
        })
        .custom((_value, { req }) => {
          const startDate = `${req.body.validToDateYear}-${req.body.validToDateMonth}-${req.body.validToDateDay}`
          const endDate = `${req.body.validFromDateYear}-${req.body.validFromDateMonth}-${req.body.validFromDateDay}`

          const startDateObject = parse(startDate, 'yyyy-MM-dd', new Date())
          const endDateObject = parse(endDate, 'yyyy-MM-dd', new Date())

          if (endDateObject > startDateObject) {
            throw new Error('Enter an end date after the start date')
          }
          return true
        }),
      body('openCapacity').trim().isInt().withMessage('Enter a number'),
      body(['openCapacity', 'closedCapacity'])
        .trim()
        .custom((_value, { req }) => {
          const { openCapacity, closedCapacity } = req.body
          if (openCapacity === '0' && closedCapacity === '0') {
            throw new Error('Enter a capacity for either open or closed')
          }
          return true
        }),
      body('closedCapacity').trim().isInt().withMessage('Enter a number'),
      body('visitRoom').trim().isLength({ min: 3 }).withMessage('Enter a name over 3 characters long'),
    ]
  }
}
