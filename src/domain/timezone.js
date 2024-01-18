import moment from "moment";

export function formatInLocalTimezone(dateString, format) {
  const timezoneLessDate = dateString.substring(0, dateString.length-6)
  return moment(timezoneLessDate).format(format)
}