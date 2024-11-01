export function formatDateToYYYYMMDD(date: Date) {
  // OLD WAY:
  // const year = date.getFullYear()
  // let month = String(date.getMonth() + 1)
  // let day = String(date.getDate())

  // if (+month < 10) {
  //   month = '0' + month
  // }

  // if (+day < 10) {
  //   day = '0' + day
  // }
  // return `${year}-${month}-${day}`

  // NEW WAY:
  return date.toISOString().slice(0, 10)
}
