# Changelog

## 202501191235 - Enhanced Private Mode Modal with Vault Data Display

- Enhanced PrivateModeModalContent to display vault data using Card components and VaultDetail
- Updated main.ts to pass device data to PrivateModeModal instead of static content
- Added Tailwind CSS imports and comprehensive styling system to styles.css
- Updated tsconfig.json with path mapping for @/* imports
- Added new dependencies: d3@^7.9.0, lucide-react@^0.536.0, tailwindcss@^4.1.11, @observablehq/plot@^0.6.14, class-variance-authority@^0.7.1, clsx@^2.1.1, tailwind-merge@^3.3.1, tw-animate-css@^1.3.6, @radix-ui/react-slot@^1.2.3
- Removed deprecated dependencies: react-calendar-heatmap, prop-types, react-is, memoize-one

## 202501191200 - React Integration for PrivateModeModal

- Added React support to PrivateModeModal for better component management
- Updated rollup.config.js to support JSX/TSX compilation with react-jsx transform
- Updated tsconfig.json to use modern JSX transform and enable React interop
- Created PrivateModeModalContent.tsx React component for modal content
- Modified PrivateModeModal.ts to use React rendering instead of vanilla DOM
- Added @types/react dependency for TypeScript React support

## Previous changes...
