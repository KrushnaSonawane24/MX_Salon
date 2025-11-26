module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F5E6CC',
        sand: '#F0E7D8',
        primary: '#C97C5D',
        teal: '#2C6E6F',
        gold: '#D4AF37',
        charcoal: '#2F2F2F',
      },
      boxShadow: {
        glow: '0 8px 24px rgba(212,175,55,0.35)',
      },
    },
    fontFamily: {
      display: ['"Playfair Display"', 'serif'],
      sans: ['Poppins', 'system-ui', 'sans-serif'],
    },
  },
  plugins: [],
}
