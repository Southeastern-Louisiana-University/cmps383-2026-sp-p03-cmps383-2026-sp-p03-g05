import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type LocationDto = {
  id: number;
  name: string;
  address: string;
  tableCount: number;
  managerId?: number | null;
};

type ReservationTimeSlotDto = {
  time: string;
  availableTables: number;
  isAvailable: boolean;
};

type ReservationAvailabilityDto = {
  locationId: number;
  date: string;
  totalTables: number;
  timeSlots: ReservationTimeSlotDto[];
};

type PaymentMethodOption = {
  value: string;
  label: string;
  image: string;
};

type CalendarCell = {
  key: string;
  dayLabel: string;
  isoDate: string | null;
  isDisabled: boolean;
};

export type ReservationLoginPayload = {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
};

type ReservationsModalProps = {
  isOpen: boolean;
  isAuthenticated: boolean;
  userName: string | null;
  buildApiUrl: (path: string) => string;
  paymentMethodOptions: readonly PaymentMethodOption[];
  onClose: () => void;
  onSignIn: (payload: ReservationLoginPayload) => Promise<void>;
};

const calendarWeekdayLabels = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toIsoLocalDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;

const formatMonthLabel = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const formatDateLabel = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTimeLabel = (value: string) => {
  const [hourToken, minuteToken] = value.split(":");
  const hour = Number.parseInt(hourToken ?? "", 10);
  const minute = Number.parseInt(minuteToken ?? "0", 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export default function ReservationsModal({
  isOpen,
  isAuthenticated,
  userName,
  buildApiUrl,
  paymentMethodOptions,
  onClose,
  onSignIn,
}: ReservationsModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [reservationUserName, setReservationUserName] = useState("");
  const [reservationPassword, setReservationPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));
  const [today] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [availableSlots, setAvailableSlots] = useState<ReservationTimeSlotDto[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<string | null>(
    null,
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [reservationErrorMessage, setReservationErrorMessage] = useState<string | null>(
    null,
  );
  const [isReservationSuccessVisible, setIsReservationSuccessVisible] = useState(false);

  const maxSelectableDate = useMemo(() => addDays(today, 29), [today]);
  const minSelectableMonth = useMemo(() => monthStart(today), [today]);
  const maxSelectableMonth = useMemo(
    () => monthStart(maxSelectableDate),
    [maxSelectableDate],
  );

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = monthStart(visibleMonth);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    const cells: CalendarCell[] = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push({
        key: `leading-${index}`,
        dayLabel: "",
        isoDate: null,
        isDisabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateValue = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      dateValue.setHours(0, 0, 0, 0);
      const isoDate = toIsoLocalDate(dateValue);
      const isOutOfRange =
        dateValue.getTime() < today.getTime() ||
        dateValue.getTime() > maxSelectableDate.getTime();

      cells.push({
        key: isoDate,
        dayLabel: String(day),
        isoDate,
        isDisabled: selectedLocationId === "" || isOutOfRange,
      });
    }

    const trailingCells = (7 - (cells.length % 7)) % 7;
    for (let index = 0; index < trailingCells; index += 1) {
      cells.push({
        key: `trailing-${index}`,
        dayLabel: "",
        isoDate: null,
        isDisabled: true,
      });
    }

    return cells;
  }, [maxSelectableDate, selectedLocationId, today, visibleMonth]);

  const canGoPreviousMonth = monthKey(visibleMonth) !== monthKey(minSelectableMonth);
  const canGoNextMonth = monthKey(visibleMonth) !== monthKey(maxSelectableMonth);
  const hasAvailableSlots = availableSlots.some((slot) => slot.isAvailable);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const parsed = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    setVisibleMonth(monthStart(parsed));
  }, [selectedDate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthErrorMessage(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadLocations = async () => {
      setIsLocationsLoading(true);
      setLocationsErrorMessage(null);
      try {
        const response = await fetch(buildApiUrl("/api/locations"), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Locations request failed (${response.status})`);
        }

        const payload = (await response.json()) as LocationDto[];
        if (!isMounted) {
          return;
        }

        setLocations(payload);
        setSelectedLocationId((current) => {
          if (current !== "" && payload.some((location) => location.id === current)) {
            return current;
          }

          return payload[0]?.id ?? "";
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to load locations.";
        setLocationsErrorMessage(message);
        setLocations([]);
      } finally {
        if (isMounted) {
          setIsLocationsLoading(false);
        }
      }
    };

    void loadLocations();

    return () => {
      isMounted = false;
    };
  }, [buildApiUrl, isAuthenticated, isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !isAuthenticated ||
      selectedLocationId === "" ||
      !selectedDate
    ) {
      setAvailableSlots([]);
      setSelectedTimeSlot("");
      setAvailabilityErrorMessage(null);
      return;
    }

    let isMounted = true;

    const loadAvailability = async () => {
      setIsAvailabilityLoading(true);
      setAvailabilityErrorMessage(null);
      setSelectedTimeSlot("");
      try {
        const response = await fetch(
          buildApiUrl(
            `/api/reservations/availability?locationId=${selectedLocationId}&date=${encodeURIComponent(
              selectedDate,
            )}`,
          ),
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          let message = `Availability request failed (${response.status})`;
          try {
            const responseText = await response.text();
            if (responseText) {
              message = responseText;
            }
          } catch {
            // Keep fallback message when response parsing fails.
          }
          throw new Error(message);
        }

        const payload = (await response.json()) as ReservationAvailabilityDto;
        if (!isMounted) {
          return;
        }

        setAvailableSlots(payload.timeSlots ?? []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to load available time slots.";
        setAvailabilityErrorMessage(message);
        setAvailableSlots([]);
      } finally {
        if (isMounted) {
          setIsAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [buildApiUrl, isAuthenticated, isOpen, selectedDate, selectedLocationId]);

  const handleReservationSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSigningIn) {
      return;
    }

    if (
      firstName.trim().length === 0 ||
      lastName.trim().length === 0 ||
      reservationUserName.trim().length === 0 ||
      reservationPassword.length === 0
    ) {
      setAuthErrorMessage("Please complete all sign in fields.");
      return;
    }

    setIsSigningIn(true);
    setAuthErrorMessage(null);

    try {
      await onSignIn({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: reservationUserName.trim(),
        password: reservationPassword,
      });
      setReservationPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed.";
      setAuthErrorMessage(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmitReservation = async () => {
    if (isSubmittingReservation) {
      return;
    }

    if (selectedLocationId === "") {
      setReservationErrorMessage("Please select a location.");
      return;
    }

    if (!selectedDate) {
      setReservationErrorMessage("Please select a reservation date.");
      return;
    }

    if (!selectedTimeSlot) {
      setReservationErrorMessage("Please select an available time slot.");
      return;
    }

    if (!paymentMethod) {
      setReservationErrorMessage("Please select a payment method.");
      return;
    }

    setIsSubmittingReservation(true);
    setReservationErrorMessage(null);
    setIsReservationSuccessVisible(false);

    try {
      const selectedPayment = paymentMethodOptions.find(
        (option) => option.value === paymentMethod,
      );
      const response = await fetch(buildApiUrl("/api/reservations"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: selectedLocationId,
          date: selectedDate,
          time: selectedTimeSlot,
          paymentMethod: selectedPayment?.label ?? paymentMethod,
        }),
      });

      if (!response.ok) {
        let message = `Reservation failed (${response.status})`;
        try {
          const responseText = await response.text();
          if (responseText) {
            message = responseText;
          }
        } catch {
          // Keep fallback message when response parsing fails.
        }
        throw new Error(message);
      }

      setIsReservationSuccessVisible(true);
      setSelectedTimeSlot("");
      setPaymentMethod("");
      try {
        const refreshedResponse = await fetch(
          buildApiUrl(
            `/api/reservations/availability?locationId=${selectedLocationId}&date=${encodeURIComponent(
              selectedDate,
            )}`,
          ),
          {
            credentials: "include",
          },
        );
        if (refreshedResponse.ok) {
          const refreshedPayload =
            (await refreshedResponse.json()) as ReservationAvailabilityDto;
          setAvailableSlots(refreshedPayload.timeSlots ?? []);
        }
      } catch {
        // Keep success state even if availability refresh fails.
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save reservation.";
      setReservationErrorMessage(message);
      setIsReservationSuccessVisible(false);
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Reservations"
      onClick={onClose}
    >
      <div className="reservation-modal" onClick={(event) => event.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Reservations</h2>
          <button
            type="button"
            className="cart-modal-close"
            aria-label="Close reservations"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {!isAuthenticated ? (
          <section className="reservation-auth-gate">
            <h3>Must be signed in to make a reservation</h3>
            <p className="reservation-auth-helper">
              Enter your account details to continue.
            </p>

            <form className="reservation-auth-form" onSubmit={handleReservationSignIn}>
              <div className="reservation-auth-grid">
                <label className="reservation-auth-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </label>

                <label className="reservation-auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    autoComplete="family-name"
                    required
                  />
                </label>

                <label className="reservation-auth-field">
                  <span>User Name</span>
                  <input
                    type="text"
                    value={reservationUserName}
                    onChange={(event) => setReservationUserName(event.target.value)}
                    autoComplete="username"
                    required
                  />
                </label>

                <label className="reservation-auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={reservationPassword}
                    onChange={(event) => setReservationPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="reservation-auth-btn"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <LoaderCircle size={16} className="spinning-icon" />
                    Signing In...
                  </>
                ) : (
                  "Sign In to Continue"
                )}
              </button>

              {authErrorMessage ? <p className="auth-error">{authErrorMessage}</p> : null}
            </form>
          </section>
        ) : (
          <section className="reservations-card reservation-modal-card">
            <p className="reservation-user-note">
              Signed in as {userName ?? "User"}.
            </p>

            <label className="checkout-field">
              <span>Select your location</span>
              <select
                value={selectedLocationId}
                onChange={(event) => {
                  const next = event.target.value;
                  setSelectedLocationId(next === "" ? "" : Number(next));
                  setSelectedDate("");
                  setVisibleMonth(minSelectableMonth);
                  setAvailableSlots([]);
                  setSelectedTimeSlot("");
                  setAvailabilityErrorMessage(null);
                  setReservationErrorMessage(null);
                  setIsReservationSuccessVisible(false);
                }}
                disabled={isLocationsLoading || isSubmittingReservation}
              >
                <option value="">
                  {isLocationsLoading ? "Loading locations..." : "Choose location"}
                </option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.address}
                  </option>
                ))}
              </select>
            </label>
            {locationsErrorMessage ? (
              <p className="checkout-error">{locationsErrorMessage}</p>
            ) : null}

            <div className="checkout-field">
              <span>Select reservation date</span>
              {selectedLocationId === "" ? (
                <p className="customer-helper-text">
                  Select location first to choose a reservation date.
                </p>
              ) : (
                <>
                  <div className="reservation-calendar">
                    <div className="reservation-calendar-header">
                      <button
                        type="button"
                        className="reservation-calendar-nav"
                        disabled={!canGoPreviousMonth || isSubmittingReservation}
                        onClick={() => {
                          setVisibleMonth(
                            (current) =>
                              new Date(current.getFullYear(), current.getMonth() - 1, 1),
                          );
                        }}
                        aria-label="Show previous month"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <strong>{formatMonthLabel(visibleMonth)}</strong>
                      <button
                        type="button"
                        className="reservation-calendar-nav"
                        disabled={!canGoNextMonth || isSubmittingReservation}
                        onClick={() => {
                          setVisibleMonth(
                            (current) =>
                              new Date(current.getFullYear(), current.getMonth() + 1, 1),
                          );
                        }}
                        aria-label="Show next month"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="reservation-calendar-weekdays">
                      {calendarWeekdayLabels.map((dayLabel) => (
                        <span key={dayLabel}>{dayLabel}</span>
                      ))}
                    </div>

                    <div className="reservation-calendar-grid">
                      {calendarCells.map((cell) => {
                        const isSelected = cell.isoDate === selectedDate;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            className={`reservation-day-btn ${
                              !cell.isoDate ? "empty" : ""
                            } ${cell.isDisabled && cell.isoDate ? "disabled" : ""} ${
                              isSelected ? "selected" : ""
                            }`}
                            disabled={!cell.isoDate || cell.isDisabled || isSubmittingReservation}
                            onClick={() => {
                              if (!cell.isoDate) {
                                return;
                              }
                              setSelectedDate(cell.isoDate);
                              setSelectedTimeSlot("");
                              setAvailabilityErrorMessage(null);
                              setReservationErrorMessage(null);
                              setIsReservationSuccessVisible(false);
                            }}
                          >
                            {cell.dayLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="reservation-date-summary">
                    {selectedDate
                      ? `Selected: ${formatDateLabel(selectedDate)}`
                      : "Select a date to load available time slots."}
                  </p>
                </>
              )}
            </div>

            <div className="checkout-field">
              <span>Available time slots</span>
              {isAvailabilityLoading ? (
                <p className="customer-helper-text">Checking availability...</p>
              ) : selectedLocationId === "" || !selectedDate ? (
                <p className="customer-helper-text">
                  Select a location and date to view open time slots.
                </p>
              ) : !hasAvailableSlots ? (
                <p className="customer-helper-text">No open time slots for this date.</p>
              ) : (
                <div className="reservation-slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={`reservation-slot-btn ${
                        slot.isAvailable ? "available" : "unavailable"
                      } ${selectedTimeSlot === slot.time ? "selected" : ""}`}
                      disabled={!slot.isAvailable || isSubmittingReservation}
                      onClick={() => {
                        setSelectedTimeSlot(slot.time);
                        setReservationErrorMessage(null);
                        setIsReservationSuccessVisible(false);
                      }}
                    >
                      <strong>{formatTimeLabel(slot.time)}</strong>
                      <span>{slot.availableTables} tables</span>
                    </button>
                  ))}
                </div>
              )}
              {availabilityErrorMessage ? (
                <p className="checkout-error">{availabilityErrorMessage}</p>
              ) : null}
            </div>

            <div className="reservation-payment-notice">
              Reservations require payment in full.
            </div>

            <div className="checkout-field">
              <span>Payment</span>
              <div className="payment-methods-row">
                {paymentMethodOptions.map((option) => {
                  const isSelected = paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`payment-method-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setPaymentMethod(option.value);
                        setReservationErrorMessage(null);
                        setIsReservationSuccessVisible(false);
                      }}
                      disabled={isSubmittingReservation}
                      aria-label={`Select ${option.label} payment`}
                    >
                      <img src={option.image} alt={option.label} className="payment-method-icon" />
                      {isSelected ? (
                        <span className="payment-selected-badge" aria-hidden="true">
                          <Check size={12} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="primary-btn checkout-order-btn"
              onClick={() => {
                void handleSubmitReservation();
              }}
              disabled={
                isSubmittingReservation ||
                selectedLocationId === "" ||
                !selectedDate ||
                !selectedTimeSlot ||
                !paymentMethod
              }
            >
              {isSubmittingReservation ? (
                <>
                  <LoaderCircle size={16} className="spinning-icon" />
                  Saving Reservation...
                </>
              ) : (
                "Reserve My Spot"
              )}
            </button>

            {reservationErrorMessage ? (
              <p className="checkout-error">{reservationErrorMessage}</p>
            ) : null}

            {isReservationSuccessVisible ? (
              <div className="checkout-success reservation-success">
                <CheckCircle2 size={78} strokeWidth={2.2} />
                <p>Payment processed successfully. Your reservation has been saved!</p>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}
