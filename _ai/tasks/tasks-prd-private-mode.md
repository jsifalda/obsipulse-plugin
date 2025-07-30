# Task List: Private Mode Feature Implementation

## Relevant Files

- `src/main.ts` - Main plugin file containing settings, API calls, and UI components
- `src/main.test.ts` - Unit tests for main plugin functionality
- `src/helpers/Encryption.ts` - License key validation and encryption utilities
- `src/helpers/Encryption.test.ts` - Unit tests for encryption utilities
- `src/components/PrivateModeModal.ts` - New modal component for private mode interactions
- `src/components/PrivateModeModal.test.ts` - Unit tests for modal component
- `src/utils/apiInterceptor.ts` - New utility for intercepting and blocking API requests
- `src/utils/apiInterceptor.test.ts` - Unit tests for API interception
- `src/styles.css` - CSS styles for private mode visual indicators
- `src/constants.ts` - Constants for private mode configuration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Enable Private Mode Settings Integration

  - [x] 1.1 Uncomment privateMode field in YourPulseSettings interface
  - [x] 1.2 Add privateMode to DEFAULT_SETTINGS with false as default value
  - [x] 1.3 Modify YourPulseSettingTab.display() to enable private mode toggle when license key is valid
  - [x] 1.4 Implement license key validation check before enabling private mode toggle
  - [x] 1.5 Add onChange handler for private mode toggle to save settings
  - [x] 1.6 Update loadSettings() to load privateMode setting from saved data
  - [x] 1.7 Add unit tests for settings integration and license key validation

- [ ] 2.0 Implement API Request Blocking System

  - [ ] 2.1 Create apiInterceptor utility with isPrivateModeActive() function
  - [ ] 2.2 Modify updateDb() method to check private mode before making API requests
  - [ ] 2.3 Modify updateFilesDb() method to check private mode before making API requests
  - [ ] 2.4 Modify updatePluginList() method to check private mode before making API requests
  - [ ] 2.5 Add private mode check to all other API call locations in the codebase
  - [ ] 2.6 Implement logging for blocked API requests when private mode is active
  - [ ] 2.7 Add unit tests for API blocking functionality

- [ ] 3.0 Create Modal Window System for Private Mode

  - [ ] 3.1 Create PrivateModeModal class extending Obsidian's Modal
  - [ ] 3.2 Implement modal constructor with "hello" content display
  - [ ] 3.3 Add onOpen() method to set modal content and styling
  - [ ] 3.4 Create showPrivateModeModal() helper method in main plugin class
  - [ ] 3.5 Add modal styling to styles.css for consistent design
  - [ ] 3.6 Implement modal positioning and sizing for optimal UX
  - [ ] 3.7 Add unit tests for modal functionality and content display

- [ ] 4.0 Add Visual Indicators for Private Mode State

  - [ ] 4.1 Add CSS classes for private mode visual indicators in styles.css
  - [ ] 4.2 Modify status bar styling when private mode is active
  - [ ] 4.3 Update ribbon button styling for private mode state
  - [ ] 4.4 Add visual indicator to settings page when private mode is enabled
  - [ ] 4.5 Implement dynamic class toggling based on private mode state
  - [ ] 4.6 Add unit tests for visual indicator functionality

- [ ] 5.0 Implement Event Handler Modifications for Private Mode
  - [ ] 5.1 Modify openYourPulseProfile() method to show modal instead of external redirect
  - [ ] 5.2 Update status bar click handler to check private mode before external redirect
  - [ ] 5.3 Modify ribbon button click handler for private mode behavior
  - [ ] 5.4 Update command palette handlers to respect private mode setting
  - [ ] 5.5 Add private mode check to all external link/redirect functionality
  - [ ] 5.6 Implement fallback behavior for when private mode is disabled
  - [ ] 5.7 Add unit tests for event handler modifications
