// Einzelne Funktionen schreiben wie getYesterday, getLastWeek, getDate(spezieller Tag) etc., die dann die startDate und endDate Variable verändern.

let today = new Date()
let dates = []

// Die folgenden Datumsfunktionen returnen allesamt ein Array mit (Date) array[0] = StartDatum und (Date) array[1] = EndDatum
// Die Uhrzeit ist immer 0:00 Uhr am Start Tag und 23:59 Uhr am End Tag

// Gestern
function getYesterday(){
    let startDate = new Date()
    let endDate = new Date()
    startDate.setDate(today.getDate() - 1)
    endDate.setDate(today.getDate() - 1)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Die letzten 7 Tage
function getLastSevenDays(){
    let startDate = new Date()
    let endDate = new Date()
    startDate.setDate(today.getDate() - 7)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Letzte Arbeitswoche (Mo-Sa)
function getLastWeek(){
    let startDate = new Date()
    let endDate = new Date()
    let days = endDate.getDay()
    endDate.setDate(today.getDate() - (days + 1))
    startDate.setDate(today.getDate() - (days + 6))
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}


// Bestimmter Tag, Parameter date = 'YYYY-MM-DD'
function getSpecificDate(date){
    let startDate = new Date(date)
    let endDate = new Date(date)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}


// Zeitspanne, Parameter sDate und eDate = 'YYYY-MM-DD'
function getTimeSpan(sDate, eDate){
    let startDate = new Date(sDate)
    let endDate = new Date(eDate)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Letzter kompletter Monat (01.-31.)
function getLastMonth(){
    let startDate = new Date()
    let endDate = new Date()
    let month = endDate.getMonth()
    startDate.setFullYear(endDate.getFullYear(), month - 1, 1)
    endDate.setFullYear(endDate.getFullYear(), month, 0)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Aktueller Monat bis Tag Heute
function getCurrentMonth(){
    let startDate = new Date()
    let endDate = new Date()
    let month = endDate.getMonth()
    startDate.setFullYear(endDate.getFullYear(), month, 1)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Letztes Jahr
function getLastYear(){
    let startDate = new Date()
    let endDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1, 0, 1)
    endDate.setFullYear(endDate.getFullYear(), 0, 0)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Aktuelles Jahr bis Tag Heute
function getCurrentYear(){
    let startDate = new Date()
    let endDate = new Date()
    startDate.setFullYear(endDate.getFullYear(), 0, 1)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Letztes Quartal
function getLastQuarter(){
    let startDate = new Date()
    let endDate = new Date()
    let month = endDate.getMonth()
    let mod = month % 3
    startDate.setFullYear(endDate.getFullYear(), month - (mod + 3), 1)
    endDate.setFullYear(endDate.getFullYear(), month - mod, 0)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}

// Aktuelles Quartal bis Tag Heute
function getLastQuarter(){
    let startDate = new Date()
    let endDate = new Date()
    let month = endDate.getMonth()
    let mod = month % 3
    startDate.setFullYear(endDate.getFullYear(), month - mod, 1)
    startDate.setHours(0,0,0,0)
    endDate.setHours(23,59,59,0)
    dates[0] = startDate
    dates[1] = endDate
    return dates
}


// Aufruf bzw Verwendung in main.js:

// let seDate = time.getCurrentYear()
// startDate = seDate[0]
// endDate = seDate[1]
// console.log('StartDate: ' + startDate + ', EndDate: ' + endDate)
// ... Aufruf der Dimensions Funktionen mit übergabe der startDate und endDate Parameter (Evtl Umstellung der Parameter zu einem Array, also übergabe
// von seDate statt startDate/endDate)


// Berechnung des aktuellen Quartals
/* let startDate = new Date()
    let endDate = new Date()
    let month = (endDate.getMonth() + 1)
    let quarter = 0
    let mod = (month % 3)
    quarter = Math.floor((month - mod) / 3)
    if(!mod == 0) quarter++ */


module.exports = {getYesterday, getLastWeek, getLastSevenDays, getSpecificDate, getTimeSpan, getLastMonth, getCurrentMonth, getCurrentYear, getLastYear, getLastQuarter};