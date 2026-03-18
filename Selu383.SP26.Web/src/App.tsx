import { Coffee, Leaf, MapPin, ShoppingBag } from 'lucide-react'
import logo from './assets/logo-round.png'
import './App.css'
import { coffeeTheme } from './theme.ts'

function App() {
  return (
    <main className="page">
      <header className="hero">
        <img src={logo} className="hero-logo" alt={`${coffeeTheme.branding.appName} logo`} />
        <div className="hero-copy">
          <p className="kicker">Fresh pickup, crafted fast</p>
          <h1>{coffeeTheme.branding.appName} Mobile</h1>
          <p>
            Your color system and icon set are now configured for a high-contrast, coffee-first
            ordering experience.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              <ShoppingBag size={16} />
              Order Now
            </button>
            <button className="btn btn-secondary" type="button">
              <MapPin size={16} />
              Find Location
            </button>
          </div>
        </div>
      </header>

      <section className="quick-stats">
        <article className="panel">
          <Coffee size={18} />
          <span>Mobile-first checkout</span>
        </article>
        <article className="panel">
          <Leaf size={18} />
          <span>Emerald palette applied</span>
        </article>
        <article className="panel">
          <MapPin size={18} />
          <span>Route groups initialized</span>
        </article>
      </section>
    </main>
  )
}

export default App
