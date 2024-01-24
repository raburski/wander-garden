import moment from "moment"

export function momentInLocalTimezone(dateString) {
  const timezoneLessDate = dateString.substring(0, dateString.length-6)
  return moment(timezoneLessDate)
}

export function formatInLocalTimezone(dateString, format) {
  return momentInLocalTimezone(dateString).format(format)
}