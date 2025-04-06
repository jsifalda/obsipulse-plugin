export function getLocalTodayDate() {
  // Create a new Date object for the current date and time
  const date = new Date()

  // Get the local timezone offset in minutes and adjust with its sign
  const timezoneOffset = date.getTimezoneOffset() * 60000
  const localDateWithOffset = new Date(date.getTime() - timezoneOffset)

  // Use toISOString to format to "YYYY-MM-DDTHH:mm:ss.sssZ" and split to get "YYYY-MM-DD"
  const formattedDate = localDateWithOffset.toISOString().split('T')[0]
  return formattedDate
}
