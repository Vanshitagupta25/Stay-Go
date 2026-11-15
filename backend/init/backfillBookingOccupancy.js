require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Booking = require("../models/booking.js");
const {
  HOLD_DURATION_MS,
  buildOccupiedDates,
  formatDateOnly,
} = require("../utils/bookingDates.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";

mongoose.set("autoIndex", false);

function sameDates(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  return left.every((date, index) => date === right[index]);
}

function findOccupancyConflicts(bookings) {
  const grouped = new Map();

  for (const booking of bookings) {
    const key = booking.listing.toString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(booking);
  }

  const conflicts = [];

  for (const [listingId, listingBookings] of grouped.entries()) {
    const sorted = [...listingBookings].sort(
      (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
    );

    let furthestEnd = null;
    let previous = null;

    for (const booking of sorted) {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      if (furthestEnd && checkIn < furthestEnd) {
        conflicts.push({
          listingId,
          firstBookingId: previous._id.toString(),
          secondBookingId: booking._id.toString(),
          firstRange: `${formatDateOnly(new Date(previous.checkIn))} → ${formatDateOnly(
            new Date(previous.checkOut)
          )}`,
          secondRange: `${formatDateOnly(checkIn)} → ${formatDateOnly(checkOut)}`,
        });
      }

      if (!furthestEnd || checkOut > furthestEnd) {
        furthestEnd = checkOut;
        previous = booking;
      }
    }
  }

  return conflicts;
}

async function backfillBookingOccupancy(now = new Date()) {
  const bookings = await Booking.find({ status: { $in: ["PENDING", "PAID"] } });

  let backfilled = 0;
  let expiredPending = 0;
  let invalidRanges = 0;

  for (const booking of bookings) {
    const occupiedDates = buildOccupiedDates(booking.checkIn, booking.checkOut);

    if (occupiedDates.length === 0) {
      invalidRanges += 1;
      console.warn(
        `Skipping booking ${booking._id}: invalid range ${booking.checkIn} → ${booking.checkOut}`
      );
      continue;
    }

    if (booking.status === "PENDING") {
      const holdExpired = !booking.holdExpiresAt || booking.holdExpiresAt <= now;

      if (holdExpired) {
        await Booking.updateOne(
          { _id: booking._id },
          {
            $set: { status: "FAILED" },
            $unset: { holdExpiresAt: 1 },
          }
        );
        expiredPending += 1;
        continue;
      }

      if (!sameDates(booking.occupiedDates, occupiedDates)) {
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { occupiedDates } }
        );
        backfilled += 1;
      }
      continue;
    }

    const update = {};
    if (!sameDates(booking.occupiedDates, occupiedDates)) {
      update.occupiedDates = occupiedDates;
    }
    if (booking.holdExpiresAt) {
      update.holdExpiresAt = null;
    }

    if (Object.keys(update).length > 0) {
      await Booking.updateOne({ _id: booking._id }, { $set: update });
      backfilled += 1;
    }
  }

  const activeBookings = await Booking.find({
    status: { $in: ["PENDING", "PAID"] },
  }).select("_id listing checkIn checkOut status");

  const conflicts = findOccupancyConflicts(activeBookings);
  if (conflicts.length > 0) {
    const details = conflicts
      .map(
        (conflict) =>
          `listing ${conflict.listingId}: ${conflict.firstBookingId} (${conflict.firstRange}) overlaps ${conflict.secondBookingId} (${conflict.secondRange})`
      )
      .join("\n");
    throw new Error(
      `Found existing overlapping active bookings. Resolve these manually before creating the occupancy index:\n${details}`
    );
  }

  await Booking.createIndexes();

  return {
    scanned: bookings.length,
    backfilled,
    expiredPending,
    invalidRanges,
    holdMinutes: HOLD_DURATION_MS / 60000,
  };
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB for booking occupancy backfill");

  const result = await backfillBookingOccupancy();

  console.log(
    `Booking occupancy backfill complete. Scanned ${result.scanned} booking(s), updated ${result.backfilled}, expired ${result.expiredPending} stale pending hold(s), skipped ${result.invalidRanges} invalid range(s).`
  );

  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  main().catch(async (err) => {
    console.error("Error backfilling booking occupancy:", err.message || err);
    await mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = {
  backfillBookingOccupancy,
  findOccupancyConflicts,
  sameDates,
};
