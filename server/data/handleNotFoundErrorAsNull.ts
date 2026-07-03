import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'

const handleNotFoundErrorAsNull = <ErrorData>(_path: string, _verb: string, error: SanitisedError<ErrorData>): null => {
  if (error.responseStatus === 404) {
    return null
  }
  throw error
}

export default handleNotFoundErrorAsNull
