import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
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

function MenuCard({ item }: { item: MenuItem }) {
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
        </div>
      </div>
    </article>
  );
}

function App() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const swipeDeltaX = useRef(0);

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

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Caffeinated Lions logo" className="brand-logo" />
          <span>Caffeinated Lions</span>
        </div>

        <nav className="nav-links">
          <a href="#featured">Featured</a>
          <a href="#drinks">Drinks</a>
          <a href="#food">Food</a>
          <a href="#about">About</a>
        </nav>
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
            <p className="section-label">Featured Drinks</p>
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
              <MenuCard key={item.name} item={item} />
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
              <MenuCard key={item.name} item={item} />
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
              <MenuCard key={item.name} item={item} />
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
              <MenuCard key={item.name} item={item} />
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

      <footer className="footer">
        <p>© 2026 Caffeinated Lions. Brewed with pride.</p>
      </footer>
    </div>
  );
}

export default App;
