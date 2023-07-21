import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { getTime, isValid, parse, parseISO } from 'date-fns'
import { PrisonService, SessionTemplateService, IncentiveGroupService } from '../../../services'
import { CreateSessionTemplateDto } from '../../../data/visitSchedulerApiTypes'
import daysOfWeek from '../../../constants/daysOfWeek'
import logger from '../../../../logger'

export default class AddSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const incentiveGroups = await this.incentiveGroupService.getIncentiveGroups(res.locals.user.username, prisonId)

      const formValues = req.flash('formValues')?.[0] || {}

      res.render('pages/prisons/sessionTemplates/addSessionTemplate', {
        errors: req.flash('errors'),
        prison,
        incentiveGroups,
        daysOfWeek,
        formValues,
      })
    }
  }

  public populateNewFromExisting(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      const sessionTemplate = await this.sessionTemplateService.getSingleSessionTemplate(
        res.locals.user.username,
        reference,
      )

      const validFromDateSplit = sessionTemplate.sessionDateRange.validFromDate.split('-')
      const validFromDateYear = validFromDateSplit[0]
      const validFromDateMonth = validFromDateSplit[1]
      const validFromDateDay = validFromDateSplit[2]

      const validToDateSplit = (sessionTemplate.sessionDateRange?.validToDate ?? '---').split('-')
      const validToDateYear = validToDateSplit[0] || undefined
      const validToDateMonth = validToDateSplit[1] || undefined
      const validToDateDay = validToDateSplit[2] || undefined

      let incentiveGroupReferences: string[] = []
      const incentiveGroups = sessionTemplate.prisonerIncentiveLevelGroups
      if (incentiveGroups !== undefined && incentiveGroups.length > 0) {
        incentiveGroupReferences = incentiveGroups.map(incentiveGroup => incentiveGroup.reference)
      }

      logger.debug(` group refs : ${JSON.stringify(incentiveGroupReferences)} ${JSON.stringify(incentiveGroups)}`)
      const formValues = {
        name: `COPY - ${sessionTemplate.name}`,
        dayOfWeek: sessionTemplate.dayOfWeek,
        startTime: sessionTemplate.sessionTimeSlot.startTime,
        endTime: sessionTemplate.sessionTimeSlot.endTime,
        weeklyFrequency: sessionTemplate.weeklyFrequency.toString(),
        validFromDateDay,
        validFromDateMonth,
        validFromDateYear,
        hasEndDate: sessionTemplate.sessionDateRange.validToDate ? 'yes' : undefined,
        validToDateDay,
        validToDateMonth,
        validToDateYear,
        openCapacity: sessionTemplate.sessionCapacity.open.toString(),
        closedCapacity: sessionTemplate.sessionCapacity.closed.toString(),
        visitRoom: sessionTemplate.visitRoom,
        hasIncentiveGroups: incentiveGroupReferences.length > 0 ? 'yes' : undefined,
        incentiveGroupReferences,
      }

      req.flash('formValues', formValues)
      return res.redirect(`/prisons/${prisonId}/session-templates/add`)
    }
  }

  public add(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/session-templates/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const validFromDateDay = req.body.validFromDateDay.padStart(2, '0')
      const validFromDateMonth = req.body.validFromDateMonth.padStart(2, '0')
      const validToDateDay = req.body.validToDateDay.padStart(2, '0')
      const validToDateMonth = req.body.validToDateMonth.padStart(2, '0')

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
          validFromDate: `${req.body.validFromDateYear}-${validFromDateMonth}-${validFromDateDay}`,
          validToDate:
            req.body.hasEndDate === 'yes'
              ? `${req.body.validToDateYear}-${validToDateMonth}-${validToDateDay}`
              : undefined,
        },
        sessionTimeSlot: {
          startTime: req.body.startTime,
          endTime: req.body.endTime,
        },
        visitRoom: req.body.visitRoom,
        categoryGroupReferences: [],
        incentiveLevelGroupReferences: req.body.hasIncentiveGroups === 'yes' ? req.body.incentiveGroupReferences : [],
        locationGroupReferences: [],
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
        .toInt()
        .isInt({ min: 1, max: 12 })
        .withMessage('Enter a weekly frequency value between 1 and 12'),
      body('validFromDateDay').trim().isInt({ min: 1, max: 31 }).withMessage('Enter a valid day'),
      body('validFromDateMonth').trim().isInt({ min: 1, max: 12 }).withMessage('Enter a valid month'),
      body('validFromDateYear')
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage('Enter the year for template start date as 4 digits, e.g. 2023'),
      body('validToDateDay')
        .optional({ checkFalsy: true })
        .trim()
        .isInt({ min: 1, max: 31 })
        .withMessage('Enter a valid day'),
      body('validToDateMonth')
        .optional({ checkFalsy: true })
        .trim()
        .isInt({ min: 1, max: 12 })
        .withMessage('Enter a valid month'),
      body('validToDateYear')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage('Enter the year for template end date as 4 digits, e.g. 2023'),
      body('validFromDate').custom((_value, { req }) => {
        const theDate = `${req.body.validFromDateYear}-${req.body.validFromDateMonth}-${req.body.validFromDateDay}`

        const validDate = isValid(parse(theDate, 'yyyy-MM-dd', new Date()))
        if (!validDate) {
          throw new Error('Enter a valid date for template start date')
        }
        return true
      }),
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
      body(['openCapacity', 'closedCapacity']).trim().toInt().isInt().withMessage('Enter a number'),
      body(['openCapacity', 'closedCapacity']).custom((_value, { req }) => {
        const { openCapacity, closedCapacity } = req.body
        if (openCapacity === 0 && closedCapacity === 0) {
          throw new Error('Enter a capacity for either open or closed')
        }
        return true
      }),
      body('visitRoom').trim().isLength({ min: 3 }).withMessage('Enter a name over 3 characters long'),
      body('incentiveGroupReferences', 'You must select at least one incentive group')
        .toArray()
        .if(body('hasIncentiveGroups').equals('yes'))
        .isArray({ min: 1 }),
    ]
  }
}
