import { HeartOff, Square, SquareCheck } from "lucide-react";
import { useEffect, useState } from "react";

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
  items: OrderHistoryItemDto[];
};

type CustomerPageProps = {
  userName: string;
  pridePoints: number;
  featuredItems: FeaturedMenuItem[];
  isInCart: (itemName: string) => boolean;
  onToggleCartItem: (itemName: string) => void;
  buildApiUrl: (path: string) => string;
  resolveMenuItemImage: (itemName: string) => string;
};

const levels = [1, 2, 3, 4, 5];
const emptyFavoriteSlots = [0, 1, 2];

const getCompletedLevels = (pridePoints: number) => {
  if (pridePoints < 0) {
    return 0;
  }
  if (pridePoints <= 100) {
    return 1;
  }
  if (pridePoints <= 200) {
    return 2;
  }
  if (pridePoints <= 300) {
    return 3;
  }
  if (pridePoints <= 400) {
    return 4;
  }
  return 5;
};

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

export default function CustomerPage({
  userName,
  pridePoints,
  featuredItems,
  isInCart,
  onToggleCartItem,
  buildApiUrl,
  resolveMenuItemImage,
}: CustomerPageProps) {
  const [recentOrders, setRecentOrders] = useState<OrderHistoryDto[]>([]);
  const [isLoadingOrderHistory, setIsLoadingOrderHistory] = useState(false);
  const completedLevels = getCompletedLevels(pridePoints);

  useEffect(() => {
    let isMounted = true;

    const loadOrderHistory = async () => {
      setIsLoadingOrderHistory(true);

      try {
        const response = await fetch(buildApiUrl("/api/orders/history"), {
          credentials: "include",
        });

        if (response.status === 401) {
          if (isMounted) {
            setRecentOrders([]);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Order history request failed (${response.status})`);
        }

        const orderHistory = (await response.json()) as OrderHistoryDto[];
        if (!isMounted) {
          return;
        }

        setRecentOrders(orderHistory.slice(0, 3));
      } catch {
        if (!isMounted) {
          return;
        }

        setRecentOrders([]);
      } finally {
        if (isMounted) {
          setIsLoadingOrderHistory(false);
        }
      }
    };

    void loadOrderHistory();

    return () => {
      isMounted = false;
    };
  }, [buildApiUrl]);

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
            <h2>ORDER AGAIN!</h2>

            {isLoadingOrderHistory ? (
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
        </div>
      </section>
    </main>
  );
}
