import { HeartOff, RefreshCw, Square, SquareCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FeaturedMenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
};

type OrderHistoryItemDto = {
  menuItemId: number;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
};

type OrderHistoryDto = {
  id: number;
  orderedAt: string;
  total: number;
  status?: string;
  orderStatus?: string;
  items: OrderHistoryItemDto[];
};

type ReservationDto = {
  id: number;
  locationId: number;
  date: string;
  time: string;
};

type LocationDto = {
  id: number;
  name?: string | null;
  address?: string | null;
};

type UpcomingReservation = {
  id: number;
  locationLabel: string;
  dateTimeLabel: string;
};

type CustomerPageProps = {
  userName: string;
  pridePoints: number;
  featuredItems: FeaturedMenuItem[];
  isInCart: (itemName: string) => boolean;
  onToggleCartItem: (itemName: string) => void;
  onOrderAgain: (order: OrderHistoryDto) => void;
  buildApiUrl: (path: string) => string;
  resolveMenuItemImage: (itemName: string) => string;
};

const levels = [1, 2, 3, 4, 5];
const emptyFavoriteSlots = [0, 1, 2];
const centralTimeZone = "America/Chicago";

const getCompletedLevels = (pridePoints: number) => {
  if (pridePoints <= 0) {
    return 0;
  }
  if (pridePoints <= 1000) {
    return 1;
  }
  if (pridePoints <= 2000) {
    return 2;
  }
  if (pridePoints <= 3000) {
    return 3;
  }
  if (pridePoints <= 4000) {
    return 4;
  }
  return 5;
};

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    timeZone: centralTimeZone,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

const parseReservationDateTime = (dateText: string, timeText: string) => {
  const datePart = dateText.split("T")[0]?.trim();
  const timePart = timeText.trim();
  if (!datePart || !timePart) {
    return null;
  }

  const timeTokens = timePart.split(":");
  if (timeTokens.length < 2) {
    return null;
  }

  const hour = String(timeTokens[0] ?? "").padStart(2, "0");
  const minute = String(timeTokens[1] ?? "").padStart(2, "0");
  const second = String(timeTokens[2] ?? "00")
    .padStart(2, "0")
    .slice(0, 2);

  const parsed = new Date(`${datePart}T${hour}:${minute}:${second}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatReservationDateTime = (dateValue: Date) =>
  dateValue.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function CustomerPage({
  userName,
  pridePoints,
  featuredItems,
  isInCart,
  onToggleCartItem,
  onOrderAgain,
  buildApiUrl,
  resolveMenuItemImage,
}: CustomerPageProps) {
  const [recentOrders, setRecentOrders] = useState<OrderHistoryDto[]>([]);
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false);
  const [isRefreshingOrderHistory, setIsRefreshingOrderHistory] = useState(false);
  const [upcomingReservations, setUpcomingReservations] = useState<
    UpcomingReservation[]
  >([]);
  const [isLoadingUpcomingReservations, setIsLoadingUpcomingReservations] =
    useState(false);
  const completedLevels = getCompletedLevels(pridePoints);

  const loadOrderHistory = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") {
        setIsLoadingOrderHistory(true);
      } else {
        setIsRefreshingOrderHistory(true);
      }

      try {
        const response = await fetch(buildApiUrl("/api/orders/history"), {
          credentials: "include",
        });

        if (response.status === 401) {
          setRecentOrders([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Order history request failed (${response.status})`);
        }

        const orderHistory = (await response.json()) as OrderHistoryDto[];
        setRecentOrders(orderHistory.slice(0, 3));
      } catch {
        if (mode === "initial") {
          setRecentOrders([]);
        }
      } finally {
        if (mode === "initial") {
          setIsLoadingOrderHistory(false);
        } else {
          setIsRefreshingOrderHistory(false);
        }
      }
    },
    [buildApiUrl],
  );

  useEffect(() => {
    void loadOrderHistory("initial");
  }, [loadOrderHistory, userName]);

  useEffect(() => {
    let isMounted = true;

    const loadUpcomingReservations = async () => {
      setIsLoadingUpcomingReservations(true);
      try {
        const [reservationsResponse, locationsResponse] = await Promise.all([
          fetch(buildApiUrl("/api/reservations"), {
            credentials: "include",
          }),
          fetch(buildApiUrl("/api/locations"), {
            credentials: "include",
          }),
        ]);

        if (reservationsResponse.status === 401 || locationsResponse.status === 401) {
          if (isMounted) {
            setUpcomingReservations([]);
          }
          return;
        }

        if (!reservationsResponse.ok) {
          throw new Error(
            `Reservations request failed (${reservationsResponse.status})`,
          );
        }

        if (!locationsResponse.ok) {
          throw new Error(`Locations request failed (${locationsResponse.status})`);
        }

        const reservations = (await reservationsResponse.json()) as ReservationDto[];
        const locations = (await locationsResponse.json()) as LocationDto[];
        if (!isMounted) {
          return;
        }

        const locationLookup = new Map(
          locations.map((location) => [
            location.id,
            location.address?.trim() ||
              location.name?.trim() ||
              `Location ${location.id}`,
          ]),
        );
        const now = new Date();

        const upcoming = reservations
          .map((reservation) => {
            const parsedDateTime = parseReservationDateTime(
              reservation.date,
              reservation.time,
            );
            if (!parsedDateTime) {
              return null;
            }

            return {
              id: reservation.id,
              sortKey: parsedDateTime.getTime(),
              locationLabel:
                locationLookup.get(reservation.locationId) ??
                `Location ${reservation.locationId}`,
              dateTimeLabel: formatReservationDateTime(parsedDateTime),
            };
          })
          .filter(
            (
              reservation,
            ): reservation is {
              id: number;
              sortKey: number;
              locationLabel: string;
              dateTimeLabel: string;
            } => !!reservation && reservation.sortKey >= now.getTime(),
          )
          .sort((a, b) => a.sortKey - b.sortKey)
          .slice(0, 10)
          .map((reservation) => ({
            id: reservation.id,
            locationLabel: reservation.locationLabel,
            dateTimeLabel: reservation.dateTimeLabel,
          }));

        setUpcomingReservations(upcoming);
      } catch {
        if (!isMounted) {
          return;
        }

        setUpcomingReservations([]);
      } finally {
        if (isMounted) {
          setIsLoadingUpcomingReservations(false);
        }
      }
    };

    void loadUpcomingReservations();

    return () => {
      isMounted = false;
    };
  }, [buildApiUrl, userName]);

  return (
    <main className="customer-main">
      <section className="customer-stack-card">
        <section className="customer-hero">
          <h1>Welcome Back</h1>
          <p>{userName} - your coffee flow starts here.</p>
        </section>

        <div className="customer-stack-sections">
          <section className="customer-card">
            <h2>PRIDE POINTS: {pridePoints}</h2>
            <div className="customer-progress-track" aria-label="Pride points level progress">
              {levels.map((level) => (
                <span
                  key={level}
                  className={`customer-progress-segment ${
                    level <= completedLevels ? "active" : ""
                  }`}
                />
              ))}
            </div>
            <div className="customer-level-labels">
              {levels.map((level) => (
                <span key={level}>Level {level}</span>
              ))}
            </div>
          </section>

          <section className="customer-card">
            <div className="customer-order-again-header">
              <h2>ORDER AGAIN!</h2>
              <button
                type="button"
                className="customer-order-again-refresh-btn"
                onClick={() => void loadOrderHistory("refresh")}
                disabled={isLoadingOrderHistory || isRefreshingOrderHistory}
                aria-label="Refresh order again list"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshingOrderHistory ? "spinning-icon" : undefined}
                />
              </button>
            </div>

            {isLoadingOrderHistory && recentOrders.length === 0 ? (
              <p className="customer-helper-text">Loading your recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <div className="customer-empty-favorites-row">
                {emptyFavoriteSlots.map((slot) => (
                  <div key={slot} className="customer-empty-favorite-square">
                    <HeartOff size={24} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="customer-recent-orders-grid">
                {recentOrders.map((order) => {
                  const orderCards = order.items.slice(0, 3);
                  const useCardOffset = orderCards.length > 1;

                  return (
                    <article className="customer-order-preview" key={order.id}>
                      <button
                        type="button"
                        className="customer-order-preview-btn"
                        onClick={() => onOrderAgain(order)}
                      >
                        <div className="customer-order-hand">
                          {orderCards.map((item, index) => (
                            <div
                              key={`${order.id}-${item.menuItemId}-${index}`}
                              className="customer-hand-card"
                              style={{
                                left: useCardOffset ? `${index * 22}px` : "22px",
                                zIndex: index + 1,
                                transform: useCardOffset
                                  ? `rotate(${(index - 1) * 8}deg)`
                                  : "none",
                              }}
                            >
                              <img
                                src={
                                  item.imageUrl && /^https?:\/\//i.test(item.imageUrl)
                                    ? item.imageUrl
                                    : resolveMenuItemImage(item.name)
                                }
                                alt={item.name}
                                className="customer-hand-image"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="customer-order-date">{formatOrderDate(order.orderedAt)}</p>
                        <p className="customer-order-status">
                          {order.status ?? order.orderStatus ?? "Unknown"}
                        </p>
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="customer-card">
            <h2>FEATURED ITEMS</h2>
            <div className="customer-featured-grid">
              {featuredItems.map((item) => {
                const selected = isInCart(item.name);

                return (
                  <article key={item.name} className="customer-featured-card">
                    <div className="customer-featured-image-wrap">
                      <img src={item.image} alt={item.name} className="customer-featured-image" />
                      <button
                        type="button"
                        className="customer-featured-toggle"
                        onClick={() => onToggleCartItem(item.name)}
                        aria-label={`${selected ? "Remove" : "Add"} ${item.name} ${
                          selected ? "from" : "to"
                        } cart`}
                      >
                        {selected ? <SquareCheck size={20} /> : <Square size={20} />}
                      </button>
                    </div>
                    <div className="customer-featured-meta">
                      <h3>{item.name}</h3>
                      <p>{item.price}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="customer-card">
            <h2>UPCOMING RESERVATIONS</h2>
            {isLoadingUpcomingReservations ? (
              <p className="customer-helper-text">Loading upcoming reservations...</p>
            ) : upcomingReservations.length === 0 ? (
              <p className="customer-helper-text">No upcoming reservations.</p>
            ) : (
              <div className="customer-upcoming-reservations-list">
                {upcomingReservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="customer-upcoming-reservation-row"
                  >
                    <p className="customer-upcoming-reservation-location">
                      Location: {reservation.locationLabel}
                    </p>
                    <p className="customer-upcoming-reservation-time">
                      Time: {reservation.dateTimeLabel}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
