import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { locationsApi, reservationsApi, type LocationDto, type ReservationTimeSlotDto } from '@/lib/api';

type DropdownOption = {
  value: string;
  label: string;
};

type CalendarCell = {
  key: string;
  dayLabel: string;
  isoDate: string | null;
  isDisabled: boolean;
};

type DropdownFieldProps = {
  label: string;
  valueLabel: string;
  placeholder: string;
  options: DropdownOption[];
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

const paymentMethodOptions = [
  {
    value: 'masterpay',
    label: 'MasterPay',
    image: require('@/assets/images/masterpay.png'),
  },
  {
    value: 'visapay',
    label: 'VisaPay',
    image: require('@/assets/images/visapay.png'),
  },
  {
    value: 'applepay',
    label: 'ApplePay',
    image: require('@/assets/images/applepay.png'),
  },
  {
    value: 'gpay',
    label: 'GPay',
    image: require('@/assets/images/gpay.png'),
  },
] as const;

const calendarWeekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const successRedirectDelayMs = 3000;

function formatDateLabel(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toIsoLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatTimeLabel(timeValue: string) {
  const [hourToken, minuteToken] = timeValue.split(':');
  const hour = Number.parseInt(hourToken ?? '', 10);
  const minute = Number.parseInt(minuteToken ?? '0', 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return timeValue;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minuteText = String(minute).padStart(2, '0');
  return `${hour12}:${minuteText} ${suffix}`;
}

function DropdownField({
  label,
  valueLabel,
  placeholder,
  options,
  isOpen,
  disabled,
  onToggle,
  onSelect,
}: DropdownFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownTrigger,
          disabled && styles.dropdownTriggerDisabled,
          pressed && !disabled && styles.dropdownTriggerPressed,
        ]}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onToggle}>
        <ThemedText style={[styles.dropdownValue, !valueLabel && styles.dropdownPlaceholder]}>
          {valueLabel || placeholder}
        </ThemedText>
        <ChevronDown color={BrandColors.darkAccent} size={18} />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownList}>
          {options.length === 0 ? (
            <ThemedText style={styles.emptyDropdownText}>No options available</ThemedText>
          ) : (
            options.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [styles.dropdownOption, pressed && styles.dropdownOptionPressed]}
                onPress={() => onSelect(option.value)}>
                <ThemedText style={styles.dropdownOptionText}>{option.label}</ThemedText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function ReserveScreen() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<'location' | null>(null);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLoadingLocations, setLoadingLocations] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));
  const [today] = useState(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  });

  const [availableSlots, setAvailableSlots] = useState<ReservationTimeSlotDto[]>([]);
  const [isLoadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const successRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxSelectableDate = useMemo(() => addDays(today, 29), [today]);
  const minSelectableMonth = useMemo(() => monthStart(today), [today]);
  const maxSelectableMonth = useMemo(() => monthStart(maxSelectableDate), [maxSelectableDate]);

  const locationOptions = useMemo<DropdownOption[]>(
    () =>
      locations.map((location) => ({
        value: String(location.id),
        label: location.address,
      })),
    [locations]
  );

  const selectedLocationLabel = useMemo(
    () => locationOptions.find((option) => option.value === selectedLocationId)?.label ?? '',
    [locationOptions, selectedLocationId]
  );

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = monthStart(visibleMonth);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let index = 0; index < firstWeekday; index++) {
      cells.push({
        key: `leading-${index}`,
        dayLabel: '',
        isoDate: null,
        isDisabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateValue = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      dateValue.setHours(0, 0, 0, 0);
      const isoDate = toIsoLocalDate(dateValue);
      const isOutOfRange = dateValue.getTime() < today.getTime() || dateValue.getTime() > maxSelectableDate.getTime();

      cells.push({
        key: isoDate,
        dayLabel: String(day),
        isoDate,
        isDisabled: !selectedLocationId || isOutOfRange,
      });
    }

    const trailingCells = (7 - (cells.length % 7)) % 7;
    for (let index = 0; index < trailingCells; index++) {
      cells.push({
        key: `trailing-${index}`,
        dayLabel: '',
        isoDate: null,
        isDisabled: true,
      });
    }

    return cells;
  }, [maxSelectableDate, selectedLocationId, today, visibleMonth]);

  const canGoPreviousMonth = monthKey(visibleMonth) !== monthKey(minSelectableMonth);
  const canGoNextMonth = monthKey(visibleMonth) !== monthKey(maxSelectableMonth);

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
    return () => {
      if (successRedirectTimerRef.current) {
        clearTimeout(successRedirectTimerRef.current);
        successRedirectTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadLocations = async () => {
      setLoadingLocations(true);
      setLocationsErrorMessage(null);
      try {
        const result = await locationsApi.list();
        setLocations(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load locations.';
        setLocationsErrorMessage(message);
      } finally {
        setLoadingLocations(false);
      }
    };

    void loadLocations();
  }, []);

  useEffect(() => {
    if (!selectedLocationId || !selectedDate) {
      setAvailableSlots([]);
      setSelectedTimeSlot('');
      setAvailabilityErrorMessage(null);
      return;
    }

    const loadAvailability = async () => {
      setLoadingAvailability(true);
      setAvailabilityErrorMessage(null);
      setSelectedTimeSlot('');
      try {
        const result = await reservationsApi.availability(Number(selectedLocationId), selectedDate);
        setAvailableSlots(result.timeSlots);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load available times.';
        setAvailabilityErrorMessage(message);
        setAvailableSlots([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    void loadAvailability();
  }, [selectedLocationId, selectedDate]);

  const handleReserve = async () => {
    if (isSubmitting) {
      return;
    }

    if (!selectedLocationId) {
      setSubmitErrorMessage('Please select a location.');
      return;
    }

    if (!selectedDate) {
      setSubmitErrorMessage('Please select a reservation date.');
      return;
    }

    if (!selectedTimeSlot) {
      setSubmitErrorMessage('Please select an available time slot.');
      return;
    }

    if (!paymentMethod) {
      setSubmitErrorMessage('Please select a payment method.');
      return;
    }

    setSubmitting(true);
    setSubmitErrorMessage(null);
    setSuccessVisible(false);
    try {
      const selectedPayment = paymentMethodOptions.find((option) => option.value === paymentMethod);
      await reservationsApi.create({
        locationId: Number(selectedLocationId),
        date: selectedDate,
        time: selectedTimeSlot,
        paymentMethod: selectedPayment?.label ?? paymentMethod,
      });
      setSuccessVisible(true);
      setSelectedTimeSlot('');
      setPaymentMethod('');
      setActiveDropdown(null);

      if (successRedirectTimerRef.current) {
        clearTimeout(successRedirectTimerRef.current);
      }
      successRedirectTimerRef.current = setTimeout(() => {
        router.replace('/(app)/home');
      }, successRedirectDelayMs);

      try {
        const refreshed = await reservationsApi.availability(Number(selectedLocationId), selectedDate);
        setAvailableSlots(refreshed.timeSlots);
      } catch {
        // Keep success state/redirect even if availability refresh fails after a successful reservation.
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save reservation.';
      setSubmitErrorMessage(message);
      setSuccessVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const hasAvailableSlots = availableSlots.some((slot) => slot.isAvailable);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>
          Reserve
        </ThemedText>
        <ThemedText style={styles.subtitle}>Book a table and skip the wait.</ThemedText>

        <View style={styles.card}>
          <DropdownField
            label="Select your location"
            valueLabel={selectedLocationLabel}
            placeholder={isLoadingLocations ? 'Loading locations...' : 'Choose location'}
            options={locationOptions}
            isOpen={activeDropdown === 'location'}
            disabled={isLoadingLocations || locationOptions.length === 0}
            onToggle={() => setActiveDropdown((current) => (current === 'location' ? null : 'location'))}
            onSelect={(value) => {
              setSelectedLocationId(value);
              setSelectedDate('');
              setVisibleMonth(minSelectableMonth);
              setAvailableSlots([]);
              setSelectedTimeSlot('');
              setAvailabilityErrorMessage(null);
              setSuccessVisible(false);
              setActiveDropdown(null);
            }}
          />
          {locationsErrorMessage ? <ThemedText style={styles.errorText}>{locationsErrorMessage}</ThemedText> : null}

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Select reservation date</ThemedText>
            {!selectedLocationId ? (
              <ThemedText style={styles.helperText}>Select location first to choose a reservation date.</ThemedText>
            ) : (
              <>
                <View style={styles.calendarWrap}>
                  <View style={styles.calendarHeader}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.calendarNavButton,
                        !canGoPreviousMonth && styles.calendarNavButtonDisabled,
                        pressed && canGoPreviousMonth && styles.calendarNavButtonPressed,
                      ]}
                      disabled={!canGoPreviousMonth || isSubmitting}
                      onPress={() => {
                        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
                      }}>
                      <ChevronLeft color={BrandColors.darkAccent} size={16} />
                    </Pressable>
                    <ThemedText style={styles.calendarMonthLabel}>{formatMonthLabel(visibleMonth)}</ThemedText>
                    <Pressable
                      style={({ pressed }) => [
                        styles.calendarNavButton,
                        !canGoNextMonth && styles.calendarNavButtonDisabled,
                        pressed && canGoNextMonth && styles.calendarNavButtonPressed,
                      ]}
                      disabled={!canGoNextMonth || isSubmitting}
                      onPress={() => {
                        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
                      }}>
                      <ChevronRight color={BrandColors.darkAccent} size={16} />
                    </Pressable>
                  </View>
                  <View style={styles.calendarWeekdayRow}>
                    {calendarWeekdayLabels.map((dayLabel) => (
                      <ThemedText key={dayLabel} style={styles.calendarWeekdayLabel}>
                        {dayLabel}
                      </ThemedText>
                    ))}
                  </View>
                  <View style={styles.calendarGrid}>
                    {calendarCells.map((cell) => {
                      const isSelected = cell.isoDate === selectedDate;
                      return (
                        <Pressable
                          key={cell.key}
                          style={({ pressed }) => [
                            styles.calendarDay,
                            !cell.isoDate && styles.calendarDayEmpty,
                            cell.isDisabled && !!cell.isoDate && styles.calendarDayDisabled,
                            isSelected && styles.calendarDaySelected,
                            pressed && !cell.isDisabled && !!cell.isoDate && styles.calendarDayPressed,
                          ]}
                          disabled={!cell.isoDate || cell.isDisabled || isSubmitting}
                          onPress={() => {
                            if (!cell.isoDate) {
                              return;
                            }
                            setSelectedDate(cell.isoDate);
                            setSelectedTimeSlot('');
                            setAvailabilityErrorMessage(null);
                            setSuccessVisible(false);
                          }}>
                          <ThemedText
                            style={[
                              styles.calendarDayLabel,
                              cell.isDisabled && !!cell.isoDate && styles.calendarDayLabelDisabled,
                              isSelected && styles.calendarDayLabelSelected,
                            ]}>
                            {cell.dayLabel}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <ThemedText style={styles.selectedDateSummary}>
                  {selectedDate ? `Selected: ${formatDateLabel(selectedDate)}` : 'Select a date to load available time slots.'}
                </ThemedText>
              </>
            )}
          </View>

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Available time slots</ThemedText>
            {isLoadingAvailability ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={BrandColors.primary} />
                <ThemedText style={styles.loadingText}>Checking availability...</ThemedText>
              </View>
            ) : !selectedLocationId || !selectedDate ? (
              <ThemedText style={styles.helperText}>Select a location and date to view open time slots.</ThemedText>
            ) : !hasAvailableSlots ? (
              <ThemedText style={styles.helperText}>No open time slots for this date.</ThemedText>
            ) : (
              <View style={styles.timeSlotsGrid}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <Pressable
                      key={slot.time}
                      style={({ pressed }) => [
                        styles.timeSlotButton,
                        slot.isAvailable ? styles.timeSlotAvailable : styles.timeSlotUnavailable,
                        isSelected && styles.timeSlotSelected,
                        pressed && slot.isAvailable && styles.timeSlotPressed,
                      ]}
                      disabled={!slot.isAvailable || isSubmitting}
                      onPress={() => {
                        setSelectedTimeSlot(slot.time);
                        setSubmitErrorMessage(null);
                        setSuccessVisible(false);
                      }}>
                      <ThemedText style={[styles.timeSlotLabel, !slot.isAvailable && styles.timeSlotLabelDisabled]}>
                        {formatTimeLabel(slot.time)}
                      </ThemedText>
                      <ThemedText style={[styles.timeSlotMeta, !slot.isAvailable && styles.timeSlotLabelDisabled]}>
                        {slot.availableTables} tables
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {availabilityErrorMessage ? <ThemedText style={styles.errorText}>{availabilityErrorMessage}</ThemedText> : null}
          </View>

          <View style={styles.paymentHeaderWrap}>
            <ThemedText style={styles.paymentHeaderText}>Reservations requirement payment in full.</ThemedText>
          </View>

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Payment</ThemedText>
            <View style={styles.paymentOptionsRow}>
              {paymentMethodOptions.map((option) => {
                const isSelected = paymentMethod === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.paymentOptionButton,
                      isSelected && styles.paymentOptionButtonSelected,
                      pressed && !isSubmitting && styles.paymentOptionButtonPressed,
                    ]}
                    disabled={isSubmitting}
                    onPress={() => {
                      setPaymentMethod(option.value);
                      setSubmitErrorMessage(null);
                      setSuccessVisible(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.label} payment`}>
                    <Image source={option.image} style={styles.paymentOptionImage} contentFit="contain" />
                    {isSelected ? (
                      <View style={styles.paymentSelectedBadge}>
                        <Check color="#ffffff" size={12} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.reserveButton,
              pressed && styles.reserveButtonPressed,
              (isSubmitting || !selectedLocationId || !selectedDate || !selectedTimeSlot || !paymentMethod) && styles.reserveButtonDisabled,
            ]}
            disabled={isSubmitting || !selectedLocationId || !selectedDate || !selectedTimeSlot || !paymentMethod}
            onPress={handleReserve}>
            {isSubmitting ? (
              <View style={styles.loadingRowInline}>
                <ActivityIndicator color="#ffffff" />
                <ThemedText style={styles.reserveButtonText}>Saving reservation...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.reserveButtonText}>Reserve My Spot</ThemedText>
            )}
          </Pressable>

          {submitErrorMessage ? <ThemedText style={styles.errorText}>{submitErrorMessage}</ThemedText> : null}

          {isSuccessVisible ? (
            <View style={styles.successWrap}>
              <CheckCircle2 color={BrandColors.primary} size={84} strokeWidth={2.25} />
              <ThemedText style={styles.successText}>Payment processed successfully. Your reservation has been saved!</ThemedText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.secondary,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 36,
  },
  title: {
    color: BrandColors.darkAccent,
  },
  subtitle: {
    color: BrandColors.text,
    marginTop: -4,
  },
  card: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 12,
  },
  fieldBlock: {
    gap: 7,
  },
  fieldLabel: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownTriggerDisabled: {
    opacity: 0.6,
  },
  dropdownTriggerPressed: {
    backgroundColor: '#f7f3ec',
  },
  dropdownValue: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  dropdownPlaceholder: {
    color: '#8d7d70',
    fontWeight: '500',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownOptionPressed: {
    backgroundColor: '#f4f1eb',
  },
  dropdownOptionText: {
    color: BrandColors.text,
    fontSize: 14,
  },
  emptyDropdownText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#8d7d70',
    fontSize: 13,
  },
  calendarWrap: {
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNavButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#fffdf9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavButtonDisabled: {
    opacity: 0.45,
  },
  calendarNavButtonPressed: {
    opacity: 0.8,
  },
  calendarMonthLabel: {
    color: BrandColors.darkAccent,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarWeekdayRow: {
    flexDirection: 'row',
  },
  calendarWeekdayLabel: {
    width: '14.285%',
    textAlign: 'center',
    color: '#8d7d70',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  calendarDay: {
    width: '14.285%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDayDisabled: {
    backgroundColor: '#f7f3ec',
  },
  calendarDaySelected: {
    backgroundColor: '#eafbf3',
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  calendarDayPressed: {
    opacity: 0.82,
  },
  calendarDayLabel: {
    color: BrandColors.darkAccent,
    fontSize: 13,
    fontWeight: '600',
  },
  calendarDayLabelDisabled: {
    color: '#b4a79a',
  },
  calendarDayLabelSelected: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  selectedDateSummary: {
    color: '#7c6e63',
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  loadingRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: BrandColors.text,
  },
  helperText: {
    color: '#7c6e63',
    fontSize: 13,
  },
  errorText: {
    color: '#9e1a1a',
    fontSize: 12,
    lineHeight: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    width: '31%',
    minWidth: 96,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  timeSlotAvailable: {
    borderColor: BrandColors.accent,
    backgroundColor: '#fffdf9',
  },
  timeSlotUnavailable: {
    borderColor: '#d8d2ca',
    backgroundColor: '#f4f1eb',
  },
  timeSlotSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#eafbf3',
  },
  timeSlotPressed: {
    transform: [{ scale: 0.98 }],
  },
  timeSlotLabel: {
    color: BrandColors.darkAccent,
    fontSize: 12,
    fontWeight: '700',
  },
  timeSlotMeta: {
    color: BrandColors.text,
    fontSize: 11,
  },
  timeSlotLabelDisabled: {
    color: '#9a8f84',
  },
  paymentHeaderWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    backgroundColor: '#f7f3ec',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  paymentHeaderText: {
    color: BrandColors.darkAccent,
    fontWeight: '700',
    fontSize: 13,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  paymentOptionButton: {
    width: '23%',
    position: 'relative',
    height: 92,
    borderWidth: 1,
    borderColor: BrandColors.accent,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  paymentOptionButtonSelected: {
    borderColor: '#16a34a',
  },
  paymentOptionButtonPressed: {
    opacity: 0.84,
  },
  paymentOptionImage: {
    width: '72%',
    height: '58%',
  },
  paymentSelectedBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  reserveButtonPressed: {
    opacity: 0.9,
  },
  reserveButtonDisabled: {
    opacity: 0.55,
  },
  reserveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  successWrap: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bde8cb',
    backgroundColor: '#f0fff5',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  successText: {
    color: '#197d3f',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
