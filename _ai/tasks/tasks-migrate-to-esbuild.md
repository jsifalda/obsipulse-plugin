# Task List: Migrate from Rollup to esbuild Build System

## Relevant Files

- `rollup.config.js` - Current Rollup configuration file (to be replaced)
- `esbuild.config.mjs` - New esbuild configuration file (to be created)
- `package.json` - Package configuration with build scripts and dependencies
- `tsconfig.json` - TypeScript configuration (may need updates)
- `src/main.ts` - Main entry point for the plugin
- `src/styles.css` - CSS file that needs to be handled by esbuild
- `src/components/PrivateModeModalContent.tsx` - React component requiring JSX handling
- `src/components/VaultDetail.tsx` - React component requiring JSX handling
- `src/components/PrivateModeModalContent.test.tsx` - Test files for React components
- `src/components/VaultDetail.test.tsx` - Test files for React components

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The migration should maintain all existing functionality while improving build performance and reducing bundle size.

## Tasks

- [ ] 1.0 Create esbuild Configuration File
  - [ ] 1.1 Create esbuild.config.mjs file based on Obsidian sample plugin pattern
  - [ ] 1.2 Configure entry point to src/main.ts
  - [ ] 1.3 Set up external dependencies (obsidian, crypto, react, react-dom, etc.)
  - [ ] 1.4 Configure JSX/TSX handling for React components
  - [ ] 1.5 Set up CSS bundling for styles.css
  - [ ] 1.6 Configure sourcemap generation for development
  - [ ] 1.7 Add banner comment for generated files
  - [ ] 1.8 Configure tree shaking and minification for production builds
  - [ ] 1.9 Set up watch mode for development

- [ ] 2.0 Update Package.json Dependencies and Scripts
  - [ ] 2.1 Remove Rollup-related dependencies (@rollup/plugin-commonjs, @rollup/plugin-node-resolve, @rollup/plugin-typescript, rollup, rollup-plugin-postcss)
  - [ ] 2.2 Add esbuild dependency
  - [ ] 2.3 Add builtin-modules dependency for external module handling
  - [ ] 2.4 Update dev script to use esbuild.config.mjs
  - [ ] 2.5 Update build script to use esbuild.config.mjs with production flag
  - [ ] 2.6 Add version script for automated version bumping
  - [ ] 2.7 Update TypeScript version to match esbuild compatibility
  - [ ] 2.8 Add @typescript-eslint dependencies for code quality

- [ ] 3.0 Update TypeScript Configuration
  - [ ] 3.1 Review and update tsconfig.json for esbuild compatibility
  - [ ] 3.2 Ensure JSX configuration is compatible with esbuild
  - [ ] 3.3 Update module resolution settings if needed
  - [ ] 3.4 Verify path mapping (@/*) works with esbuild
  - [ ] 3.5 Update target and module settings for optimal esbuild performance

- [ ] 4.0 Handle CSS and Styling
  - [ ] 4.1 Configure esbuild to handle CSS imports
  - [ ] 4.2 Set up CSS bundling for styles.css
  - [ ] 4.3 Ensure Tailwind CSS processing works with esbuild
  - [ ] 4.4 Test CSS output in both development and production modes
  - [ ] 4.5 Verify CSS sourcemaps work correctly

- [ ] 5.0 Test Build System Migration
  - [ ] 5.1 Test development build with watch mode
  - [ ] 5.2 Test production build with minification
  - [ ] 5.3 Verify all React components compile correctly
  - [ ] 5.4 Test TypeScript compilation and type checking
  - [ ] 5.5 Verify external dependencies are properly excluded
  - [ ] 5.6 Test sourcemap generation and debugging
  - [ ] 5.7 Verify bundle size optimization

- [ ] 6.0 Clean Up and Documentation
  - [ ] 6.1 Remove rollup.config.js file
  - [ ] 6.2 Update README.md with new build instructions
  - [ ] 6.3 Update CHANGELOG.md with migration details
  - [ ] 6.4 Test complete plugin functionality in Obsidian
  - [ ] 6.5 Verify all existing features work with new build system
  - [ ] 6.6 Update any CI/CD configurations if applicable

- [ ] 7.0 Performance Optimization
  - [ ] 7.1 Compare build times between Rollup and esbuild
  - [ ] 7.2 Analyze bundle size differences
  - [ ] 7.3 Optimize esbuild configuration for best performance
  - [ ] 7.4 Configure tree shaking for optimal bundle size
  - [ ] 7.5 Test development server startup time

## Migration Benefits

- **Faster Build Times**: esbuild is significantly faster than Rollup
- **Smaller Bundle Size**: Better tree shaking and optimization
- **Simplified Configuration**: Less complex setup compared to Rollup
- **Better TypeScript Integration**: Native TypeScript support
- **Modern Tooling**: Aligns with current Obsidian plugin development standards

## Potential Challenges

- **CSS Handling**: May need additional configuration for CSS processing
- **React JSX**: Ensure proper JSX transformation for React components
- **External Dependencies**: Verify all external modules are properly excluded
- **Source Maps**: Ensure debugging capabilities are maintained
- **Plugin Compatibility**: Test with Obsidian's plugin system 