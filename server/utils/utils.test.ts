import { SessionTemplate } from '../data/visitSchedulerApiTypes'
import TestData from '../routes/testutils/testData'
import { SanitisedError } from '../sanitisedError'
import {
  convertToTitleCase,
  formatDate,
  getPublicClientStatus,
  initialiseName,
  responseErrorToFlashMessages,
} from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('format a date', () => {
  it.each([
    ['Default format (date/time input)', '2022-02-14T10:00:00', undefined, '14 February 2022'],
    ['Default format (short date input)', '2022-02-14', undefined, '14 February 2022'],
    ['Custom format', '2022-02-14T10:00:00', 'yy MMM d', '22 Feb 14'],
    ['Invalid date', 'not a date', undefined, null],
    ['Invalid format', '2022-02-14T10:00:00', '', null],
  ])('%s formatDate(%s, %s) = %s', (_: string, date: string, format: string, expected: string) => {
    expect(formatDate(date, format)).toEqual(expected)
  })
})

describe('format a sanitised response error as a flash error message', () => {
  it('should render error code and message if no developerMessage present', () => {
    const error = <SanitisedError>{
      status: 400,
      message: 'Bad Request',
    }

    const flashMessage = responseErrorToFlashMessages(error)

    expect(flashMessage.length).toBe(1)
    expect(flashMessage[0]).toStrictEqual({ msg: '400 Bad Request' })
  })

  it('should render error code and message plus developerMessage id present', () => {
    const error = <SanitisedError>{
      status: 400,
      message: 'Bad Request',
      data: {
        developerMessage: 'API message',
      },
    }

    const flashMessage = responseErrorToFlashMessages(error)

    expect(flashMessage.length).toBe(2)
    expect(flashMessage[0]).toStrictEqual({ msg: '400 Bad Request' })
    expect(flashMessage[1]).toStrictEqual({ msg: 'API message' })
  })

  it('should render error code and message plus validationMessages if present', () => {
    const error = <SanitisedError>{
      status: 400,
      message: 'Bad Request',
      data: {
        validationMessages: ['API message A', 'API message B'],
      },
    }

    const flashMessage = responseErrorToFlashMessages(error)

    expect(flashMessage.length).toBe(3)
    expect(flashMessage[0]).toStrictEqual({ msg: '400 Bad Request' })
    expect(flashMessage[1]).toStrictEqual({ msg: 'API message A' })
    expect(flashMessage[2]).toStrictEqual({ msg: 'API message B' })
  })
})

describe('getPublicClientStatus', () => {
  const sessionTemplateBothActive = TestData.sessionTemplate()
  const sessionTemplateBothInactive = TestData.sessionTemplate({
    clients: [
      { active: false, userType: 'STAFF' },
      { active: false, userType: 'PUBLIC' },
    ],
  })
  const sessionTemplatePublicInactive = TestData.sessionTemplate({
    clients: [
      { active: true, userType: 'STAFF' },
      { active: false, userType: 'PUBLIC' },
    ],
  })
  const sessionTemplateStaffInactive = TestData.sessionTemplate({
    clients: [
      { active: false, userType: 'STAFF' },
      { active: true, userType: 'PUBLIC' },
    ],
  })

  it.each([
    ['Session template, both active - return no', sessionTemplateBothActive, 'no'],
    ['Session template, both inactive - return yes', sessionTemplateBothInactive, 'yes'],
    ['Session template, staff inactive - return no', sessionTemplateStaffInactive, 'no'],
    ['Session template, public inactive - return yes', sessionTemplatePublicInactive, 'yes'],
  ])('initialiseName(%s)', (_: string, a: SessionTemplate, expected: string) => {
    expect(getPublicClientStatus(a)).toEqual(expected)
  })
})
