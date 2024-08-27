import { format, parseISO } from 'date-fns'
import { SanitisedError } from '../sanitisedError'
import { FlashErrorMessage } from '../@types/visits-admin'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const formatDate = (dateToFormat: string, dateFormat = 'd MMMM yyyy'): string | null => {
  if (typeof dateFormat !== 'string') return null
  try {
    return dateToFormat ? format(parseISO(dateToFormat), dateFormat) : null
  } catch {
    return null
  }
}

export const responseErrorToFlashMessage = (error: SanitisedError): FlashErrorMessage => {
  const flashError = [{ msg: `${error.status} ${error.message}` }]

  if (
    typeof error.data === 'object' &&
    'developerMessage' in error.data &&
    typeof error.data.developerMessage === 'string'
  ) {
    flashError.push({ msg: error.data.developerMessage })
  } else if (
    // error.data.validationMessages is an object instead of a string - so deal with it differently
    typeof error.data === 'object' &&
    'validationMessages' in error.data &&
    typeof error.data.validationMessages === 'object'
  ) {
    const messagesArray = Object.values(error.data.validationMessages)
    messagesArray.forEach(message => {
      flashError.push({ msg: message })
    })
  }

  return flashError
}
