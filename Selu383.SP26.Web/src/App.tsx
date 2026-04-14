import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  Check,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  CircleUserRound,
  LoaderCircle,
  LogOut,
  Menu,
  Minus,
  Plus,
  Square,
  SquareCheck,
  ShoppingCart,
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
import masterpayImg from "./assets/masterpay.png";
import visapayImg from "./assets/visapay.png";
import applepayImg from "./assets/applepay.png";
import gpayImg from "./assets/gpay.png";
import CustomerPage from "./customerpage";
import EmployeeDashboard from "./EmployeeDashboard";
import ReservationsModal, { type ReservationLoginPayload } from "./reservations";
import MenuEditor from "./MenuEditor";
import ReportsPage from "./ReportsPage";

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

const sweetCrepeItemNames = new Set([
  "Mannino Honey Crepe",
  "Downtowner",
  "Funky Monkey",
  "Le S'mores",
  "Strawberry Fields",
  "Bonjour",
  "Banana Foster",
]);

const bagelItemNames = new Set([
  "Travis Special",
  "Creme Brulagel",
  "Crème Brulagel",
  "The Fancy One",
  "Breakfast Bagel",
  "The Classic",
]);

const savoryCrepeItemNames = new Set([
  "Matt's Scrambled Eggs",
  "Meanie Mushroom",
  "Turkey Club",
  "Green Machine",
  "Perfect Pair",
  "Crepe Fromage",
  "Farmers Market Crepe",
]);

const normalizeMenuItemName = (value: string) => {
  if (value.toLowerCase().includes("brulagel")) {
    return "Creme Brulagel";
  }

  return value;
};

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
};

type ApiMenuItemDto = {
  id: number;
  itemName: string;
  type: string;
  featured: boolean;
  price: number;
  description: string;
  nutrition: string;
};

type AuthenticationUserDto = {
  id: number;
  userName: string;
  pridePoints?: number;
  roles: string[];
};

type CreateUserDto = {
  userName: string;
  password: string;
  roles: string[];
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  pridePoints: number;
  hasAgreedToPolicies: boolean;
};

type AwardRewardsResultDto = {
  userId: number;
  pointsAwarded: number;
  pridePoints: number;
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

type GuestOrderReplayItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type GuestOrderReplayDraft = {
  locationId: number;
  pickupType: "In Store" | "Drive Through";
  paymentMethod: string;
  total: number;
  items: GuestOrderReplayItem[];
};

type CustomerOrderAgainItem = {
  name: string;
  quantity: number;
};

type CustomerOrderAgainPayload = {
  id: number;
  items: CustomerOrderAgainItem[];
};

type PolicyType = "terms" | "privacy" | null;

const defaultApiBaseUrl = "";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl =
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : defaultApiBaseUrl;

const pickupOptions = ["In Store", "Drive Through"] as const;
const paymentMethodOptions = [
  { value: "masterpay", label: "MasterPay", image: masterpayImg },
  { value: "visapay", label: "VisaPay", image: visapayImg },
  { value: "applepay", label: "ApplePay", image: applepayImg },
  { value: "gpay", label: "GPay", image: gpayImg },
] as const;

const parsePrice = (value: string) =>
  Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

const formatPhoneNumber = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
  }

  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
};

const menuEditorPath = "/menu-editor";
const calculateRewardPoints = (orderTotal: number) =>
  Math.max(0, Math.round(orderTotal * 10));
const rewardsCounterDurationMs = 1200;
const rewardsPopupHoldMs = 3000;

const buildApiUrl = (path: string) =>
  `${apiBaseUrl.replace(/\/$/, "")}${path}`;

const customerPagePath = "/customerpage";
const employeeDashboardPath = "/dashboard";
const reportsPath = "/reports";
const legacyReservationsPath = "/reservations";

const normalizePath = (path: string) => {
  const normalized = path.trim().toLowerCase();
  if (normalized === "" || normalized === "/") {
    return "/";
  }

  return normalized.replace(/\/+$/, "");
};

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [pridePoints, setPridePoints] = useState(0);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isSessionResolved, setIsSessionResolved] = useState(false);
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname),
  );
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  const [signUpEmailAddress, setSignUpEmailAddress] = useState("");
  const [signUpUserName, setSignUpUserName] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpStreetAddress, setSignUpStreetAddress] = useState("");
  const [signUpCity, setSignUpCity] = useState("");
  const [signUpStateCode, setSignUpStateCode] = useState("");
  const [signUpZipCode, setSignUpZipCode] = useState("");
  const [signUpHasAgreed, setSignUpHasAgreed] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState<string | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType>(null);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);
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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);
  const [orderSuccessMessageVisible, setOrderSuccessMessageVisible] =
    useState(false);
  const [rewardPointsEarned, setRewardPointsEarned] = useState(0);
  const [rewardCounter, setRewardCounter] = useState(0);
  const [pendingGuestRewardPoints, setPendingGuestRewardPoints] = useState(0);
  const [pendingGuestOrderDraft, setPendingGuestOrderDraft] =
    useState<GuestOrderReplayDraft | null>(null);
  const [featuredMenuItems, setFeaturedMenuItems] = useState<MenuItem[]>(
    featuredDrinks,
  );
  const [drinkMenuItems, setDrinkMenuItems] = useState<MenuItem[]>(drinks);
  const [sweetCrepeMenuItems, setSweetCrepeMenuItems] = useState<MenuItem[]>(
    sweetCrepes,
  );
  const [savoryCrepeMenuItems, setSavoryCrepeMenuItems] = useState<MenuItem[]>(
    savoryCrepes,
  );
  const [bagelMenuItems, setBagelMenuItems] = useState<MenuItem[]>(bagels);
  const swipeStartX = useRef<number | null>(null);
  const swipeDeltaX = useRef(0);
  const closeCheckoutTimer = useRef<number | null>(null);
  const rewardsCounterTimer = useRef<number | null>(null);
  const authControlRef = useRef<HTMLDivElement | null>(null);
  const navAreaRef = useRef<HTMLDivElement | null>(null);

  const isMenuEditorPage = currentPath === menuEditorPath;
  const isCustomerPage = currentPath === customerPagePath;
  const isEmployeeDashboardPage = currentPath === employeeDashboardPath;
  const isReportsPage = currentPath === reportsPath;
  const isEmployeeOrAdmin =
    userRoles.some((role) => role.toLowerCase() === "employee") ||
    userRoles.some((role) => role.toLowerCase() === "admin");

  const displayMenuItems = [
    ...drinkMenuItems,
    ...sweetCrepeMenuItems,
    ...savoryCrepeMenuItems,
    ...bagelMenuItems,
  ];
  const featuredMenuItemNameKeys = new Set(
    featuredMenuItems.map((item) =>
      normalizeMenuItemName(item.name).toLowerCase(),
    ),
  );
  const filterOutFeaturedItems = (items: MenuItem[]) =>
    items.filter(
      (item) =>
        !featuredMenuItemNameKeys.has(
          normalizeMenuItemName(item.name).toLowerCase(),
        ),
    );
  const visibleDrinkMenuItems = filterOutFeaturedItems(drinkMenuItems);
  const visibleSweetCrepeMenuItems = filterOutFeaturedItems(sweetCrepeMenuItems);
  const visibleSavoryCrepeMenuItems = filterOutFeaturedItems(savoryCrepeMenuItems);
  const visibleBagelMenuItems = filterOutFeaturedItems(bagelMenuItems);

  const displayMenuItemByName = new Map(
    displayMenuItems.map((item) => [
      item.name,
      { ...item, unitPrice: parsePrice(item.price) },
    ]),
  );
  const displayMenuItemNameLookup = new Map(
    displayMenuItems.map((item) => [
      normalizeMenuItemName(item.name).toLowerCase(),
      item.name,
    ]),
  );

  const cartSummaryItems: CartSummaryItem[] = Object.entries(cartItemsByName)
    .map(([name, quantity]) => {
      const catalogItem = displayMenuItemByName.get(name);
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

  const carouselMenuItems = displayMenuItems.length > 0 ? displayMenuItems : drinks;
  const currentCarouselItem = carouselMenuItems[carouselIndex];

  const goToPreviousCarouselItem = () =>
    setCarouselIndex((previous) =>
      previous === 0 ? carouselMenuItems.length - 1 : previous - 1,
    );

  const goToNextCarouselItem = () =>
    setCarouselIndex((previous) => (previous + 1) % carouselMenuItems.length);

  const previousCarouselItem =
    carouselMenuItems[
      (carouselIndex - 1 + carouselMenuItems.length) % carouselMenuItems.length
    ];

  const nextCarouselItem =
    carouselMenuItems[(carouselIndex + 1) % carouselMenuItems.length];

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
    setIsUserMenuOpen(false);
    setIsAuthPopupOpen((previous) => !previous);
  };

  const resetSignUpForm = () => {
    setSignUpName("");
    setSignUpPhoneNumber("");
    setSignUpEmailAddress("");
    setSignUpUserName("");
    setSignUpPassword("");
    setSignUpStreetAddress("");
    setSignUpCity("");
    setSignUpStateCode("");
    setSignUpZipCode("");
    setSignUpHasAgreed(false);
    setSignUpErrorMessage(null);
    setActivePolicyModal(null);
  };

  const openSignUpModal = () => {
    setIsAuthPopupOpen(false);
    setIsUserMenuOpen(false);
    setLoginErrorMessage(null);
    setSignUpErrorMessage(null);
    setActivePolicyModal(null);
    setIsSignUpModalOpen(true);
  };

  const closeSignUpModal = () => {
    if (isSubmittingSignUp) {
      return;
    }

    setIsSignUpModalOpen(false);
    setActivePolicyModal(null);
  };

  const closePolicyModal = () => {
    if (isSubmittingSignUp) {
      return;
    }

    setActivePolicyModal(null);
  };

  const handleSignUpPhoneChange = (value: string) => {
    setSignUpPhoneNumber(formatPhoneNumber(value));
  };

  const handleSignUpStateChange = (value: string) => {
    setSignUpStateCode(value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2));
  };

  const navigateToPath = (path: string) => {
    const normalizedPath = normalizePath(path);
    const currentLocationPath = normalizePath(window.location.pathname);

    if (currentLocationPath !== normalizedPath) {
      window.history.pushState({}, "", normalizedPath);
    }

    setCurrentPath(normalizedPath);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleUserIconClick = () => {
    setIsMobileNavOpen(false);

    if (loggedInUserName) {
      setIsAuthPopupOpen(false);
      setIsUserMenuOpen((previous) => !previous);
      return;
    }

    toggleAuthPopup();
  };

  const handleAccountClick = () => {
    setIsUserMenuOpen(false);
    setIsReservationsModalOpen(false);

    if (isEmployeeOrAdmin) {
      navigateToPath(employeeDashboardPath);
      return;
    }

    navigateToPath(customerPagePath);
  };

  const toggleMobileNav = () => {
    setIsAuthPopupOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileNavOpen((previous) => !previous);
  };

  const openReservationsModal = () => {
    setIsAuthPopupOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileNavOpen(false);
    setIsReservationsModalOpen(true);
  };

  const handleLogOut = async () => {
    setIsUserMenuOpen(false);
    setIsAuthPopupOpen(false);
    setLoginErrorMessage(null);

    try {
      await fetch(buildApiUrl("/api/authentication/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore logout transport errors and clear local session state anyway.
    } finally {
      setLoggedInUserName(null);
      setCurrentUserId(null);
      setPridePoints(0);
      setUserRoles([]);
      setLoginPassword("");
      setIsReservationsModalOpen(false);
      setIsSessionResolved(true);
      navigateToPath("/");
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadActiveSession = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/authentication/me"), {
          credentials: "include",
        });

        if (!response.ok) {
          if (isMounted) {
            setLoggedInUserName(null);
            setCurrentUserId(null);
            setPridePoints(0);
            setUserRoles([]);
            setIsSessionResolved(true);
          }
          return;
        }

        const user = (await response.json()) as AuthenticationUserDto;

        if (!isMounted) {
          return;
        }

        setLoggedInUserName(user.userName);
        setCurrentUserId(user.id);
        setPridePoints(user.pridePoints ?? 0);
        setUserRoles(user.roles ?? []);
        setIsSessionResolved(true);
      } catch {
        if (!isMounted) {
          return;
        }

        setLoggedInUserName(null);
        setCurrentUserId(null);
        setPridePoints(0);
        setUserRoles([]);
        setIsSessionResolved(true);
      }
    };

    void loadActiveSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUserPridePoints = async () => {
      if (currentUserId === null) {
        return;
      }

      try {
        const response = await fetch(buildApiUrl(`/api/users/${currentUserId}`), {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const user = (await response.json()) as AuthenticationUserDto;

        if (!isMounted) {
          return;
        }

        setPridePoints(user.pridePoints ?? 0);
      } catch {
        // Keep existing pride points when user profile lookup fails.
      }
    };

    void loadUserPridePoints();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!isSessionResolved) {
      return;
    }

    if (!isCustomerPage || loggedInUserName) {
      return;
    }

    navigateToPath("/");
  }, [isCustomerPage, isSessionResolved, loggedInUserName]);

  useEffect(() => {
    if (currentPath !== legacyReservationsPath) {
      return;
    }

    setIsReservationsModalOpen(true);
    navigateToPath("/");
  }, [currentPath]);

  useEffect(() => {
    if (!isAuthPopupOpen && !isUserMenuOpen) {
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
      setIsUserMenuOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isAuthPopupOpen, isUserMenuOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (navAreaRef.current?.contains(target)) {
        return;
      }

      setIsMobileNavOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMenuItems = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/menuitems"), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Menu items request failed (${response.status})`);
        }

        const apiMenuItems = (await response.json()) as ApiMenuItemDto[];

        if (!isMounted || apiMenuItems.length === 0) {
          return;
        }

        const mappedItems = apiMenuItems.map((item) => {
          const normalizedName = normalizeMenuItemName(item.itemName);

          return {
            type: item.type,
            featured: item.featured,
            menuItem: {
              name: normalizedName,
              description: item.description,
              price: `$${item.price.toFixed(2)}`,
              image: menuItemImages[normalizedName] ?? coffeeBag,
            },
          };
        });

        const nextDrinkItems = mappedItems
          .filter((item) => item.type.toLowerCase() === "drink")
          .map((item) => item.menuItem);

        const foodItems = mappedItems
          .filter((item) => item.type.toLowerCase() !== "drink")
          .map((item) => item.menuItem);

        const nextSweetCrepeItems = foodItems.filter((item) =>
          sweetCrepeItemNames.has(item.name),
        );

        const nextSavoryCrepeItems = foodItems.filter((item) =>
          savoryCrepeItemNames.has(item.name),
        );

        const nextBagelItems = foodItems.filter((item) =>
          bagelItemNames.has(item.name),
        );

        const nextOtherFoodItems = foodItems.filter(
          (item) =>
            !sweetCrepeItemNames.has(item.name) &&
            !savoryCrepeItemNames.has(item.name) &&
            !bagelItemNames.has(item.name),
        );

        const nextFeaturedItems = mappedItems
          .filter((item) => item.featured)
          .map((item) => item.menuItem);

        setDrinkMenuItems(nextDrinkItems.length > 0 ? nextDrinkItems : drinks);
        setSweetCrepeMenuItems(
          nextSweetCrepeItems.length > 0 ? nextSweetCrepeItems : sweetCrepes,
        );
        setSavoryCrepeMenuItems(
          nextSavoryCrepeItems.length + nextOtherFoodItems.length > 0
            ? [...nextSavoryCrepeItems, ...nextOtherFoodItems]
            : savoryCrepes,
        );
        setBagelMenuItems(nextBagelItems.length > 0 ? nextBagelItems : bagels);
        setFeaturedMenuItems(
          nextFeaturedItems.length > 0 ? nextFeaturedItems : featuredDrinks,
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setDrinkMenuItems(drinks);
        setSweetCrepeMenuItems(sweetCrepes);
        setSavoryCrepeMenuItems(savoryCrepes);
        setBagelMenuItems(bagels);
        setFeaturedMenuItems(featuredDrinks);
      }
    };

    void loadMenuItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (carouselIndex < carouselMenuItems.length) {
      return;
    }

    setCarouselIndex(0);
  }, [carouselIndex, carouselMenuItems.length]);

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

    if (rewardsCounterTimer.current !== null) {
      window.clearInterval(rewardsCounterTimer.current);
      rewardsCounterTimer.current = null;
    }

    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(false);
    setOrderErrorMessage(null);
    setOrderSuccessMessageVisible(false);
    setRewardPointsEarned(0);
    setRewardCounter(0);
    setPendingGuestRewardPoints(0);
    setPendingGuestOrderDraft(null);
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
    setRewardPointsEarned(0);
    setRewardCounter(0);
    setPendingGuestRewardPoints(0);
    setPendingGuestOrderDraft(null);
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(true);
    void fetchLocations();
  };

  const openCheckoutSignInPrompt = () => {
    setIsCheckoutModalOpen(false);
    setLoginErrorMessage(null);
    setIsUserMenuOpen(false);
    setIsAuthPopupOpen(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openCheckoutSignUpPrompt = () => {
    setIsCheckoutModalOpen(false);
    openSignUpModal();
  };

  const handleOrderAgainFromCustomerPage = (order: CustomerOrderAgainPayload) => {
    const orderAgainItemsByName: Record<string, number> = {};

    order.items.forEach((item) => {
      const normalizedName = normalizeMenuItemName(item.name).toLowerCase();
      const catalogName = displayMenuItemNameLookup.get(normalizedName);
      const quantity = Math.max(0, Math.floor(item.quantity));

      if (!catalogName || quantity < 1) {
        return;
      }

      orderAgainItemsByName[catalogName] =
        (orderAgainItemsByName[catalogName] ?? 0) + quantity;
    });

    if (Object.keys(orderAgainItemsByName).length === 0) {
      alert("No valid items were found for that previous order.");
      return;
    }

    setCartItemsByName((previous) => {
      const nextCartItemsByName = { ...previous };

      Object.entries(orderAgainItemsByName).forEach(([name, quantity]) => {
        nextCartItemsByName[name] = (nextCartItemsByName[name] ?? 0) + quantity;
      });

      return nextCartItemsByName;
    });

    openCheckoutModal();
  };

  const startRewardsCounterAnimation = (pointsToAdd: number) => {
    setRewardPointsEarned(pointsToAdd);
    setRewardCounter(0);

    if (rewardsCounterTimer.current !== null) {
      window.clearInterval(rewardsCounterTimer.current);
      rewardsCounterTimer.current = null;
    }

    if (pointsToAdd <= 0) {
      return;
    }

    const startedAt = Date.now();

    rewardsCounterTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / rewardsCounterDurationMs);
      const nextValue = Math.floor(pointsToAdd * progress);
      setRewardCounter(nextValue);

      if (progress >= 1) {
        setRewardCounter(pointsToAdd);

        if (rewardsCounterTimer.current !== null) {
          window.clearInterval(rewardsCounterTimer.current);
          rewardsCounterTimer.current = null;
        }
      }
    }, 30);
  };

  const applyRewardsFromOrder = async (
    pointsToAdd: number,
    targetUserId: number | null = currentUserId,
  ) => {
    if (pointsToAdd <= 0 || targetUserId === null) {
      return;
    }

    try {
      await fetch(buildApiUrl(`/api/users/${targetUserId}`), {
        credentials: "include",
      });

      const response = await fetch(
        buildApiUrl(`/api/users/${targetUserId}/rewards`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pointsToAdd,
          }),
        },
      );

      if (!response.ok) {
        return;
      }

      const rewardsUpdate = (await response.json()) as AwardRewardsResultDto;
      setPridePoints(rewardsUpdate.pridePoints);
    } catch {
      // Do not fail order flow when rewards update fails.
    }
  };

  const handleSubmitOrder = async () => {
    if (isSubmittingOrder || cartSummaryItems.length === 0) {
      return;
    }

    if (selectedLocationId === "") {
      setOrderErrorMessage("Please select a location.");
      return;
    }

    if (!paymentMethod) {
      setOrderErrorMessage("Please select a payment option.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderErrorMessage(null);
    setPendingGuestRewardPoints(0);
    setPendingGuestOrderDraft(null);

    try {
      const isGuestCheckout = !loggedInUserName;
      const selectedPaymentOption = paymentMethodOptions.find(
        (option) => option.value === paymentMethod,
      );
      const orderPayload: GuestOrderReplayDraft = {
        locationId: Number(selectedLocationId),
        pickupType,
        paymentMethod: selectedPaymentOption?.label ?? paymentMethod,
        total: Number(cartSubtotal.toFixed(2)),
        items: cartSummaryItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice.toFixed(2)),
        })),
      };

      let requiresAuthReplay = false;

      const response = await fetch(buildApiUrl("/api/orders"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
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

        const isUnauthorizedResponse =
          response.status === 401 ||
          response.status === 403 ||
          /unauthorized/i.test(message);

        if (!(isGuestCheckout && isUnauthorizedResponse)) {
          throw new Error(message);
        }

        requiresAuthReplay = true;
      }

      const pointsToAdd = calculateRewardPoints(cartSubtotal);
      if (isGuestCheckout) {
        if (requiresAuthReplay) {
          setPendingGuestRewardPoints(pointsToAdd);
          setPendingGuestOrderDraft(orderPayload);
        } else {
          setPendingGuestRewardPoints(0);
          setPendingGuestOrderDraft(null);
        }
      } else {
        await applyRewardsFromOrder(pointsToAdd);
      }
      startRewardsCounterAnimation(pointsToAdd);
      setOrderSuccessMessageVisible(true);

      if (isGuestCheckout) {
        clearCart();
      } else {
        if (closeCheckoutTimer.current !== null) {
          window.clearTimeout(closeCheckoutTimer.current);
        }

        closeCheckoutTimer.current = window.setTimeout(() => {
          clearCart();
          closeCartAndCheckout();
          closeCheckoutTimer.current = null;
        }, rewardsCounterDurationMs + rewardsPopupHoldMs);
      }
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

      if (rewardsCounterTimer.current !== null) {
        window.clearInterval(rewardsCounterTimer.current);
      }
    },
    [],
  );

  const authenticateUser = async (userName: string, password: string) => {
    const response = await fetch(buildApiUrl("/api/authentication/login"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName.trim(),
        password,
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
    const nextRoles = user.roles ?? [];
    const pendingGuestPoints = pendingGuestRewardPoints;
    const pendingGuestOrder = pendingGuestOrderDraft;

    setLoggedInUserName(user.userName);
    setCurrentUserId(user.id);
    setPridePoints(user.pridePoints ?? 0);
    setUserRoles(nextRoles);
    setIsSessionResolved(true);
    setLoginPassword("");
    setIsAuthPopupOpen(false);
    setIsUserMenuOpen(false);

    const isStaffUser = nextRoles.some(
      (role) =>
        role.toLowerCase() === "employee" || role.toLowerCase() === "admin",
    );

    if (pendingGuestOrder || pendingGuestPoints > 0) {
      if (pendingGuestOrder) {
        try {
          await fetch(buildApiUrl("/api/orders"), {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pendingGuestOrder),
          });
        } catch {
          // Keep auth flow resilient even when replay order fails.
        }
      }

      if (pendingGuestPoints > 0) {
        await applyRewardsFromOrder(pendingGuestPoints, user.id);
      }

      setPendingGuestRewardPoints(0);
      setPendingGuestOrderDraft(null);
      closeCartAndCheckout();
      navigateToPath(customerPagePath);
      return user;
    }

    if (isStaffUser) {
      navigateToPath(employeeDashboardPath);
    } else {
      navigateToPath(customerPagePath);
    }

    return user;
  };

  const handleReservationSignIn = async (credentials: ReservationLoginPayload) => {
    await authenticateUser(credentials.userName, credentials.password);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingLogin) {
      return;
    }

    setIsSubmittingLogin(true);
    setLoginErrorMessage(null);

    try {
      await authenticateUser(loginUserName, loginPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setLoginErrorMessage(message);
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingSignUp) {
      return;
    }

    const trimmedName = signUpName.trim();
    const trimmedPhone = signUpPhoneNumber.trim();
    const trimmedEmail = signUpEmailAddress.trim();
    const trimmedUserName = signUpUserName.trim();
    const trimmedPassword = signUpPassword;
    const trimmedAddress = signUpStreetAddress.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");

    if (
      !trimmedName ||
      !trimmedPhone ||
      !trimmedEmail ||
      !trimmedUserName ||
      !trimmedPassword ||
      !trimmedAddress
    ) {
      setSignUpErrorMessage(
        "Name, phone number, email, user name, password, and address are required.",
      );
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setSignUpErrorMessage("Enter a valid email address.");
      return;
    }

    if (phoneDigits.length !== 10) {
      setSignUpErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }

    if (!signUpHasAgreed) {
      setSignUpErrorMessage("You must agree to the terms and privacy policy.");
      return;
    }

    setIsSubmittingSignUp(true);
    setSignUpErrorMessage(null);
    setActivePolicyModal(null);

    try {
      const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
      const lastName = lastNameParts.join(" ").trim() || "Customer";

      const payload: CreateUserDto = {
        userName: trimmedUserName,
        password: trimmedPassword,
        roles: ["User"],
        firstName,
        lastName,
        address: trimmedAddress,
        city: signUpCity.trim(),
        state: signUpStateCode.trim(),
        zipCode: signUpZipCode.trim(),
        pridePoints: 0,
        hasAgreedToPolicies: signUpHasAgreed,
      };

      const response = await fetch(buildApiUrl("/api/users"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `Sign up failed (${response.status})`;

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

      await authenticateUser(trimmedUserName, trimmedPassword);
      resetSignUpForm();
      setIsSignUpModalOpen(false);
      navigateToPath(customerPagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      setSignUpErrorMessage(message);
    } finally {
      setIsSubmittingSignUp(false);
    }
  };

  const rewardWheelProgress =
    rewardPointsEarned > 0
      ? Math.min(100, Math.round((rewardCounter / rewardPointsEarned) * 100))
      : 100;

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Caffeinated Lions logo" className="brand-logo" />
          <span>Caffeinated Lions</span>
        </div>

        <div className="nav-area" ref={navAreaRef}>
          <div className="nav-menu">
            {isCustomerPage ? (
              <nav className="nav-links">
                <button
                  type="button"
                  className="nav-link-btn"
                  onClick={() => navigateToPath("/")}
                >
                  Home
                </button>
              </nav>
            ) : (
              <nav className="nav-links">
                <a href="#featured">Featured</a>
                <a href="#drinks">Drinks</a>
                <a href="#food">Food</a>
                <a href="#about">About</a>
                <button
                  type="button"
                  className="nav-link-btn"
                  onClick={openReservationsModal}
                >
                  Reservations
                </button>
              </nav>
            )}

            <button
              type="button"
              className="mobile-nav-toggle"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileNavOpen}
              onClick={toggleMobileNav}
            >
              {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {isMobileNavOpen ? (
              <div className="mobile-nav-dropdown">
                <nav className="mobile-nav-links">
                  {isCustomerPage ? (
                    <button
                      type="button"
                      className="mobile-nav-link-btn"
                      onClick={() => navigateToPath("/")}
                    >
                      Home
                    </button>
                  ) : (
                    <>
                      <a href="#featured" onClick={() => setIsMobileNavOpen(false)}>
                        Featured
                      </a>
                      <a href="#drinks" onClick={() => setIsMobileNavOpen(false)}>
                        Drinks
                      </a>
                      <a href="#food" onClick={() => setIsMobileNavOpen(false)}>
                        Food
                      </a>
                      <a href="#about" onClick={() => setIsMobileNavOpen(false)}>
                        About
                      </a>
                      <button
                        type="button"
                        className="mobile-nav-link-btn"
                        onClick={openReservationsModal}
                      >
                        Reservations
                      </button>
                    </>
                  )}
                </nav>
              </div>
            ) : null}
          </div>

          <div className="nav-actions">
            <div className="auth-control" ref={authControlRef}>
              <button
                type="button"
                className="icon-button"
                onClick={handleUserIconClick}
                aria-label={
                  loggedInUserName
                    ? "Open account options"
                    : "Open account login"
                }
                aria-expanded={loggedInUserName ? isUserMenuOpen : isAuthPopupOpen}
              >
                <CircleUserRound size={24} />
              </button>

              {loggedInUserName ? (
                <span className="auth-user-name">{loggedInUserName}</span>
              ) : null}

              {loggedInUserName && isUserMenuOpen ? (
                <div className="user-action-menu">
                  <button
                    type="button"
                    className="user-action-item"
                    onClick={handleAccountClick}
                  >
                    <CircleUserRound size={16} />
                    <span>Account</span>
                  </button>
                  <button
                    type="button"
                    className="user-action-item"
                    onClick={() => {
                      void handleLogOut();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : null}

              {!loggedInUserName && isAuthPopupOpen ? (
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

                  <div className="auth-actions-row">
                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={isSubmittingLogin}
                    >
                      {isSubmittingLogin ? "Signing In..." : "Login"}
                    </button>
                    <button
                      type="button"
                      className="auth-secondary-btn"
                      onClick={openSignUpModal}
                      disabled={isSubmittingLogin}
                    >
                      Sign Up
                    </button>
                  </div>

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

      {isCustomerPage ? (
        <CustomerPage
          userName={loggedInUserName ?? "Guest"}
          pridePoints={pridePoints}
          featuredItems={featuredMenuItems}
          isInCart={isInCart}
          onToggleCartItem={toggleCartItem}
          onOrderAgain={handleOrderAgainFromCustomerPage}
          buildApiUrl={buildApiUrl}
          resolveMenuItemImage={(itemName) =>
            menuItemImages[normalizeMenuItemName(itemName)] ?? logo
          }
        />
      ) : null}

      {isEmployeeDashboardPage && isEmployeeOrAdmin ? (
        <EmployeeDashboard
          roles={userRoles}
          buildApiUrl={buildApiUrl}
          onOpenMenuEditor={() => navigateToPath(menuEditorPath)}
          onOpenReports={() => navigateToPath(reportsPath)}
        />
      ) : null}

      {isMenuEditorPage && isEmployeeOrAdmin ? (
        <MenuEditor
          buildApiUrl={buildApiUrl}
          onBack={() => navigateToPath(employeeDashboardPath)}
        />
      ) : null}

      {isReportsPage && isEmployeeOrAdmin ? (
        <ReportsPage onBack={() => navigateToPath(employeeDashboardPath)} />
      ) : null}

      <main
        style={{
          display:
        isCustomerPage ||
        (isEmployeeDashboardPage && isEmployeeOrAdmin) ||
        (isMenuEditorPage && isEmployeeOrAdmin) ||
        (isReportsPage && isEmployeeOrAdmin)
          ? "none"
          : undefined,
        }}
      >
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
            {featuredMenuItems.map((drink) => (
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

        {visibleDrinkMenuItems.length > 0 ? (
          <section className="menu-section" id="drinks">
            <div className="section-heading">
              <p className="section-label">Drinks</p>
              <h2>Handcrafted favorites</h2>
            </div>
            <div className="menu-grid">
              {visibleDrinkMenuItems.map((item) => (
                <MenuCard
                  key={item.name}
                  item={item}
                  isSelected={isInCart(item.name)}
                  onToggle={toggleCartItem}
                />
              ))}
            </div>
          </section>
        ) : null}

        {visibleSweetCrepeMenuItems.length > 0 ? (
          <section className="menu-section" id="food">
            <div className="section-heading">
              <p className="section-label">Sweet Crepes</p>
              <h2>Sweet, warm, and indulgent</h2>
            </div>
            <div className="menu-grid">
              {visibleSweetCrepeMenuItems.map((item) => (
                <MenuCard
                  key={item.name}
                  item={item}
                  isSelected={isInCart(item.name)}
                  onToggle={toggleCartItem}
                />
              ))}
            </div>
          </section>
        ) : null}

        {visibleSavoryCrepeMenuItems.length > 0 ? (
          <section className="menu-section">
            <div className="section-heading">
              <p className="section-label">Savory Crepes</p>
              <h2>Fresh and filling choices</h2>
            </div>
            <div className="menu-grid">
              {visibleSavoryCrepeMenuItems.map((item) => (
                <MenuCard
                  key={item.name}
                  item={item}
                  isSelected={isInCart(item.name)}
                  onToggle={toggleCartItem}
                />
              ))}
            </div>
          </section>
        ) : null}

        {visibleBagelMenuItems.length > 0 ? (
          <section className="menu-section">
            <div className="section-heading">
              <p className="section-label">Bagels</p>
              <h2>Toasted classics and specialties</h2>
            </div>
            <div className="menu-grid">
              {visibleBagelMenuItems.map((item) => (
                <MenuCard
                  key={item.name}
                  item={item}
                  isSelected={isInCart(item.name)}
                  onToggle={toggleCartItem}
                />
              ))}
            </div>
          </section>
        ) : null}

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

      {isSignUpModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign up"
          onClick={closeSignUpModal}
        >
          <div className="signup-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cart-modal-header">
              <h2>Sign Up</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close sign up"
                onClick={closeSignUpModal}
                disabled={isSubmittingSignUp}
              >
                <X size={18} />
              </button>
            </div>

            <p className="signup-modal-subtitle">
              Sign up to receive discounts, order your favorites faster and much more.
            </p>

            <form
              className="signup-form"
              onSubmit={(event) => {
                void handleSignUpSubmit(event);
              }}
            >
              <div className="signup-grid-two">
                <label className="signup-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(event) => setSignUpName(event.target.value)}
                    autoComplete="name"
                    required
                    disabled={isSubmittingSignUp}
                  />
                </label>

                <label className="signup-field">
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    value={signUpPhoneNumber}
                    onChange={(event) => handleSignUpPhoneChange(event.target.value)}
                    autoComplete="tel"
                    maxLength={12}
                    required
                    disabled={isSubmittingSignUp}
                  />
                </label>
              </div>

              <label className="signup-field">
                <span>Email Address</span>
                <input
                  type="email"
                  value={signUpEmailAddress}
                  onChange={(event) => setSignUpEmailAddress(event.target.value)}
                  autoComplete="email"
                  required
                  disabled={isSubmittingSignUp}
                />
              </label>

              <div className="signup-grid-two">
                <label className="signup-field">
                  <span>User Name</span>
                  <input
                    type="text"
                    value={signUpUserName}
                    onChange={(event) => setSignUpUserName(event.target.value)}
                    autoComplete="username"
                    required
                    disabled={isSubmittingSignUp}
                  />
                </label>

                <label className="signup-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(event) => setSignUpPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={isSubmittingSignUp}
                  />
                </label>
              </div>

              <label className="signup-field">
                <span>Street Address</span>
                <input
                  type="text"
                  value={signUpStreetAddress}
                  onChange={(event) => setSignUpStreetAddress(event.target.value)}
                  autoComplete="street-address"
                  required
                  disabled={isSubmittingSignUp}
                />
              </label>

              <div className="signup-grid-three">
                <label className="signup-field">
                  <span>City</span>
                  <input
                    type="text"
                    value={signUpCity}
                    onChange={(event) => setSignUpCity(event.target.value)}
                    autoComplete="address-level2"
                    disabled={isSubmittingSignUp}
                  />
                </label>

                <label className="signup-field">
                  <span>State</span>
                  <input
                    type="text"
                    value={signUpStateCode}
                    onChange={(event) => handleSignUpStateChange(event.target.value)}
                    autoComplete="address-level1"
                    maxLength={2}
                    disabled={isSubmittingSignUp}
                  />
                </label>

                <label className="signup-field">
                  <span>Zip</span>
                  <input
                    type="text"
                    value={signUpZipCode}
                    onChange={(event) =>
                      setSignUpZipCode(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 5),
                      )
                    }
                    autoComplete="postal-code"
                    maxLength={5}
                    disabled={isSubmittingSignUp}
                  />
                </label>
              </div>

              <label className="signup-agreement-row">
                <input
                  type="checkbox"
                  className="signup-checkbox"
                  checked={signUpHasAgreed}
                  onChange={(event) => setSignUpHasAgreed(event.target.checked)}
                  disabled={isSubmittingSignUp}
                />
                <span>
                  By signing up, you agree to Caffeinated Lions LLC{" "}
                  <button
                    type="button"
                    className="policy-link-btn"
                    onClick={() => setActivePolicyModal("terms")}
                    disabled={isSubmittingSignUp}
                  >
                    Terms Of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="policy-link-btn"
                    onClick={() => setActivePolicyModal("privacy")}
                    disabled={isSubmittingSignUp}
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              {signUpErrorMessage ? (
                <p className="signup-error">{signUpErrorMessage}</p>
              ) : null}

              <button
                type="submit"
                className="primary-btn signup-submit-btn"
                disabled={isSubmittingSignUp}
              >
                {isSubmittingSignUp ? (
                  <>
                    <LoaderCircle size={16} className="spinning-icon" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {activePolicyModal ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activePolicyModal === "terms" ? "Terms of Service" : "Privacy Policy"}
          onClick={closePolicyModal}
        >
          <div className="policy-modal" onClick={(event) => event.stopPropagation()}>
            <h3 className="policy-modal-title">
              {activePolicyModal === "terms" ? "Terms of Service" : "Privacy Policy"}
            </h3>
            <p className="policy-modal-body">
              {activePolicyModal === "terms"
                ? "Placeholder: Terms of Service details will appear here, including account use, ordering terms, and service availability language."
                : "Placeholder: Privacy Policy details will appear here, including data collection, usage, storage, and contact information."}
            </p>
            <button
              type="button"
              className="secondary-btn policy-modal-close-btn"
              onClick={closePolicyModal}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

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
                <CheckCircle2
                  size={68}
                  strokeWidth={2.25}
                  className="checkout-success-icon"
                />
                <h3>Order placed successfully</h3>
                <p className="checkout-success-copy">
                  Congrats! You earned reward points.
                </p>
                <div
                  className="rewards-wheel"
                  style={{
                    background: `conic-gradient(var(--lion-green-dark) ${rewardWheelProgress}%, #dde4df ${rewardWheelProgress}% 100%)`,
                  }}
                >
                  <div className="rewards-wheel-inner">
                    <strong>{rewardCounter}</strong>
                  </div>
                </div>
                <p className="rewards-earned">+{rewardPointsEarned} points</p>
                {!loggedInUserName && pendingGuestRewardPoints > 0 ? (
                  <div className="checkout-auth-gate checkout-claim-gate">
                    <h3>Sign in or sign up to claim your points</h3>
                    <p>
                      Complete sign in or create an account and we will apply{" "}
                      {pendingGuestRewardPoints} points to your profile.
                    </p>
                    <div className="checkout-auth-actions">
                      <button
                        type="button"
                        className="primary-btn checkout-auth-btn"
                        onClick={openCheckoutSignInPrompt}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        className="secondary-btn checkout-auth-btn"
                        onClick={openCheckoutSignUpPrompt}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ) : null}
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
                            {location.address}
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

                <div className="checkout-field">
                  <span>Payment:</span>
                  <div className="payment-methods-row">
                    {paymentMethodOptions.map((option) => {
                      const isSelected = paymentMethod === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`payment-method-btn ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => {
                            setPaymentMethod(option.value);
                            setOrderErrorMessage(null);
                          }}
                          disabled={isSubmittingOrder}
                          aria-label={`Select ${option.label} payment`}
                        >
                          <img
                            src={option.image}
                            alt={option.label}
                            className="payment-method-icon"
                          />
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
                    void handleSubmitOrder();
                  }}
                  disabled={
                    isSubmittingOrder ||
                    isLocationsLoading ||
                    selectedLocationId === "" ||
                    !paymentMethod ||
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

      {isReservationsModalOpen ? (
        <ReservationsModal
          isOpen={isReservationsModalOpen}
          onClose={() => setIsReservationsModalOpen(false)}
          isAuthenticated={Boolean(loggedInUserName)}
          userName={loggedInUserName}
          buildApiUrl={buildApiUrl}
          paymentMethodOptions={paymentMethodOptions}
          onSignIn={handleReservationSignIn}
        />
      ) : null}

      <footer className="footer">
        <p>© 2026 Caffeinated Lions. Brewed with pride.</p>
      </footer>
    </div>
  );
}

export default App;
