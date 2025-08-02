# PRD: Remove Tailwind CSS from YourPulse Obsidian Plugin

## Introduction/Overview

The YourPulse Obsidian plugin currently uses Tailwind CSS for styling its shadcn/ui components (Card and Badge). This creates performance concerns due to bundle size and potential conflicts with Obsidian's CSS system. The goal is to convert all Tailwind-based components to use vanilla CSS while maintaining identical visual appearance and functionality.

## Goals

1. **Eliminate Tailwind CSS dependency** - Remove all Tailwind classes and configuration
2. **Maintain visual fidelity** - Ensure no visual regression compared to current design
3. **Preserve component APIs** - Keep all existing props, variants, and functionality
4. **Reduce bundle size** - Decrease plugin size by removing Tailwind CSS
5. **Improve compatibility** - Eliminate potential conflicts with Obsidian's CSS

## User Stories

- **As an end user**, I want the plugin to load faster without the overhead of Tailwind CSS
- **As an end user**, I want the plugin to work seamlessly with Obsidian's theming system
- **As a plugin developer**, I want to reduce bundle size and eliminate CSS conflicts
- **As a maintainer**, I want simpler CSS management without external dependencies

## Functional Requirements

1. **Convert Card component** - Replace all Tailwind classes with vanilla CSS while maintaining:

   - Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter variants
   - All existing props and className support
   - Responsive behavior and layout

2. **Convert Badge component** - Replace all Tailwind classes with vanilla CSS while maintaining:

   - All variant types (default, secondary, destructive, outline)
   - asChild prop functionality
   - Icon support and spacing
   - Focus and hover states

3. **Remove Tailwind configuration** - Delete tailwind.config.js and related dependencies

4. **Update build process** - Remove Tailwind from build pipeline and dependencies

5. **Maintain TypeScript support** - Preserve all type definitions and interfaces

6. **Preserve accessibility** - Maintain all ARIA attributes and keyboard navigation

## Non-Goals (Out of Scope)

- Changes to component APIs or prop interfaces
- Redesign of visual appearance or layout
- Changes to component functionality or behavior
- Addition of new components or features
- Changes to component variants or options

## Design Considerations

- **Visual consistency**: All components must maintain exact visual appearance
- **Theme compatibility**: Support both light and dark themes
- **Obsidian integration**: Ensure no conflicts with Obsidian's CSS system
- **Responsive design**: Maintain current responsive behavior
- **Accessibility**: Preserve all accessibility features and ARIA attributes

## Technical Considerations

- **CSS methodology**: Use vanilla CSS with CSS custom properties for theming
- **Component isolation**: Ensure CSS doesn't leak into Obsidian's global styles
- **Build optimization**: Remove Tailwind from build process and dependencies
- **TypeScript integration**: Maintain full TypeScript support
- **Obsidian plugin environment**: Ensure compatibility with Obsidian's plugin system

## Success Metrics

- **Bundle size reduction**: Measurable decrease in plugin bundle size
- **Visual regression**: Zero visual differences compared to current implementation
- **Performance improvement**: Faster plugin loading times
- **CSS conflicts**: Elimination of any conflicts with Obsidian's CSS
- **Maintainability**: Simplified CSS management without external dependencies

## Open Questions

1. Should we use CSS modules or scoped CSS to prevent style leakage?
2. How should we handle CSS custom properties for theming?
3. What is the target bundle size reduction we want to achieve?
4. Should we create a CSS reset to ensure consistent styling in Obsidian?
5. How should we handle responsive breakpoints without Tailwind's utilities?

## Implementation Notes

- Focus on Card and Badge components initially
- Use CSS custom properties for color theming
- Maintain className prop support for custom styling
- Test thoroughly in both light and dark Obsidian themes
- Ensure all component variants work correctly
- Preserve all existing TypeScript interfaces and types
