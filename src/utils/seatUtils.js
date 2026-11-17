export function buildSeats(event, overrides = {}, reservations = []) {
  const reservationMap = new Map(reservations.map((item) => [item.seatId, item]))
  const seats = []

  event.rows.forEach((row) => {
    for (let number = 1; number <= row.count; number += 1) {
      const id = `${row.label}${number}`
      let status = 'available'

      if (event.blockedSeats.includes(id) || overrides[id] === 'blocked') {
        status = 'blocked'
      } else if (overrides[id] === 'booked') {
        status = 'booked'
      } else if (reservationMap.has(id)) {
        status = 'reserved'
      }

      seats.push({
        id,
        row: row.label,
        number,
        category: row.category,
        status
      })
    }
  })

  return seats
}

export function getSeatGapIds(seats, selectedIds = []) {
  const selected = new Set(selectedIds)
  const gaps = []

  const rows = [...new Set(seats.map((seat) => seat.row))]
  rows.forEach((row) => {
    const rowSeats = seats
      .filter((seat) => seat.row === row)
      .sort((a, b) => a.number - b.number)

    rowSeats.forEach((seat, index) => {
      if (seat.status !== 'available' || selected.has(seat.id)) return
      const previous = rowSeats[index - 1]
      const next = rowSeats[index + 1]
      if (!previous || !next) return

      const previousTaken = selected.has(previous.id) || ['reserved', 'booked', 'blocked'].includes(previous.status)
      const nextTaken = selected.has(next.id) || ['reserved', 'booked', 'blocked'].includes(next.status)

      if (previousTaken && nextTaken) gaps.push(seat.id)
    })
  })

  return gaps
}

export function wouldCreateIsolatedGap(seats, selectedIds, candidateId) {
  const nextSelection = selectedIds.includes(candidateId)
    ? selectedIds.filter((id) => id !== candidateId)
    : [...selectedIds, candidateId]

  return getSeatGapIds(seats, nextSelection).some((id) => {
    return !nextSelection.includes(id)
  })
}
