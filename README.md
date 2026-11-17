# Seatly — Event Seat Booking System

A complete frontend-only Event Seat Booking System built with Vue 3, Vue Router and the **Options API**.

## Assignment coverage

- Event listing with search, filtering, sorting and details
- Dynamic seat map with Available / Selected / Reserved / Booked / Blocked states
- Maximum 6 seats per booking
- Live booking summary with computed pricing
- VIP / Premium / Standard seat categories
- Weekend pricing rule (+10% on Saturday/Sunday)
- Temporary reservations with countdown and automatic expiry
- Booking confirmation and generated booking reference
- Booking history with detail view and cancellation
- LocalStorage persistence
- Reusable toast notification system
- Loading, empty and error states
- Seat-gap detection and prevention of problematic isolated gaps
- Booking-conflict simulation and atomic conflict handling
- Responsive UI
- Clean separation of data, services, utilities, components, views and router

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

For a production build:

```bash
npm run build
npm run preview
```

## Architecture

```text
src/
├── assets/
│   └── styles.css
├── components/
│   ├── BookingSummary.vue
│   ├── CountdownTimer.vue
│   ├── EmptyState.vue
│   ├── ErrorState.vue
│   ├── EventCard.vue
│   ├── EventFilters.vue
│   ├── SeatMap.vue
│   ├── ToastContainer.vue
│   └── BookingCard.vue
├── data/
│   └── events.js
├── router/
│   └── index.js
├── services/
│   ├── bookingService.js
│   └── storage.js
├── utils/
│   ├── pricing.js
│   └── seatUtils.js
├── views/
│   ├── EventsView.vue
│   ├── EventDetailsView.vue
│   ├── BookingConfirmationView.vue
│   ├── BookingHistoryView.vue
│   └── NotFoundView.vue
├── App.vue
└── main.js
```

## Business decisions

### Seat gaps

A seat is considered an unnecessary isolated gap when it is available and has selected/reserved/booked/blocked seats on both sides in the same row. The UI highlights these seats and prevents a selection that would knowingly create a single-seat orphan.

This is intentionally handled at the seat-map/business-logic level instead of hard-coding it in the template.

### Booking conflicts

The booking flow validates every selected seat immediately before confirmation. The included **Simulate conflict** action intentionally changes one selected seat to `Booked`, allowing the evaluator to demonstrate the real-world race condition.

If a conflict is detected:

1. No booking is created.
2. All temporary reservations from the current attempt are released.
3. Seat availability is re-read from persisted state.
4. The selection is cleared.
5. A conflict toast is shown.
6. The user can select seats again.

## Persistence

LocalStorage keys:

- `seatly_bookings_v1`
- `seatly_seat_state_v1`
- `seatly_reservations_v1`

The app also rehydrates persisted data on startup and cleans expired reservations.

## Options API

All Vue UI components intentionally use:

- `data()`
- `computed`
- `methods`
- `watch`
- `mounted` / `beforeUnmount`
- props and emits

No Composition API component is used.
