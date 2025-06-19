import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { getTime, isValid, parse, parseISO } from 'date-fns'
import {
  PrisonService,
  SessionTemplateService,
  IncentiveGroupService,
  CategoryGroupService,
  LocationGroupService,
} from '../../../services'
import { UpdateSessionTemplateDto } from '../../../data/visitSchedulerApiTypes'
import { getPublicClientStatus, responseErrorToFlashMessages } from '../../../utils/utils'

export default class EditSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
    private readonly incentiveGroupService: IncentiveGroupService,
    private readonly categoryGroupService: CategoryGroupService,
    private readonly locationGroupService: LocationGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      const prisonPromise = this.prisonService.getPrison(res.locals.user.username, prisonId)
      const incentivePromise = this.incentiveGroupService.getIncentiveGroups(res.locals.user.username, prisonId)
      const categoryPromise = this.categoryGroupService.getCategoryGroups(res.locals.user.username, prisonId)
      const locationPromise = this.locationGroupService.getLocationGroups(res.locals.user.username, prisonId)
      const sessionTemplatePromise = this.sessionTemplateService.getSingleSessionTemplate(
        res.locals.user.username,
        reference,
      )

      const [prison, incentiveGroups, categoryGroups, locationGroups, sessionTemplate] = await Promise.all([
        prisonPromise,
        incentivePromise,
        categoryPromise,
        locationPromise,
        sessionTemplatePromise,
      ])

      const hideInPublicServices = getPublicClientStatus(sessionTemplate)

      const validFromDateSplit = sessionTemplate.sessionDateRange.validFromDate.split('-')
      const validFromDateYear = validFromDateSplit[0]
      const validFromDateMonth = validFromDateSplit[1]
      const validFromDateDay = validFromDateSplit[2]

      const validToDateSplit = (sessionTemplate.sessionDateRange?.validToDate ?? '---').split('-')
      const validToDateYear = validToDateSplit[0] || undefined
      const validToDateMonth = validToDateSplit[1] || undefined
      const validToDateDay = validToDateSplit[2] || undefined

      const { prisonerCategoryGroups, prisonerIncentiveLevelGroups, permittedLocationGroups } = sessionTemplate

      const categoryGroupReferences = prisonerCategoryGroups?.map(categoryGroup => categoryGroup.reference) ?? []
      const incentiveGroupReferences =
        prisonerIncentiveLevelGroups?.map(incentiveGroup => incentiveGroup.reference) ?? []
      const locationGroupReferences = permittedLocationGroups?.map(locationGroup => locationGroup.reference) ?? []

      const formValues = {
        name: sessionTemplate.name,
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
        incentiveGroupBehaviour: sessionTemplate.includeIncentiveGroupType ? 'include' : 'exclude',
        incentiveGroupReferences,
        hasCategoryGroups: categoryGroupReferences.length > 0 ? 'yes' : undefined,
        categoryGroupBehaviour: sessionTemplate.includeCategoryGroupType ? 'include' : 'exclude',
        categoryGroupReferences,
        hasLocationGroups: locationGroupReferences.length > 0 ? 'yes' : undefined,
        locationGroupBehaviour: sessionTemplate.includeLocationGroupType ? 'include' : 'exclude',
        locationGroupReferences,
        hideInPublicServices,
      }

      const visitStats = await this.sessionTemplateService.getTemplateStats(res.locals.user.username, reference)

      const visitDates = Object.keys(visitStats.dates)
      const firstDate = visitDates.at(0) ?? ''
      const lastDate = visitDates.at(-1) ?? ''

      req.flash('formValues', formValues)
      return res.render('pages/prisons/sessionTemplates/editSingleSessionTemplate', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        formValues,
        prison,
        reference,
        visitStats,
        firstDate,
        lastDate,
        categoryGroups,
        incentiveGroups,
        locationGroups,
      })
    }
  }

  public update(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      const originalUrl = `/prisons/${prisonId}/session-templates/${reference}/edit`

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

      const updateSessionTemplateDto: UpdateSessionTemplateDto = {
        name: req.body.name,
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
        visitRoom: req.body.visitRoom,
        includeCategoryGroupType: req.body.categoryGroupBehaviour !== 'exclude',
        categoryGroupReferences: req.body.hasCategoryGroups === 'yes' ? req.body.categoryGroupReferences : [],
        includeIncentiveGroupType: req.body.incentiveGroupBehaviour !== 'exclude',
        incentiveLevelGroupReferences: req.body.hasIncentiveGroups === 'yes' ? req.body.incentiveGroupReferences : [],
        includeLocationGroupType: req.body.locationGroupBehaviour !== 'exclude',
        locationGroupReferences: req.body.hasLocationGroups === 'yes' ? req.body.locationGroupReferences : [],
        clients: [
          { active: true, userType: 'STAFF' },
          { active: req.body.hideInPublicServices !== 'yes', userType: 'PUBLIC' },
        ],
      }

      try {
        const { name } = await this.sessionTemplateService.updateSessionTemplate(
          res.locals.user.username,
          reference,
          updateSessionTemplateDto,
        )
        req.flash('messages', {
          variant: 'success',
          title: 'Session template updated',
          text: `Session template '${name}' has been updated`,
        })
        return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3 }).withMessage('Enter a name over 3 characters long'),
      body('endTime').custom((_value, { req }) => {
        const startTime = getTime(parseISO(`2000-01-01T${req.body.startTime}`))
        const endTime = getTime(parseISO(`2000-01-01T${req.body.endTime}`))
        if (startTime >= endTime) {
          throw new Error('Enter an end time after the start time')
        }
        return true
      }),
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
        if (openCapacity <= 0 && closedCapacity <= 0) {
          throw new Error('Enter a capacity for either open or closed')
        }
        return true
      }),
      body('visitRoom').trim().isLength({ min: 3 }).withMessage('Enter a name over 3 characters long'),
      body('incentiveGroupReferences', 'You must select at least one incentive group')
        .toArray()
        .if(body('hasIncentiveGroups').equals('yes'))
        .isArray({ min: 1 }),
      body('categoryGroupReferences', 'You must select at least one category group')
        .toArray()
        .if(body('hasCategoryGroups').equals('yes'))
        .isArray({ min: 1 }),
      body('locationGroupReferences', 'You must select at least one location group')
        .toArray()
        .if(body('hasLocationGroups').equals('yes'))
        .isArray({ min: 1 }),
    ]
  }
}
