# Changelog

## 202601021200 - Added HTML Comment Stripping for Published Notes

- **Why**: Allow users to include private comments/notes within markdown files that won't appear in published content
- **Changes**:
  - Added `removeHtmlComments` function to linkedNotesHelpers.ts with regex pattern `<!--[\s\S]*?-->` to match single and multi-line HTML comments
  - Updated LinkedNotesCompiler.compile to strip HTML comments from main content before processing linked notes
  - Updated LinkedNotesCompiler.resolveNote to strip HTML comments from linked note content after frontmatter removal but before section/block extraction
- **Dependencies**: No new dependencies added (uses regex pattern matching)

## 202501271200 - Fixed Mobile Loading Error with Process Variable

- **Why**: Plugin was failing to load on mobile devices with "Can't find variable: process" error due to dependencies checking process.env.NODE_ENV which doesn't exist in mobile browsers
- **Changes**:
  - Added custom rollup plugin to replace process.env.NODE_ENV references with "production" string literal
  - Fixed mobile compatibility by eliminating Node.js-specific global variable usage
  - Maintained all existing functionality while ensuring mobile browser compatibility
- **Dependencies**: No new dependencies added (uses existing rollup configuration)

## 202508262254 - Fixed Dynamic Import Chunk Loading Error for Chart Library

- **Why**: Chart modal was failing with "Cannot find module './index-443d1fb2.js'" error due to rollup creating separate chunks for dynamic imports that couldn't be resolved at runtime in Obsidian environment
- **Changes**:
  - Added `inlineDynamicImports: true` to rollup config to bundle dynamic imports inline instead of creating separate chunks
  - Enhanced nodeResolve plugin configuration with proper export conditions
  - Added fallback CDN loading mechanism for @observablehq/plot library if local import fails
  - Dependencies: @observablehq/plot (already present)

## 202501201600 - Implemented Lazy Loading for Chart Library to Fix Mobile Compatibility

- **Why**: Fix mobile loading issues caused by @observablehq/plot library compatibility problems on iOS devices
- **Changes**:
  - Replaced direct Plot import with dynamic import() for lazy loading
  - Added ChartComponent with error boundary and loading states
  - Created SimpleStatsDisplay fallback component for when charts fail to load
  - Added comprehensive error handling to prevent plugin crashes on mobile
  - Enhanced CSS utilities for fallback display styling
  - Maintained all existing chart functionality while improving mobile reliability
- **Dependencies**: No new dependencies added (uses existing dynamic import)

## 202501201545 - Added yp-publish-url File Property After Upload

- **Why**: Add file property to track published files with their upload URL for better file management and tracking
- **Changes**:
  - Created addYpPublishUrl helper function to add yp-publish-url property to file frontmatter
  - Updated file upload logic to add yp-publish-url: example.com after successful upload
  - Added error handling for file modification operations
  - Enhanced upload pipeline to modify file properties post-upload
- **Dependencies**: No new dependencies added (uses existing Obsidian API)

## 202501201530 - Enhanced Linked Notes Compiler to Exclude Frontmatter

- **Why**: Resolve linked notes with only content content, excluding frontmatter properties like `yp-publish: false` for cleaner published content
- **Changes**:
  - Added removeFrontmatter function to linkedNotesHelpers.ts with regex pattern to strip YAML frontmatter blocks
  - Updated LinkedNotesCompiler.resolveNote to remove frontmatter before processing linked notes content
  - Fixed TypeScript compatibility issues by replacing matchAll with exec loop for ES6 target compatibility
  - Enhanced note resolution to exclude metadata while preserving actual content
- **Dependencies**: No new dependencies added (uses existing regex patterns)

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
  - Added comprehensive utility classes to styles.css with yp- prefix for flex, text, margin, padding, and grid
  - Updated VaultDetail.tsx to use yp- prefixed utility classes instead of Tailwind classes
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
