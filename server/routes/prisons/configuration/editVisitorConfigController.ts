import { RequestHandler } from 'express'
import { validationResult, ValidationChain, body } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class EditVisitorConfigController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const formValues = {
        maxTotalVisitors: prison.maxTotalVisitors.toString(),
        maxAdultVisitors: prison.maxAdultVisitors.toString(),
        maxChildVisitors: prison.maxChildVisitors.toString(),
        adultAgeYears: prison.adultAgeYears.toString(),
        ...req.flash('formValues')?.[0],
      }

      return res.render('pages/prisons/configuration/editVisitorConfig', {
        errors: req.flash('errors'),
        prison,
        formValues,
        message: req.flash('message'),
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration/visitors/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const {
        maxTotalVisitors,
        maxAdultVisitors,
        maxChildVisitors,
        adultAgeYears,
      }: { maxTotalVisitors: number; maxAdultVisitors: number; maxChildVisitors: number; adultAgeYears: number } =
        req.body

      try {
        await this.prisonService.updatePrison(res.locals.user.username, prisonId, {
          maxTotalVisitors,
          maxAdultVisitors,
          maxChildVisitors,
          adultAgeYears,
        })
        req.flash('message', 'Visitor configuration updated')

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('maxTotalVisitors').trim().toInt().isInt({ min: 1 }).withMessage('Enter a value of at least 1'),
      body('maxAdultVisitors').trim().toInt().isInt({ min: 1 }).withMessage('Enter a value of at least 1'),
      body('maxChildVisitors').trim().toInt().isInt({ min: 0 }).withMessage('Enter a value of at least 0'),
      body('adultAgeYears').trim().toInt().isInt({ min: 0, max: 18 }).withMessage('Enter a value between 0 and 18'),
      body(['maxAdultVisitors', 'maxChildVisitors'])
        .custom((value, { req }) => {
          return value <= req.body.maxTotalVisitors
        })
        .withMessage('Cannot be greater than the maximum total of visitors'),
    ]
  }
}
