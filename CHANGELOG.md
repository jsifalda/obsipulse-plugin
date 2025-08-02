# Changelog

## 202501201520 - Removed Tailwind CSS Dependencies and Converted to Vanilla CSS

- **Why**: Eliminate Tailwind CSS dependency to reduce bundle size, improve performance, and eliminate potential conflicts with Obsidian's CSS system
- **Changes**:
  - Removed Tailwind CSS dependencies: tailwindcss@^4.1.11, @tailwindcss/postcss@^4.1.11, tailwind-merge@^3.3.1, tw-animate-css@^1.3.6, autoprefixer@^10.4.14
  - Deleted tailwind.config.js configuration file
  - Updated rollup.config.js to remove Tailwind PostCSS plugin
  - Removed Tailwind imports from src/styles.css and converted @apply directives to vanilla CSS
  - Converted Card component from Tailwind classes to vanilla CSS with yp- prefix
  - Converted Badge component from Tailwind classes to vanilla CSS with yp- prefix
  - Created card.css and badge.css files with direct color values instead of CSS variables
  - Updated lib/utils.ts to remove tailwind-merge dependency from cn function
  - Cleaned up src/styles.css by removing all color CSS variables and @theme inline section
  - Maintained all component APIs, variants, and functionality
  - Preserved accessibility features and responsive behavior
  - Simplified CSS structure with direct color values and explicit dark theme selectors
- **Dependencies**: Removed tailwindcss, @tailwindcss/postcss, tailwind-merge, tw-animate-css, autoprefixer

## 202501201510 - Removed Max Content Limit for Internal Link Resolver

- **Why**: Remove content size restrictions to allow unlimited note content resolution for better linked notes functionality
- **Changes**:
  - Removed maxContentSize parameter from LinkedNotesCompiler constructor
  - Removed isContentTooLarge check from note resolution process
  - Removed linkedNotesMaxContentSize setting from YourPulseSettings interface
  - Removed Max Content Size slider from settings UI
  - Updated LinkedNotesCompiler to process notes without size limitations
  - Removed setMaxContentSize method from LinkedNotesCompiler class
- **Dependencies**: No new dependencies added (removed content size restrictions)

## 202501201500 - Implemented Linked Notes Resolution Feature

- **Why**: Resolve `![[note]]` references before file upload to make published content self-contained and more readable
- **Changes**:
  - Created LinkedNotesCompiler class following DataViewCompiler pattern with linked notes detection using regex pattern `!\[\[note\]\]`
  - Added file content reading functionality using Obsidian API with circular reference detection to prevent infinite loops
  - Implemented error handling for missing or deleted linked notes with content replacement logic
  - Added recursive resolution for nested linked notes with depth limiting to prevent excessive recursion
  - Integrated LinkedNotesCompiler into main upload pipeline before DataViewCompiler for proper processing order
  - Added performance monitoring with console.time for linked notes resolution
  - Implemented memoization to avoid repeated resolution of same notes and content size limits to prevent performance issues
  - Added user configuration options: enable/disable linked notes resolution, maximum resolution depth (1-10), and content size limits (0.1-10MB)
  - Created linkedNotesHelpers utility functions for note detection, file finding, content reading, and circular reference detection
  - Updated YourPulseSettings interface to include linkedNotesEnabled, linkedNotesMaxDepth, and linkedNotesMaxContentSize options
  - Added settings UI with toggle for linked notes resolution and sliders for depth and content size configuration
- **Dependencies**: No new dependencies added (uses existing Obsidian API)

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

## 202501191200 - Created PRD for Linked Notes Resolution Feature

- **Why**: User requested feature to resolve `![[note]]` references before file upload to make published content self-contained and more readable
- **Changes**: Created comprehensive PRD document outlining linked notes resolution functionality
- **Dependencies**: No new dependencies added (PRD only)

## Previous changes...
