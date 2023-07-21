import { FlashErrorMessage } from '../visits-admin'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      flash(type: 'errors', message: FlashErrorMessage): number
      flash(type: 'formValues', message: Record<string, string | string[]>): number
      logout(done: (err: unknown) => void): void
    }
  }
}
