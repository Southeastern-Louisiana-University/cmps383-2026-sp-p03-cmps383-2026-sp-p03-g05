export const coffeeTheme = {
  branding: {
    appName: 'Caffeinated Lions',
    paletteName: 'Emerald Coffee Palette',
  },
  colors: {
    primary: '#10b981',
    secondary: '#FBF3E8',
    accent: '#CBBBA0',
    text: '#5B3F32',
    darkAccent: '#3A2F24',
    altForest: '#4A6C6F',
    altNeutral: '#C2A790',
  },
} as const;

export const coffeeCssVariables = {
  '--coffee-primary': coffeeTheme.colors.primary,
  '--coffee-bg': coffeeTheme.colors.secondary,
  '--coffee-accent': coffeeTheme.colors.accent,
  '--coffee-text': coffeeTheme.colors.text,
  '--coffee-dark': coffeeTheme.colors.darkAccent,
  '--coffee-alt-forest': coffeeTheme.colors.altForest,
  '--coffee-alt-neutral': coffeeTheme.colors.altNeutral,
} as const;

export function applyCoffeeTheme(target: HTMLElement = document.documentElement) {
  Object.entries(coffeeCssVariables).forEach(([name, value]) => {
    target.style.setProperty(name, value);
  });
}
