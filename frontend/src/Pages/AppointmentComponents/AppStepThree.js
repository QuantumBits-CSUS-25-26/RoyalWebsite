import React, { useMemo, useState } from "react";
import "./AppStepThree.css";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatTime = (hour24) => {
  const hour12 = hour24 % 12 || 12;
  const period = hour24 < 12 ? "AM" : "PM";
  return `${hour12}${period}`;
};

const AppStepThree = () => {
  const [viewDate, setViewDate] = useState(() => new Date());
  // *****Selected time/date is the value to submit with the appointment payload*****
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSameDayNotice, setShowSameDayNotice] = useState(false);

  const { monthLabel, yearLabel, calendarDays } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startDay + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null;
      }
      const date = new Date(year, month, dayNumber);
      const isPast = date < today;
      return {
        day: dayNumber,
        date,
        isPast,
        isSunday: date.getDay() === 0,
        isSaturday: date.getDay() === 6
      };
    });

    return {
      monthLabel: monthNames[month],
      yearLabel: year,
      calendarDays: days
    };
  }, [viewDate]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) {
      return [];
    }

    const startHour = dayOfWeek === 6 ? 9 : 8;
    const endHour = dayOfWeek === 6 ? 15 : 16;

    return Array.from({ length: endHour - startHour + 1 }, (_, index) =>
      formatTime(startHour + index)
    );
  }, [selectedDate]);

  const selectedKey = selectedDate ? selectedDate.toDateString() : null;

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (day) => {
    if (!day || day.isSunday || day.isPast) {
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(day.date);
    selected.setHours(0, 0, 0, 0);
    setShowSameDayNotice(selected.getTime() === today.getTime());
    setSelectedDate(day.date);
    setSelectedTime(null);
  };

  return (
    <div className="app-step-three">
      <h1>Date and Time</h1>

      <div className="calendar-card">
        <div className="calendar-header">
          <div className="calendar-title">
            {monthLabel} {yearLabel}
          </div>
          <div className="calendar-arrows">
            <button type="button" onClick={handlePrevMonth} aria-label="Previous month">
              &lt;
            </button>
            <button type="button" onClick={handleNextMonth} aria-label="Next month">
              &gt;
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {weekdayLabels.map((label) => (
            <div key={label} className="calendar-weekday">
              {label}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="calendar-day empty" />;
            }

            const dayKey = day.date.toDateString();
            const isSelected = selectedKey === dayKey;
            const isDisabled = day.isSunday || day.isPast;

            return (
              <button
                key={dayKey}
                type="button"
                className={`calendar-day ${isDisabled ? "disabled" : ""} ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleSelectDay(day)}
                disabled={isDisabled}
                aria-label={`Select ${day.date.toDateString()}`}
              >
                {day.day}
              </button>
            );
          })}
        </div>

        {showSameDayNotice && (
          <div className="same-day-notice">
            Same-day scheduling may be available by phone. Please call (916) 562-9441.
          </div>
        )}

        {selectedDate && timeSlots.length > 0 && (
          <div className={`time-slots ${showSameDayNotice ? "disabled" : ""}`}>
            <div className="time-slots-title">Available Times</div>
            <div className="time-slots-grid">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot ${selectedTime === slot ? "selected" : ""}`}
                  onClick={() => setSelectedTime(slot)}
                  disabled={showSameDayNotice}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppStepThree;
