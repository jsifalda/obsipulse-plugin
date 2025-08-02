# Tasks: Linked Notes Resolution Before File Upload

## Relevant Files

- `src/compilers/LinkedNotesCompiler.ts` - New compiler class for resolving linked notes before upload.
- `src/compilers/LinkedNotesCompiler.test.ts` - Unit tests for the LinkedNotesCompiler class.
- `src/main.ts` - Main plugin file where the linked notes resolution will be integrated into the upload pipeline.
- `src/main.test.ts` - Unit tests for the main plugin file integration.
- `src/helpers/linkedNotesHelpers.ts` - Utility functions for linked notes detection and resolution.
- `src/helpers/linkedNotesHelpers.test.ts` - Unit tests for linked notes helper functions.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `LinkedNotesCompiler.ts` and `LinkedNotesCompiler.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Create LinkedNotesCompiler Class

  - [ ] 1.1 Create basic LinkedNotesCompiler class structure following DataviewCompiler pattern
  - [ ] 1.2 Implement linked notes detection using regex pattern `!\[\[note\]\]`
  - [ ] 1.3 Add file content reading functionality using Obsidian API
  - [ ] 1.4 Implement circular reference detection to prevent infinite loops
  - [ ] 1.5 Add error handling for missing or deleted linked notes
  - [ ] 1.6 Create unit tests for LinkedNotesCompiler functionality

- [ ] 2.0 Implement Linked Notes Resolution Logic

  - [ ] 2.1 Add method to extract note names from `![[note]]` patterns
  - [ ] 2.2 Implement note content retrieval using Obsidian vault API
  - [ ] 2.3 Add content replacement logic to substitute links with actual content
  - [ ] 2.4 Implement recursive resolution for nested linked notes
  - [ ] 2.5 Add depth limiting to prevent excessive recursion
  - [ ] 2.6 Create unit tests for resolution logic

- [ ] 3.0 Integrate with Existing Upload Pipeline

  - [ ] 3.1 Modify main.ts to include LinkedNotesCompiler in upload process
  - [ ] 3.2 Ensure linked notes resolution runs before DataviewCompiler
  - [ ] 3.3 Add performance monitoring for linked notes resolution
  - [ ] 3.4 Update error handling to continue upload if resolution fails
  - [ ] 3.5 Create unit tests for pipeline integration

- [ ] 4.0 Add Performance Optimization Features

  - [ ] 4.1 Add memoization to avoid repeated resolution of same notes
  - [ ] 4.2 Implement content size limits to prevent performance issues
  - [ ] 4.3 Add configuration options for resolution depth
  - [ ] 4.4 Create unit tests for performance features

- [ ] 5.0 Add User Configuration Options
  - [ ] 5.1 Add settings to enable/disable linked notes resolution
  - [ ] 5.2 Add configuration for maximum resolution depth
  - [ ] 5.3 Add option to limit resolved content size
  - [ ] 5.4 Create unit tests for configuration options
