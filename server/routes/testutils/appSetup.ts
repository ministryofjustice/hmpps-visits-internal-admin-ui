import express, { Express } from 'express'
import { NotFound } from 'http-errors'
import { Session, SessionData } from 'express-session'
import { ValidationError } from 'express-validator'
import type { ApplicationInfo } from '../../applicationInfo'

import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import { FlashErrorMessage, FlashFormValues, MoJAlert } from '../../@types/visits-admin'
import type { HmppsUser } from '../../interfaces/hmppsUser'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  productId: 'UNASSIGNED',
  branchName: 'main',
}

export const user: HmppsUser = {
  name: 'FIRST LAST',
  userId: 'id',
  staffId: undefined,
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  activeCaseLoadId: 'MDI',
  authSource: 'nomis',
  userRoles: [],
}

export type FlashData = {
  errors?: ValidationError[] | FlashErrorMessage[]
  formValues?: FlashFormValues[]
  messages?: MoJAlert[]
}

export const flashProvider = jest.fn()

function appSetup(
  services: Services,
  production: boolean,
  userSupplier: () => HmppsUser,
  sessionData: SessionData,
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, testAppInfo)
  app.use((req, res, next) => {
    req.session = sessionData as Session & Partial<SessionData>
    req.user = userSupplier() as unknown as Express.User
    req.flash = flashProvider
    res.locals = {
      user: userSupplier(),
      cspNonce: 'test-nonce',
      csrfToken: 'test-csrf-token',
    }
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((req, res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => user,
  sessionData = {} as SessionData,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
  sessionData?: SessionData
}): Express {
  return appSetup(services as Services, production, userSupplier, sessionData)
}
