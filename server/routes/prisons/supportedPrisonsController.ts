import { RequestHandler } from 'express'
import { body, validationResult } from 'express-validator'
import { PrisonService } from '../../services'
import { responseErrorToFlashMessages } from '../../utils/utils'
import { PRISON_CODE_REGEX } from '../../constants/constants'

export default class SupportedPrisonsController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const prisons = await this.prisonService.getAllPrisons(res.locals.user.username)

      return res.render('pages/prisons/prisons', {
        errors: req.flash('errors'),
        prisons,
        messages: req.flash('messages'),
      })
    }
  }

  public addPrison(): RequestHandler {
    return async (req, res) => {
      let newPrisonName: string

      await body('prisonId')
        .trim()
        .toUpperCase()
        .matches(PRISON_CODE_REGEX)
        .withMessage('Enter a three letter prison code')
        .bail()
        .custom(async prisonId => {
          try {
            newPrisonName = await this.prisonService.getPrisonName(res.locals.user.username, prisonId)
          } catch {
            throw new Error(`Prison '${prisonId}' is not in the prison register`)
          }
          return true
        })
        .run(req)

      const { prisonId } = req.body

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        return res.redirect(`/prisons`)
      }

      try {
        await this.prisonService.createPrison(res.locals.user.username, prisonId)
        req.flash('messages', {
          variant: 'success',
          title: 'Prison added',
          text: `${newPrisonName} has been successfully added`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(`/prisons`)
    }
  }
}
