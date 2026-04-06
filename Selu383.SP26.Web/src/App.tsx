import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  CircleUserRound,
  LoaderCircle,
  Minus,
  Plus,
  Square,
  SquareCheck,
  ShoppingCart,
  ThumbsUp,
  X,
} from "lucide-react";
import "./index.css";
import logo from "./assets/logo-round.png";
import coffeeBag from "./assets/coffee bag.png";
import icedLateImg from "./assets/iced late.png";
import supernovaImg from "./assets/supernova.png";
import roaringFrappeImg from "./assets/roaring frappe.png";
import blackWhiteColdBrewImg from "./assets/black white cold brew.png";
import strawberryLimeadeImg from "./assets/strawberry limeade.png";
import shakenLemonadeImg from "./assets/shaken lemonade.png";
import manninoHoneyCrepeImg from "./assets/mannino honey crepe.png";
import downtownerImg from "./assets/downtowner.png";
import funkyMonkeyImg from "./assets/funky monkey.png";
import leSmoresImg from "./assets/le smores.png";
import strawberryFieldsImg from "./assets/strawberry fields.png";
import bonjourImg from "./assets/bonjour.png";
import bananaFosterImg from "./assets/banana foster.png";
import mattsScrambledEggsImg from "./assets/matts scrambled eggs.png";
import meanieMushroomImg from "./assets/meanie mushroom.png";
import turkeyClubImg from "./assets/turkey club.png";
import greenMachineImg from "./assets/green machine.png";
import perfectPairImg from "./assets/perfect pair.png";
import crepeFromageImg from "./assets/crepe fromage.png";
import farmersMarketImg from "./assets/farmers market.png";
import travisSpecialImg from "./assets/travis special.png";
import cremeBrulagleImg from "./assets/creme brulagle.png";
import fancyOneImg from "./assets/fancy one.png";
import breakfastBagelImg from "./assets/breakfast bagel.png";
import classicImg from "./assets/classic.png";

const menuItemImages: Record<string, string> = {
  "Iced Latte": icedLateImg,
  Supernova: supernovaImg,
  "Roaring Frappe": roaringFrappeImg,
  "Black & White Cold Brew": blackWhiteColdBrewImg,
  "Strawberry Limeade": strawberryLimeadeImg,
  "Shaken Lemonade": shakenLemonadeImg,
  "Mannino Honey Crepe": manninoHoneyCrepeImg,
  Downtowner: downtownerImg,
  "Funky Monkey": funkyMonkeyImg,
  "Le S'mores": leSmoresImg,
  "Strawberry Fields": strawberryFieldsImg,
  Bonjour: bonjourImg,
  "Banana Foster": bananaFosterImg,
  "Matt's Scrambled Eggs": mattsScrambledEggsImg,
  "Meanie Mushroom": meanieMushroomImg,
  "Turkey Club": turkeyClubImg,
  "Green Machine": greenMachineImg,
  "Perfect Pair": perfectPairImg,
  "Crepe Fromage": crepeFromageImg,
  "Farmers Market Crepe": farmersMarketImg,
  "Travis Special": travisSpecialImg,
  "Creme Brulagel": cremeBrulagleImg,
  "Crème Brulagel": cremeBrulagleImg,
  "CrÃ¨me Brulagel": cremeBrulagleImg,
  "The Fancy One": fancyOneImg,
  "Breakfast Bagel": breakfastBagelImg,
  "The Classic": classicImg,
};

const withMenuImages = (
  items: Array<{ name: string; description: string; price: string }>,
) =>
  items.map((item) => ({
    ...item,
    image: menuItemImages[item.name] ?? coffeeBag,
  }));

const featuredDrinks = withMenuImages([
  {
    name: "Iced Latte",
    description:
      "Espresso and milk served over ice for a refreshing coffee drink.",
    price: "$5.50",
  },
  {
    name: "Strawberry Fields",
    description:
      "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
    price: "$10.00",
  },
  {
    name: "Travis Special",
    description:
      "Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.",
    price: "$14.00",
  },
]);

const drinks = withMenuImages([
  {
    name: "Iced Latte",
    description:
      "Espresso and milk served over ice for a refreshing coffee drink.",
    price: "$5.50",
  },
  {
    name: "Supernova",
    description:
      "A unique coffee blend with a complex, balanced profile and subtle sweetness. Delicious as espresso or paired with milk.",
    price: "$7.95",
  },
  {
    name: "Roaring Frappe",
    description:
      "Cold brew, milk, and ice blended together with a signature syrup or flavor, topped with whipped cream.",
    price: "$6.20",
  },
  {
    name: "Black & White Cold Brew",
    description:
      "Cold brew made with both dark and light roast beans, finished with a drizzle of condensed milk.",
    price: "$5.15",
  },
  {
    name: "Strawberry Limeade",
    description:
      "Fresh lime juice blended with strawberry purée for a refreshing, tangy drink.",
    price: "$5.00",
  },
  {
    name: "Shaken Lemonade",
    description:
      "Fresh lemon juice and simple syrup vigorously shaken for a bright, refreshing lemonade.",
    price: "$5.00",
  },
]);

const sweetCrepes = withMenuImages([
  {
    name: "Mannino Honey Crepe",
    description:
      "A sweet crepe drizzled with Mannino honey and topped with mixed berries.",
    price: "$10.00",
  },
  {
    name: "Downtowner",
    description:
      "Strawberries and bananas wrapped in a crepe, finished with Nutella and Hershey's chocolate sauce.",
    price: "$10.75",
  },
  {
    name: "Funky Monkey",
    description:
      "Nutella and bananas wrapped in a crepe, served with whipped cream.",
    price: "$10.00",
  },
  {
    name: "Le S'mores",
    description:
      "Marshmallow cream and chocolate sauce inside a crepe, topped with graham cracker crumbs.",
    price: "$9.50",
  },
  {
    name: "Strawberry Fields",
    description:
      "Fresh strawberries with Hershey's chocolate drizzle and a dusting of powdered sugar.",
    price: "$10.00",
  },
  {
    name: "Bonjour",
    description:
      "A sweet crepe filled with syrup and cinnamon, finished with powdered sugar.",
    price: "$8.50",
  },
  {
    name: "Banana Foster",
    description:
      "Bananas with cinnamon in a crepe, topped with a generous drizzle of caramel sauce.",
    price: "$8.95",
  },
]);

const savoryCrepes = withMenuImages([
  {
    name: "Matt's Scrambled Eggs",
    description:
      "Scrambled eggs and melted mozzarella cheese wrapped in a crepe.",
    price: "$5.00",
  },
  {
    name: "Meanie Mushroom",
    description:
      "Sautéed mushrooms, mozzarella, tomato, and bacon inside a delicate crepe.",
    price: "$10.50",
  },
  {
    name: "Turkey Club",
    description:
      "Sliced turkey, bacon, spinach, and tomato wrapped in a savory crepe.",
    price: "$10.50",
  },
  {
    name: "Green Machine",
    description:
      "Spinach, artichokes, and mozzarella cheese inside a fresh crepe.",
    price: "$10.00",
  },
  {
    name: "Perfect Pair",
    description:
      "A unique combination of bacon and Nutella wrapped in a crepe.",
    price: "$10.00",
  },
  {
    name: "Crepe Fromage",
    description: "A savory crepe filled with a blend of cheeses.",
    price: "$8.00",
  },
  {
    name: "Farmers Market Crepe",
    description:
      "Turkey, spinach, and mozzarella wrapped in a savory crepe.",
    price: "$10.50",
  },
]);

const bagels = withMenuImages([
  {
    name: "Travis Special",
    description:
      "Cream cheese, salmon, spinach, and a fried egg served on a freshly toasted bagel.",
    price: "$14.00",
  },
  {
    name: "Crème Brulagel",
    description:
      "A toasted bagel with a caramelized sugar crust inspired by crème brûlée, served with cream cheese.",
    price: "$8.00",
  },
  {
    name: "The Fancy One",
    description:
      "Smoked salmon, cream cheese, and fresh dill on a toasted bagel.",
    price: "$13.00",
  },
  {
    name: "Breakfast Bagel",
    description:
      "A toasted bagel with your choice of ham, bacon, or sausage, a fried egg, and cheddar cheese.",
    price: "$9.50",
  },
  {
    name: "The Classic",
    description: "A toasted bagel with cream cheese.",
    price: "$5.25",
  },
]);

const allMenuItems = [...drinks, ...sweetCrepes, ...savoryCrepes, ...bagels];

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
};

type AuthenticationUserDto = {
  id: number;
  userName: string;
  roles: string[];
};

type LocationDto = {
  id: number;
  name: string;
  address: string;
  tableCount: number;
  managerId?: number | null;
};

type CartSummaryItem = {
  name: string;
  description: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

const defaultApiBaseUrl = "";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl =
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : defaultApiBaseUrl;

const pickupOptions = ["In Store", "Drive Through"] as const;
const paymentPlaceholder = "Integrate 3rd Party Payment Processing Here";

const parsePrice = (value: string) =>
  Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

const menuItemByName = new Map(
  allMenuItems.map((item) => [
    item.name,
    { ...item, unitPrice: parsePrice(item.price) },
  ]),
);

const buildApiUrl = (path: string) =>
  `${apiBaseUrl.replace(/\/$/, "")}${path}`;

function MenuCard({
  item,
  isSelected,
  onToggle,
}: {
  item: MenuItem;
  isSelected: boolean;
  onToggle: (itemName: string) => void;
}) {
  return (
    <article className="menu-card">
      <div className="menu-card-body">
        <img src={item.image} alt={item.name} className="menu-card-image" />
        <div className="menu-card-content">
          <div className="menu-card-top">
            <h3>{item.name}</h3>
            <span>{item.price}</span>
          </div>
          <p>{item.description}</p>
          <div className="menu-card-actions">
            <button
              type="button"
              className="menu-item-toggle"
              onClick={() => onToggle(item.name)}
              aria-label={`${isSelected ? "Remove" : "Add"} ${item.name} ${
                isSelected ? "from" : "to"
              } cart`}
            >
              {isSelected ? <SquareCheck size={20} /> : <Square size={20} />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [cartItemsByName, setCartItemsByName] = useState<Record<string, number>>(
    {},
  );
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [locationsErrorMessage, setLocationsErrorMessage] = useState<string | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");
  const [pickupType, setPickupType] =
    useState<(typeof pickupOptions)[number]>("In Store");
  const [paymentMethod, setPaymentMethod] = useState(paymentPlaceholder);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [orderSuccessMessageVisible, setOrderSuccessMessageVisible] =
    useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeDeltaX = useRef(0);
  const closeCheckoutTimer = useRef<number | null>(null);
  const authControlRef = useRef<HTMLDivElement | null>(null);
  const cartSummaryItems: CartSummaryItem[] = Object.entries(cartItemsByName)
    .map(([name, quantity]) => {
      const catalogItem = menuItemByName.get(name);
      if (!catalogItem || quantity < 1) {
        return null;
      }

      return {
        name: catalogItem.name,
        description: catalogItem.description,
        image: catalogItem.image,
        unitPrice: catalogItem.unitPrice,
        quantity,
      };
    })
    .filter((item): item is CartSummaryItem => item !== null);
  const cartCount = cartSummaryItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const cartSubtotal = cartSummaryItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const currentCarouselItem = allMenuItems[carouselIndex];
  const goToPreviousCarouselItem = () =>
    setCarouselIndex((previous) =>
      previous === 0 ? allMenuItems.length - 1 : previous - 1,
    );
  const goToNextCarouselItem = () =>
    setCarouselIndex((previous) => (previous + 1) % allMenuItems.length);

  const previousCarouselItem =
    allMenuItems[(carouselIndex - 1 + allMenuItems.length) % allMenuItems.length];
  const nextCarouselItem = allMenuItems[(carouselIndex + 1) % allMenuItems.length];

  const resetSwipeState = () => {
    swipeStartX.current = null;
    swipeDeltaX.current = 0;
  };

  const handleSliderPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeStartX.current = event.clientX;
    swipeDeltaX.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSliderPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null) {
      return;
    }

    swipeDeltaX.current = event.clientX - swipeStartX.current;
  };

  const handleSliderPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null) {
      return;
    }

    const swipeThreshold = 42;
    if (swipeDeltaX.current <= -swipeThreshold) {
      goToNextCarouselItem();
    } else if (swipeDeltaX.current >= swipeThreshold) {
      goToPreviousCarouselItem();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetSwipeState();
  };

  const toggleAuthPopup = () => {
    setLoginErrorMessage(null);
    setIsAuthPopupOpen((previous) => !previous);
  };

  useEffect(() => {
    if (!isAuthPopupOpen) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (authControlRef.current?.contains(target)) {
        return;
      }

      setIsAuthPopupOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isAuthPopupOpen]);

  const isInCart = (itemName: string) => (cartItemsByName[itemName] ?? 0) > 0;

  const toggleCartItem = (itemName: string) => {
    setCartItemsByName((previous) => {
      const currentQuantity = previous[itemName] ?? 0;
      if (currentQuantity > 0) {
        const { [itemName]: _, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [itemName]: 1,
      };
    });
  };

  const incrementCartItem = (itemName: string) => {
    setCartItemsByName((previous) => ({
      ...previous,
      [itemName]: (previous[itemName] ?? 0) + 1,
    }));
  };

  const decrementCartItem = (itemName: string) => {
    setCartItemsByName((previous) => {
      const currentQuantity = previous[itemName] ?? 0;
      if (currentQuantity <= 1) {
        const { [itemName]: _, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [itemName]: currentQuantity - 1,
      };
    });
  };

  const removeCartItem = (itemName: string) => {
    setCartItemsByName((previous) => {
      if (!(itemName in previous)) {
        return previous;
      }
      const { [itemName]: _, ...rest } = previous;
      return rest;
    });
  };

  const clearCart = () => {
    setCartItemsByName({});
  };

  const closeCartAndCheckout = () => {
    if (closeCheckoutTimer.current !== null) {
      window.clearTimeout(closeCheckoutTimer.current);
      closeCheckoutTimer.current = null;
    }
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(false);
    setOrderErrorMessage(null);
    setOrderSuccessMessageVisible(false);
  };

  const handleKeepShopping = () => {
    setIsCartModalOpen(false);
    window.location.hash = "#drinks";
  };

  const fetchLocations = async () => {
    setIsLocationsLoading(true);
    setLocationsErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl("/api/locations"), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Locations request failed (${response.status})`);
      }

      const locationResults = (await response.json()) as LocationDto[];
      setLocations(locationResults);
      setSelectedLocationId((current) => {
        if (
          current !== "" &&
          locationResults.some((location) => location.id === current)
        ) {
          return current;
        }

        return locationResults[0]?.id ?? "";
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load locations";
      setLocationsErrorMessage(message);
    } finally {
      setIsLocationsLoading(false);
    }
  };

  const openCheckoutModal = () => {
    setOrderErrorMessage(null);
    setOrderSuccessMessageVisible(false);
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(true);
    void fetchLocations();
  };

  const handleSubmitOrder = async () => {
    if (isSubmittingOrder || cartSummaryItems.length === 0) {
      return;
    }

    if (selectedLocationId === "") {
      setOrderErrorMessage("Please select a location.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl("/api/orders"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: selectedLocationId,
          pickupType,
          paymentMethod,
          total: Number(cartSubtotal.toFixed(2)),
          items: cartSummaryItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice.toFixed(2)),
          })),
        }),
      });

      if (!response.ok) {
        let message = `Order failed (${response.status})`;
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

      setOrderSuccessMessageVisible(true);
      if (closeCheckoutTimer.current !== null) {
        window.clearTimeout(closeCheckoutTimer.current);
      }
      closeCheckoutTimer.current = window.setTimeout(() => {
        clearCart();
        closeCartAndCheckout();
        closeCheckoutTimer.current = null;
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order failed";
      setOrderErrorMessage(message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(
    () => () => {
      if (closeCheckoutTimer.current !== null) {
        window.clearTimeout(closeCheckoutTimer.current);
      }
    },
    [],
  );

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingLogin) {
      return;
    }

    setIsSubmittingLogin(true);
    setLoginErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl("/api/authentication/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: loginUserName.trim(),
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        let message = `Login failed (${response.status})`;
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

      const user = (await response.json()) as AuthenticationUserDto;
      setLoggedInUserName(user.userName);
      setLoginPassword("");
      setIsAuthPopupOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setLoginErrorMessage(message);
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Caffeinated Lions logo" className="brand-logo" />
          <span>Caffeinated Lions</span>
        </div>

        <div className="nav-area">
          <div className="nav-menu">
            <nav className="nav-links">
              <a href="#featured">Featured</a>
              <a href="#drinks">Drinks</a>
              <a href="#food">Food</a>
              <a href="#about">About</a>
            </nav>
          </div>

          <div className="nav-actions">
            <div className="auth-control" ref={authControlRef}>
              <button
                type="button"
                className="icon-button"
                onClick={toggleAuthPopup}
                aria-label="Open account login"
                aria-expanded={isAuthPopupOpen}
              >
                <CircleUserRound size={24} />
              </button>
              {loggedInUserName ? (
                <span className="auth-user-name">{loggedInUserName}</span>
              ) : null}

              {isAuthPopupOpen ? (
                <form
                  className="auth-popup"
                  onSubmit={(event) => {
                    void handleLoginSubmit(event);
                  }}
                >
                  <label className="auth-field">
                    <span>Username</span>
                    <input
                      type="text"
                      value={loginUserName}
                      onChange={(event) => setLoginUserName(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmittingLogin}
                  >
                    {isSubmittingLogin ? "Signing In..." : "Login"}
                  </button>
                  {loginErrorMessage ? (
                    <p className="auth-error">{loginErrorMessage}</p>
                  ) : null}
                </form>
              ) : null}
            </div>

            <button
              type="button"
              className="icon-button cart-icon-button"
              aria-label="Open shopping cart"
              onClick={() => setIsCartModalOpen(true)}
            >
              <ShoppingCart size={24} />
              <span className="cart-count-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="hero-kicker">Bold Coffee. Lion Energy.</p>
            <h1>Welcome to Caffeinated Lions</h1>
            <p className="hero-description">
              Crafted coffee, fresh crepes, and toasted bagels served with a
              bold personality. Inspired by the clean, modern feel of a premium
              coffeehouse.
            </p>

            <div className="hero-buttons">
              <a href="#drinks" className="primary-btn">
                View Menu
              </a>
              <a href="#food" className="secondary-btn">
                Explore Food
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-carousel">
              <div
                className="hero-slider"
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                onPointerCancel={resetSwipeState}
                role="region"
                aria-label="Menu item slider. Swipe left or right to browse."
              >
                <div className="hero-slide hero-slide-side" aria-hidden="true">
                  <img
                    src={previousCarouselItem.image}
                    alt=""
                    className="hero-slide-image"
                  />
                  <p className="hero-slide-label">{previousCarouselItem.name}</p>
                </div>
                <div className="hero-slide hero-slide-current">
                  <img
                    src={currentCarouselItem.image}
                    alt={currentCarouselItem.name}
                    className="hero-slide-image"
                  />
                  <p className="hero-slide-label">{currentCarouselItem.name}</p>
                </div>
                <div className="hero-slide hero-slide-side" aria-hidden="true">
                  <img src={nextCarouselItem.image} alt="" className="hero-slide-image" />
                  <p className="hero-slide-label">{nextCarouselItem.name}</p>
                </div>
              </div>
              <div className="hero-carousel-controls">
                <button
                  type="button"
                  className="hero-carousel-btn"
                  onClick={goToPreviousCarouselItem}
                  aria-label="Show previous menu item"
                >
                  <ChevronsLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hero-carousel-btn"
                  onClick={goToNextCarouselItem}
                  aria-label="Show next menu item"
                >
                  <ChevronsRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="promo-strip">
          <div className="promo-box">
            <p className="section-label">Our Favorites</p>
            <h2>Customer picks made fresh every day</h2>
            <p>
              From signature cold brews to sweet crepes and toasted bagels,
              Caffeinated Lions brings together comfort and energy in every
              order.
            </p>
          </div>
        </section>

        <section className="featured-section" id="featured">
          <div className="section-heading">
            <p className="section-label">Featured Items</p>
            <h2>Popular picks to start with</h2>
          </div>

          <div className="featured-grid">
            {featuredDrinks.map((drink) => (
              <div className="featured-card" key={drink.name}>
                <div className="featured-card-main">
                  <img src={drink.image} alt={drink.name} className="featured-image" />
                  <div className="featured-content">
                    <div className="featured-top">
                      <h3>{drink.name}</h3>
                      <span>{drink.price}</span>
                    </div>
                    <p>{drink.description}</p>
                  </div>
                </div>
                <div className="featured-card-actions">
                  <button
                    type="button"
                    className="menu-item-toggle"
                    onClick={() => toggleCartItem(drink.name)}
                    aria-label={`${isInCart(drink.name) ? "Remove" : "Add"} ${
                      drink.name
                    } ${isInCart(drink.name) ? "from" : "to"} cart`}
                  >
                    {isInCart(drink.name) ? (
                      <SquareCheck size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="menu-section" id="drinks">
          <div className="section-heading">
            <p className="section-label">Drinks</p>
            <h2>Handcrafted favorites</h2>
          </div>
          <div className="menu-grid">
            {drinks.map((item) => (
              <MenuCard
                key={item.name}
                item={item}
                isSelected={isInCart(item.name)}
                onToggle={toggleCartItem}
              />
            ))}
          </div>
        </section>

        <section className="menu-section" id="food">
          <div className="section-heading">
            <p className="section-label">Sweet Crepes</p>
            <h2>Sweet, warm, and indulgent</h2>
          </div>
          <div className="menu-grid">
            {sweetCrepes.map((item) => (
              <MenuCard
                key={item.name}
                item={item}
                isSelected={isInCart(item.name)}
                onToggle={toggleCartItem}
              />
            ))}
          </div>
        </section>

        <section className="menu-section">
          <div className="section-heading">
            <p className="section-label">Savory Crepes</p>
            <h2>Fresh and filling choices</h2>
          </div>
          <div className="menu-grid">
            {savoryCrepes.map((item) => (
              <MenuCard
                key={item.name}
                item={item}
                isSelected={isInCart(item.name)}
                onToggle={toggleCartItem}
              />
            ))}
          </div>
        </section>

        <section className="menu-section">
          <div className="section-heading">
            <p className="section-label">Bagels</p>
            <h2>Toasted classics and specialties</h2>
          </div>
          <div className="menu-grid">
            {bagels.map((item) => (
              <MenuCard
                key={item.name}
                item={item}
                isSelected={isInCart(item.name)}
                onToggle={toggleCartItem}
              />
            ))}
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-box">
            <p className="section-label">Our Style</p>
            <h2>Simple, bold, and built around great coffee</h2>
            <p>
              Caffeinated Lions blends strong branding with a welcoming café
              experience. Our goal is to serve drinks and food that feel
              elevated, familiar, and worth coming back for.
            </p>
          </div>
        </section>
      </main>

      {isCartModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          onClick={() => setIsCartModalOpen(false)}
        >
          <div className="cart-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cart-modal-header">
              <h2>Cart</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close shopping cart"
                onClick={() => setIsCartModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {cartSummaryItems.length === 0 ? (
              <p className="cart-empty-state">
                Your cart is empty. Add items from the menu to continue.
              </p>
            ) : (
              <div className="cart-summary-list">
                {cartSummaryItems.map((item) => (
                  <article className="cart-summary-item" key={item.name}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-summary-image"
                    />
                    <div className="cart-summary-body">
                      <div className="cart-summary-head">
                        <h3>{item.name}</h3>
                        <button
                          type="button"
                          className="cart-remove-item-btn"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeCartItem(item.name)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p>{item.description}</p>
                      <div className="cart-summary-meta">
                        <strong>
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </strong>
                        <div className="cart-quantity-controls">
                          <button
                            type="button"
                            className="quantity-btn"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => decrementCartItem(item.name)}
                          >
                            <Minus size={16} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-btn"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => incrementCartItem(item.name)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="cart-subtotal-row">
              <span>Subtotal:</span>
              <strong>${cartSubtotal.toFixed(2)}</strong>
            </div>

            <div className="cart-modal-actions">
              <button
                type="button"
                className="secondary-btn cart-action-btn"
                onClick={handleKeepShopping}
              >
                Keep Shopping
              </button>
              <button
                type="button"
                className="primary-btn cart-action-btn"
                onClick={openCheckoutModal}
                disabled={cartSummaryItems.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isCheckoutModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
          onClick={closeCartAndCheckout}
        >
          <div
            className="checkout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Checkout</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close checkout"
                onClick={closeCartAndCheckout}
              >
                <X size={18} />
              </button>
            </div>

            {orderSuccessMessageVisible ? (
              <div className="checkout-success">
                <ThumbsUp size={40} />
                <p>Order placed.</p>
              </div>
            ) : (
              <>
                <div className="checkout-total-row">
                  <span>Your order total:</span>
                  <strong>${cartSubtotal.toFixed(2)}</strong>
                </div>

                <label className="checkout-field">
                  <span>Select your location:</span>
                  <select
                    value={selectedLocationId}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSelectedLocationId(nextValue === "" ? "" : Number(nextValue));
                    }}
                    disabled={
                      isLocationsLoading ||
                      isSubmittingOrder ||
                      locations.length === 0
                    }
                  >
                    {isLocationsLoading ? (
                      <option value="">Loading locations...</option>
                    ) : null}
                    {!isLocationsLoading && locations.length === 0 ? (
                      <option value="">No locations available</option>
                    ) : null}
                    {!isLocationsLoading
                      ? locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))
                      : null}
                  </select>
                </label>
                {locationsErrorMessage ? (
                  <p className="checkout-error">{locationsErrorMessage}</p>
                ) : null}

                <label className="checkout-field">
                  <span>Pickup:</span>
                  <select
                    value={pickupType}
                    onChange={(event) =>
                      setPickupType(event.target.value as (typeof pickupOptions)[number])
                    }
                    disabled={isSubmittingOrder}
                  >
                    {pickupOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="checkout-field">
                  <span>Payment:</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    disabled={isSubmittingOrder}
                  >
                    <option value={paymentPlaceholder}>{paymentPlaceholder}</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="primary-btn checkout-order-btn"
                  onClick={() => {
                    void handleSubmitOrder();
                  }}
                  disabled={
                    isSubmittingOrder ||
                    isLocationsLoading ||
                    selectedLocationId === "" ||
                    cartSummaryItems.length === 0
                  }
                >
                  {isSubmittingOrder ? (
                    <>
                      <LoaderCircle size={16} className="spinning-icon" />
                      Processing Order...
                    </>
                  ) : (
                    "Order"
                  )}
                </button>
                {orderErrorMessage ? (
                  <p className="checkout-error">{orderErrorMessage}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <footer className="footer">
        <p>© 2026 Caffeinated Lions. Brewed with pride.</p>
      </footer>
    </div>
  );
}

export default App;
