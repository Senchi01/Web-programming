import axios from 'axios'
import { parse } from 'node-html-parser'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('ERROR: No argument(s).')
  process.exit(1)
}

/**
 *
 * @param {string} url retuns links.
 * @returns {Array} links
 */
async function getLinks (url) {
  const response = await axios.get(url)
  const doc = response.data
  const root = parse(doc)
  const anchors = root.querySelectorAll('a')
  const links = anchors.map((o) => o.getAttribute('href'))
  return links
}

// #region calendar code
/**
 * @param {string} url - URL that contains the content of the calendar page.
 * @returns {Array} - Array of days where the value is "OK".
 */
async function checkFriendsAvailability (url) {
  const response = await axios.get(url)
  const data = response.data
  const root = parse(data)
  const rows = root.querySelectorAll('table.striped tbody tr')
  const days = []
  rows.forEach(row => {
    const columns = row.querySelectorAll('td')
    columns.forEach((column, colIndex) => {
      const text = column.text.toLowerCase()
      if (text === 'ok') {
        const dayHeader = root.querySelectorAll('table.striped thead th')[colIndex].text.trim()
        days.push(dayHeader)
      }
    })
  })
  return days
}

/**
 * @returns {string} the commen day between the friends
 * @param {Array} links list of links .
 */
async function calendarHandler (links) {
  const calendarLink = links[0]
  const calendarLinks = await getLinks(calendarLink)
  const paulCalendar = calendarLink + calendarLinks[0]
  const peterCalendar = calendarLink + calendarLinks[1]
  const maryCalendar = calendarLink + calendarLinks[2]
  const days = []
  const urls = [
    paulCalendar,
    peterCalendar,
    maryCalendar
  ]
  for (let i = 0; i < urls.length; i++) {
    const element = await checkFriendsAvailability(urls[i])
    days.push(element)
  }
  const allFreeDay = days[0].filter(element => days.every(innerArray => innerArray.includes(element)))
  return allFreeDay.length > 0 ? allFreeDay : null
}
/**
 *
 * @param {string} cenimaLink the cenima link
 * @param  {number} dayValue - Day value
 * @returns {string} dayname
 */
async function getDayName (cenimaLink, dayValue) {
  const response = await axios.get(cenimaLink)
  const doc = response.data
  const root = parse(doc)
  const anchors = root.querySelectorAll(`#day option[value="${dayValue}"]`)
  const dayName = anchors.map((element) => element.text.trim())

  return dayName
}

/**
 *
 * @param {Array} links cenimaLink
 * @param {string} days agreedDay
 * @returns {number} dayValue
 */
async function getDayValue (links, days) {
  const cenimaLink = links[1]
  const response = await axios.get(cenimaLink)
  const doc = response.data
  const root = parse(doc)
  const values = []
  const anchors = root.querySelectorAll('#day option')
  for (const row of anchors) {
    const textContent = row.textContent
    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      if (day.toLowerCase() === textContent.toLowerCase()) {
        values.push(row.getAttribute('value'))
      }
    }
  }
  return values.length > 0 ? values : null
}

// #endregion

// #region cenima
/**
 *
 * @param {Array} links cenimaLink
 * @returns {number} movieValue
 */
async function getMoviesValue (links) {
  const cenimaLink = links[1]
  const response = await axios.get(cenimaLink)
  const doc = response.data
  const root = parse(doc)
  const anchors = root.querySelectorAll('#movie option')
  const movieValue = anchors.slice(1).map((element) => element.getAttribute('value'))
  return movieValue
}

/**
 *
 * @param {string} cenimaLink The cenima link
 * @param {number} movieValue The movie value
 * @returns {string} movieName
 */
async function getMovieName (cenimaLink, movieValue) {
  const response = await axios.get(cenimaLink)
  const doc = response.data
  const root = parse(doc)
  const anchors = root.querySelectorAll(`#movie option[value="${movieValue}"]`)
  const movieName = Array.from(anchors).map((element) => element.text.trim())
  return movieName
}

/**
 *
 * @param {Array} links array of links for events
 * @param {number} dayValue dayVlaue
 * @param {Array} movies array of moivesValue
 * @returns {Array} list of available movies
 */
async function getAvilableMovies (links, dayValue, movies) {
  const cenimaLink = links[1]
  const result = []

  for (let i = 0; i < movies.length; i++) {
    for (let j = 0; j < dayValue.length; j++) {
      const response = await axios.get(`${cenimaLink}/check?day=${dayValue[j]}&movie=${movies[i]}`)

      const doc = response.data
      const movieTimes = doc.filter((entry) => entry.status === 1).map((entry) => entry.time)
      const movieValue = doc.filter((entry) => entry.status === 1).map((entry) => entry.movie)
      const movieNames = await Promise.all(
        movieValue.map((value) => getMovieName(cenimaLink, value))
      )
      const dayName = await getDayName(cenimaLink, dayValue[j])

      result.push(...movieTimes.map((time, index) => ({
        day: dayName[0],
        name: movieNames[index][0],
        time
      })))
    }
  }

  return result
}
// #endregion

/**
 *
 * @param {Array} links links to get the dinner link
 * @param {Array} days to get the aggreed days
 * @returns {Array} list of free tables with given day
 */
async function getReservations (links, days) {
  const dinnerLink = links[2]
  const body = {
    username: 'zeke',
    password: 'coys'
  }
  const urlEncodedString = new URLSearchParams(body).toString()
  const postFetchOptions = {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: urlEncodedString
  }
  const loginResponse = await fetch(dinnerLink + 'login/', postFetchOptions)
  const getFetchOptions = {
    method: 'GET',
    headers: {
      Cookie: loginResponse.headers.get('set-cookie')
    }
  }
  const response = await axios.get(dinnerLink + 'login/booking', getFetchOptions)
  const doc = await response.data
  const root = parse(doc)
  const FreeTableTime = []
  const convertTimeFormat = (timeRange) => {
    const [range] = timeRange.split(' ')
    const [start, end] = range.split('-')
    return `${start.padStart(2)}:00-${end.padStart(2)}:00`
  }
  const friFree = root.querySelectorAll('.WordSection2 input[type="radio"]')
    .map(input => {
      const value = input.getAttribute('value')
      const timeRange = input.nextElementSibling.text.trim()
      return { value, timeRange: convertTimeFormat(timeRange) }
    })
  const satFree = root.querySelectorAll('.WordSection4 input[type="radio"]')
    .map(input => {
      const value = input.getAttribute('value')
      const timeRange = input.nextElementSibling.text.trim()
      return { value, timeRange: convertTimeFormat(timeRange) }
    })
  const sunFree = root.querySelectorAll('.WordSection6 input[type="radio"]')
    .map(input => {
      const value = input.getAttribute('value')
      const timeRange = input.nextElementSibling.text.trim()
      return { value, timeRange: convertTimeFormat(timeRange) }
    })
  for (let i = 0; i < days.length; i++) {
    if (days[i] === 'Friday') {
      FreeTableTime.push(...friFree)
    } else if (days[i] === 'Saturday') {
      FreeTableTime.push(...satFree)
    } else if (days[i] === 'Sunday') {
      FreeTableTime.push(...sunFree)
    }
  }
  return FreeTableTime
}

/**
 *
 */
async function getRecommendations () {
  const links = await getLinks(args)
  console.log('\x1b[34mScraping\x1b[0m links...\x1b[38;5;177mOK\x1b[0m')
  const agreedDays = await calendarHandler(links)
  console.log('\x1b[34mScraping\x1b[0m available days...\x1b[38;5;177mOK\x1b[0m')
  const movieValue = await getMoviesValue(links)
  const dayValue = await getDayValue(links, agreedDays)
  const availableMovies = await getAvilableMovies(links, dayValue, movieValue)
  console.log('\x1b[34mScraping\x1b[0m showtimes...\x1b[38;5;177mOK\x1b[0m')
  const reservations = await getReservations(links, agreedDays)
  console.log('\x1b[34mScraping\x1b[0m possible reservations...\x1b[38;5;177mOK\x1b[0m')
  console.log('\n\x1b[34mRecommendations\x1b[0m')
  console.log('===============')

  const movieSet = new Set()
  for (const movie of availableMovies) {
    for (const barTime of reservations) {
      const movieStartTime = parseInt(movie.time)
      const barStartTime = parseInt(barTime.timeRange)

      if (barStartTime - movieStartTime === 2) {
        const reservationDetail = `${movie.day}-${movie.name}-${movie.time}-${barTime.timeRange}`
        if (!movieSet.has(reservationDetail)) {
          const recommendation = `* \x1b[34mOn ${movie.day}\x1b[0m the movie \x1b[38;5;222m"${movie.name}"\x1b[0m starts at \x1b[38;5;140m${movie.time}\x1b[0m and there is a free table between \x1b[38;5;140m${barTime.timeRange}\x1b[0m.`
          console.log(recommendation)
          movieSet.add(reservationDetail)
        }
      }
    }
  }
  if (movieSet.size === 0) {
    console.log('No recommendations found.')
  }
}

getRecommendations()
