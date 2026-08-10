# Headless Media SDK + Component Library

A cross-platform, headless media SDK ecosystem built with TypeScript, React, and React Native, using the Pexels API as the media data source.

The project is structured around a framework-agnostic core SDK, thin platform wrappers, independent headless UI component libraries, and a React web application that wires the pieces together.

## Overview

The project follows this architecture:

```text id="arch01"
                         ┌──────────────────────┐
                         │      Web App         │
                         │    apps/web-app      │
                         └──────────┬───────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                media-react              media-ui-react
                       │                         │
                       ▼                         │
                 media-core                     │
                       │                         │
                       └─────────────────────────┘


              React Native integration:

                         Native App
                              │
                       ┌──────┴──────┐
                       │             │
                 media-native   media-ui-native
                       │
                       ▼
                  media-core
```

The dependency direction is:

```text id="arch02"
app → wrappers → core
app → components
```

Wrappers and components remain independent of each other, UI components do not depend on the SDK, and the core SDK remains framework-agnostic.

---

# Repository Structure

```text id="repo01"
media-sdk/
│
├── apps/
│   ├── web-app/
│   │   └── src/
│   │
│   └── native-app/
│       ├── App.tsx
│       ├── android/
│       ├── ios/
│       └── __tests__/
│
├── packages/
│   ├── media-core/
│   │   └── src/
│   │
│   ├── media-react/
│   │   └── src/
│   │
│   ├── media-native/
│   │   └── src/
│   │
│   ├── media-ui-react/
│   │   └── src/
│   │
│   └── media-ui-native/
│       └── src/
│
├── skills/
│   ├── wiring-media-data/
│   │   └── SKILL.md
│   │
│   └── using-media-components/
│       └── SKILL.md
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── tsconfig.base.json
```

---

# Packages

## `media-core`

`media-core` is the framework-agnostic TypeScript SDK and contains the media/data layer.

It is responsible for:

* Pexels API communication
* Photo search
* Curated/trending media
* Video search
* Pagination
* Single-item fetching
* API key configuration
* Activity events
* Typed responses
* Error handling
* Basic in-memory caching/request deduplication

The core SDK contains no React, React Native, DOM, or UI dependencies.

### Core responsibilities

The SDK exposes functionality for:

```text id="core01"
Search
Curated / Trending
Pagination
Single Item
Authentication
Events
Caching / Request Deduplication
Error Handling
Typed Contracts
```

The SDK emits activity events such as:

```text id="core02"
view
download
```

and supports subscription/unsubscription through its event mechanism.

---

## `media-react`

`media-react` is the React wrapper around `media-core`.

It provides React-specific APIs such as:

* Provider/context integration
* Media list hooks
* Single media-item hooks
* Event/tracking hooks

The wrapper adapts the core SDK to React without duplicating the underlying business logic.

---

## `media-native`

`media-native` provides the React Native wrapper around `media-core`.

It follows the same general contract as `media-react` while adapting the SDK to React Native.

---

# Headless Component Libraries

The repository provides independent component libraries for React and React Native.

## `media-ui-react`

The React component library provides:

### Grid

A media grid supporting load-more/infinite-scroll behavior.

### Lightbox

A media viewer for displaying a selected item.

### Reel Swiper

A vertically paged, reels-style media experience with active-item detection.

---

## `media-ui-native`

The React Native component library provides equivalent headless components:

* Grid
* Lightbox
* Reel Swiper

The native components are independent from `media-core` and the platform wrappers.

---

# Headless Design

The component libraries follow a headless UI approach.

The components provide behavior and interaction logic without imposing application-specific visual styling.

The consuming application controls:

* Markup/rendering
* Styling
* Media presentation
* Application-specific layout
* Callbacks and event handling

The components receive media data and callbacks through props rather than fetching data themselves.

For example, the application is responsible for connecting SDK data to the UI:

```text id="headless01"
media SDK
    ↓
application
    ↓
headless UI component
    ↓
application-specific rendering
```

The UI components do not know that the data comes from Pexels or from `media-core`.

---

# Web Application

The primary demonstration application is located at:

```text id="web01"
apps/web-app/
```

It consumes both:

```text id="web02"
media-react
media-ui-react
```

The web application is responsible for wiring the SDK data layer to the headless UI components.

## Application Flow

The application demonstrates the required media experience:

```text id="flow01"
Search
  ↓
Grid
  ↓
Select Media
  ↓
Lightbox

Video Results
  ↓
Reels-style View
```

The application uses `media-react` for:

* SDK/provider configuration
* Media retrieval
* Pagination
* Activity/event handling

It uses `media-ui-react` for:

* Grid
* Lightbox
* Reel Swiper

This keeps data access and UI behavior separated.

---

# React Native Application

A React Native consumer application is also included under:

```text id="rn01"
apps/native-app/
```

It demonstrates the React Native side of the same SDK ecosystem using:

```text id="rn02"
media-native
media-ui-native
```

The native application is a platform consumer of the SDK and native headless components.

The React Native implementation is kept separate from the primary web UI application so that platform-specific code does not leak into the framework-agnostic core.

---

# Pexels API

Pexels is used as the media data source for the SDK.

The API key is configured through the SDK initialization/configuration mechanism rather than being embedded into the core business logic or UI components.

A real API key should never be committed to the repository.

For local development, configure the key using the project's supported environment/configuration approach.

---

# Installation

This repository uses **pnpm workspaces**.

Install dependencies from the repository root:

```bash id="install01"
pnpm install
```

---

# Running the Web Application

From the repository root, use the configured workspace script:

```bash id="web01"
pnpm --filter web-app dev
```

Or navigate to the web application:

```bash id="web02"
cd apps/web-app
pnpm dev
```

The web application is built with Vite.

---

# Running the React Native Application

Navigate to the native application:

```bash id="rnrun01"
cd apps/native-app
```

Start Metro:

```bash id="rnrun02"
pnpm start
```

Run Android:

```bash id="rnrun03"
pnpm android
```

For iOS, install CocoaPods dependencies and run:

```bash id="rnrun04"
bundle install
bundle exec pod install
pnpm ios
```

---

# Skills for AI Coding Tools

The repository includes two skill documents:

```text id="skills01"
skills/
├── wiring-media-data/
│   └── SKILL.md
│
└── using-media-components/
    └── SKILL.md
```

## `wiring-media-data`

This skill teaches an AI coding assistant how to:

* Configure the media provider
* Consume media hooks
* Handle authentication/configuration
* Handle loading and errors
* Work with pagination
* Subscribe to activity events

## `using-media-components`

This skill teaches an AI coding assistant how to consume the headless UI libraries, including:

* Grid usage
* Lightbox usage
* Reel Swiper usage
* Prop-getter/component contracts
* Styling responsibilities
* Accessibility considerations

The skills were created to provide implementation-specific guidance rather than generic React instructions.

---

# Architecture Constraints

The project follows the dependency boundaries defined for the SDK.

### Required dependency direction

```text id="dependency01"
Application
   │
   ├── media-react / media-native
   │       │
   │       └── media-core
   │
   └── media-ui-react / media-ui-native
```

### Rules

* `media-core` does not import React, React Native, DOM APIs, or UI packages.
* `media-react` and `media-native` are thin adapters around `media-core`.
* Wrappers do not contain duplicated business logic.
* UI components do not import `media-core`.
* UI components do not import the platform wrappers.
* Wrappers and UI components do not depend on each other.
* Applications are responsible for composing data and UI.
* UI components receive data and callbacks rather than fetching from Pexels.

These boundaries allow the core SDK to theoretically power a CLI or another UI framework without changes.

---

# Testing

The React Native application includes Jest configuration and application tests.

The packages and applications can be tested using the configured pnpm workspace scripts.

---

# AI-Assisted Development

AI coding tools were used during the development of this project.

### AI-assisted areas

AI assistance was used for tasks including:

* Initial project scaffolding
* Boilerplate implementation
* Implementation assistance for SDK and wrapper code
* Debugging and troubleshooting
* Refactoring assistance
* Test and documentation assistance

### Human-driven work

Architecture and final engineering decisions were reviewed and integrated manually, including:

* Package boundaries
* Dependency direction
* SDK/component separation
* Feature scope
* Platform structure
* Final implementation decisions
* Review and correction of AI-generated code

### Skill usage

The two `SKILL.md` documents were used to guide AI-assisted development:

1. `wiring-media-data` — used for SDK/provider/hooks and media-data integration.
2. `using-media-components` — used for consuming the headless component library and its styling/accessibility contract.

The skills were tested in practice while building the application to ensure that the AI assistant followed the intended SDK and component APIs instead of inventing incompatible usage patterns.

---

# Project Scope and Trade-offs

The project was scoped to prioritize the architectural requirements of the assignment within the available development window.

The main priorities were:

1. Correct core/wrapper/component separation
2. Typed SDK contracts
3. Pexels integration
4. Pagination and loading/error handling
5. Activity events
6. Headless UI components
7. Web application integration
8. AI coding-tool skills

Where implementation depth was limited, the focus was placed on maintaining clean dependency boundaries and demonstrating the intended reusable architecture rather than adding unnecessary visual or application-specific complexity.

---

# Documentation and Deployment

The submission includes the following external resources:

* **GitHub Repository:** `ADD_REPOSITORY_URL`
* **Live Web Application:** `ADD_LIVE_APP_URL`
* **SDK Documentation:** `ADD_SDK_DOCS_URL`
* **Component Documentation:** `ADD_COMPONENT_DOCS_URL`
* **AI Coding Discussion(s):** `ADD_CHAT_LINKS`

Replace the placeholders above with the final deployed URLs before submission.

---

# Technology Stack

* TypeScript
* React
* React Native
* Pexels API
* pnpm workspaces
* Vite
* Jest
* React Native Community CLI

---

# Assignment

This project was developed for the **Headless Media SDK + Component Library** Senior React / React Native take-home task.

The implementation focuses on:

* Framework-agnostic SDK architecture
* Thin platform wrappers
* Independent headless component libraries
* React web application integration
* React Native integration
* Typed contracts
* Authentication
* Activity events
* Pagination
* Error/loading handling
* Caching/request deduplication
* AI-assisted development workflow
* Reusable AI coding-tool skills
