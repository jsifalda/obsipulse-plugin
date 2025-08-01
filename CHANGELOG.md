# Changelog

## 202501201435 - Updated README with Private Mode Documentation
- Added Private Mode feature description to README features list
- Added FAQ section explaining Private Mode security benefits
- Documented that Private Mode can be activated with license key
- Emphasized that Private Mode ensures no data leaves user's vault
- Updated documentation for security-conscious users

## 202501201430
- Updated private mode modal to be responsive with 80% width/height
- Added viewport units (vw/vh) for responsive sizing
- Set min/max constraints to prevent extreme sizes
- Improved modal usability across different screen sizes

## 202501191315 - Fixed Tailwind CSS Loading Error

- Fixed "GET app://obsidian.md/tailwindcss net::ERR_FILE_NOT_FOUND" error when loading plugin
- Updated rollup.config.js to properly process Tailwind CSS v4 with PostCSS
- Added @tailwindcss/postcss dependency for Tailwind CSS v4 PostCSS integration
- Added autoprefixer dependency for CSS vendor prefixing
- Resolved Tailwind CSS import issues in styles.css

## 202501191300 - Created Migration Task Plan for Rollup to esbuild

- Created comprehensive task plan for migrating from Rollup to esbuild build system
- Analyzed current YourPulse plugin structure and dependencies
- Referenced Obsidian sample plugin esbuild configuration pattern
- Identified 7 main task categories with 35 detailed sub-tasks
- Planned removal of Rollup dependencies and addition of esbuild
- Included performance optimization and testing requirements
- Added migration benefits and potential challenges analysis

## 202501191235 - Enhanced Private Mode Modal with Vault Data Display

- Enhanced PrivateModeModalContent to display vault data using Card components and VaultDetail
- Updated main.ts to pass device data to PrivateModeModal instead of static content
- Added Tailwind CSS imports and comprehensive styling system to styles.css
- Updated tsconfig.json with path mapping for @/\* imports
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
