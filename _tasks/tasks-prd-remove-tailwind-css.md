# Task List: Remove Tailwind CSS from YourPulse Obsidian Plugin

## Relevant Files

- `components/ui/card.tsx` - Contains the Card component with all its variants (CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter)
- `components/ui/card.css` - New CSS file for Card component styles (to be created)
- `components/ui/badge.tsx` - Contains the Badge component with variant support and asChild prop
- `components/ui/badge.css` - New CSS file for Badge component styles (to be created)
- `lib/utils.ts` - Contains the `cn` utility function that uses tailwind-merge
- `lib/utils.css` - New CSS file for utility styles (to be created)
- `tailwind.config.js` - Tailwind configuration file to be removed
- `rollup.config.js` - Build configuration that includes Tailwind PostCSS plugin
- `package.json` - Contains Tailwind-related dependencies to be removed
- `src/styles.css` - Main stylesheet that may need updates

## Tasks

- [x] 1.0 Remove Tailwind Dependencies and Configuration
  - [x] 1.1 Remove Tailwind CSS dependencies from package.json (tailwindcss, @tailwindcss/postcss, tailwind-merge)
  - [x] 1.2 Remove Tailwind PostCSS plugin from rollup.config.js
  - [x] 1.3 Delete tailwind.config.js file
  - [x] 1.4 Remove autoprefixer dependency if not used elsewhere
  - [x] 1.5 Update package.json scripts if needed
- [x] 2.0 Convert Card Component to Vanilla CSS
  - [x] 2.1 Create card.css file with vanilla CSS equivalents for all Tailwind classes
  - [x] 2.2 Convert Card component to use CSS classes instead of Tailwind classes
  - [x] 2.3 Convert CardHeader component with grid layout and responsive behavior
  - [x] 2.4 Convert CardTitle component with typography styles
  - [x] 2.5 Convert CardDescription component with muted text styles
  - [x] 2.6 Convert CardAction component with positioning styles
  - [x] 2.7 Convert CardContent component with padding styles
  - [x] 2.8 Convert CardFooter component with flex layout and border styles
  - [x] 2.9 Import card.css in card.tsx component
- [x] 3.0 Convert Badge Component to Vanilla CSS
  - [x] 3.1 Create badge.css file with vanilla CSS equivalents for all Tailwind classes
  - [x] 3.2 Convert Badge base styles (inline-flex, rounded, border, etc.)
  - [x] 3.3 Convert Badge variant styles (default, secondary, destructive, outline)
  - [x] 3.4 Convert Badge focus and hover states
  - [x] 3.5 Convert Badge icon support and spacing
  - [x] 3.6 Convert Badge accessibility features (aria-invalid states)
  - [x] 3.7 Import badge.css in badge.tsx component
- [x] 4.0 Update Build Process and Utilities
  - [x] 4.1 Update rollup.config.js to remove Tailwind PostCSS plugin
  - [x] 4.2 Update lib/utils.ts to remove tailwind-merge dependency
  - [x] 4.3 Create utils.css for any utility styles needed
  - [x] 4.4 Update cn function to work without tailwind-merge
  - [x] 4.5 Ensure all CSS files are properly imported in build process
- [x] 5.0 Testing and Validation
  - [x] 5.1 Test Card component in both light and dark Obsidian themes
  - [x] 5.2 Test Badge component with all variants in both themes
  - [x] 5.3 Verify all component props and className support work correctly
  - [x] 5.4 Test responsive behavior and layout preservation
  - [x] 5.5 Verify accessibility features are maintained
  - [x] 5.6 Test build process and ensure no CSS conflicts with Obsidian
  - [x] 5.7 Measure bundle size reduction
  - [x] 5.8 Test plugin loading performance improvement
