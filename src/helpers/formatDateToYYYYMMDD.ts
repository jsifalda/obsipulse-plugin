export function formatDateToYYYYMMDD(date: Date) {
  // Extracting individual components
  const year = date.getFullYear()
  let month = String(date.getMonth() + 1) // Months are zero-based!
  let day = String(date.getDate())

  // Ensuring two-digit formats for month and day
  if (+month < 10) {
    month = '0' + month
  }

  if (+day < 10) {
    day = '0' + day
  }

  // Concatenating components in YYYY-MM-DD format
  return `${year}-${month}-${day}`
}
