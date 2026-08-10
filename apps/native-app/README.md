# Media SDK — React Native

A React Native application demonstrating the React Native integration of a headless Media SDK and component library.

The application uses the **Pexels API** as its media data source and is built using the React Native Community CLI.

## Overview

This project is part of a headless media SDK ecosystem consisting of:

* `media-core` — framework-agnostic TypeScript SDK
* `media-react` — React wrapper around `media-core`
* `media-native` — React Native wrapper around `media-core`
* `media-ui-react` — headless React UI components
* `media-ui-native` — headless React Native UI components
* React Native application — consumes the React Native SDK wrapper and UI components

The architecture keeps data access and UI concerns separate.

```text
React Native App
      │
      ├── media-native
      │       │
      │       └── media-core
      │
      └── media-ui-native
```

The UI components do not depend on the SDK. They receive media data and callbacks through props.

## Prerequisites

Make sure you have completed the React Native environment setup:

https://reactnative.dev/docs/environment-setup

You will also need:

* Node.js
* npm or Yarn
* Android Studio and Android SDK for Android development
* Xcode and CocoaPods for iOS development
* A connected device or Android/iOS simulator

## Configuration

The Media SDK uses the **Pexels API** as its data source.

Configure the Pexels API key through the SDK initialization/configuration rather than directly inside UI components.

### Getting a Pexels API Key

1. Create an account on Pexels.
2. Generate an API key from your Pexels developer account.
3. Configure the key when initializing the Media SDK.

> **Security:** Never commit a real Pexels API key to a public repository. For production applications, use a secure configuration mechanism or backend service.

## Installation

Install project dependencies:

```bash
npm install
```

Or with Yarn:

```bash
yarn install
```

## Running the Application

### 1. Start Metro

From the project root:

```bash
npm start
```

Or:

```bash
yarn start
```

Keep Metro running while developing the application.

### 2. Run on Android

Open a new terminal and run:

```bash
npm run android
```

Or:

```bash
yarn android
```

The application will launch on a connected Android device or emulator.

### 3. Run on iOS

Install the iOS dependencies:

```bash
bundle install
bundle exec pod install
```

Then run:

```bash
npm run ios
```

Or:

```bash
yarn ios
```

The application will launch on an iOS simulator or connected device.

## Media SDK Integration

The React Native application consumes the platform wrapper rather than accessing the Pexels API directly.

The intended dependency direction is:

```text
Application
    │
    ├── media-native
    │       │
    │       └── media-core
    │
    └── media-ui-native
```

`media-native` adapts the framework-agnostic SDK to React Native.

`media-ui-native` is responsible only for presentation and interaction. It does not import `media-core` or `media-native`.

## UI Components

The React Native component library provides headless UI components such as:

### Grid

Displays media items and supports loading additional items as the user scrolls.

### Lightbox

Displays the selected media item in an expanded view.

### Reel Swiper

Provides a vertically paged, reels-style media experience with active-item detection.

The components are headless and do not ship with application-specific styling. The consuming application controls the presentation and styling.

## Media Features

The application is designed to demonstrate:

* Media search
* Curated/trending media
* Pagination
* Media grid
* Load-more / infinite scrolling
* Media lightbox
* Video reel experience
* Media view events
* Media download events

## Development

React Native Fast Refresh automatically updates the application when source files are changed.

Edit the relevant source files and save to see changes reflected in the running application.

For more information:

https://reactnative.dev/docs/fast-refresh

## Project Architecture

The project follows the dependency boundaries defined by the assignment:

```text
                  ┌── media-react ────── media-ui-react
                  │
Application ──────┤
                  │
                  └── media-native ───── media-ui-native
                           │
                           ▼
                       media-core
```

The important architectural rules are:

* The application can consume the wrappers and UI components.
* Platform wrappers depend on `media-core`.
* UI components are independent of `media-core`.
* UI components do not import platform wrappers.
* `media-core` contains no React or React Native dependencies.
* The core SDK contains no UI.
* Wrappers contain no business logic.

## Troubleshooting

If you encounter React Native setup or runtime issues, see the official troubleshooting guide:

https://reactnative.dev/docs/troubleshooting

Common issues may include:

* Android emulator not running
* Android SDK configuration problems
* Metro cache issues
* iOS CocoaPods dependency problems
* Device connection issues

## Useful Resources

* React Native: https://reactnative.dev/
* React Native Environment Setup: https://reactnative.dev/docs/environment-setup
* React Native Getting Started: https://reactnative.dev/docs/getting-started
* React Native Fast Refresh: https://reactnative.dev/docs/fast-refresh
* React Native Troubleshooting: https://reactnative.dev/docs/troubleshooting
* Pexels API: https://www.pexels.com/api/

## Assignment Notes

This project is implemented as part of the **Headless Media SDK + Component Library** take-home task.

The task evaluates:

* Architecture and dependency separation
* SDK design
* Authentication and typed contracts
* Event handling
* Headless component design
* Accessibility
* AI coding workflow and skill documentation
* Practical scoping and engineering judgment

The complete assignment also includes a web application, framework-specific wrappers, independent UI component libraries, and AI coding-tool skill documents.
