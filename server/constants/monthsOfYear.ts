const monthsOfYear = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export default monthsOfYear
export const getMonthByNumber = (m: number) => monthsOfYear[m - 1]
