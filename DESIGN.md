# Math Morph - Design Document

Math Morph is an interactive mathematical equation visualization tool that allows users to explore functions with real-time parameter morphing. The application is architected to support both a "Base" release and a future "Pro" release.

## 1. Core Features (Base Release)

### 1.1 Real-Time Equation Rendering
- **Explicit Functions**: Supports standard `y = f(x)` notation.
- **Implicit Functions**: Renders complex shapes like circles (`x^2 + y^2 = 25`) and ellipses using a high-resolution Marching Squares algorithm.
- **Math.js Integration**: Uses the `mathjs` library for robust expression parsing.

### 1.2 Interactive Parameter Morphing
- **Dynamic Constants**: Automatically detects numbers and single-letter constants (e.g., `a`, `b`, `k`) in equations.
- **Live Sliders**: Generates interactive sliders for each detected constant, allowing users to "morph" the graph in real-time.
- **Color Coding**: Sliders and their corresponding values in the equation display are color-coded for intuitive mapping.

## 2. Future Features (Pro Mode - Currently Gated)

The following features are fully implemented in the codebase but are currently disabled via the `ENABLE_PRO_MODE` feature flag for the initial Base release.

### 2.1 3D Complex Visualization
- **Complex Plane Projection**: Visualizes the real and imaginary parts of functions in a 3D coordinate system.
- **Smooth Transitions**: Seamlessly transitions between a 2D grid and a 3D perspective view.
- **Interactive Rotation**: Users can rotate the 3D view using `Shift + Drag` to inspect the complex structure of functions like `sqrt(x)` or `log(x)`.

### 2.2 Professional Calculus Tools
- **Derivative Visualization**: Renders the first derivative of the active function.
- **Integral Area**: Shades the area under the curve from the origin to the current viewport edge.
- **Root Detection**: Automatically identifies and marks x-intercepts with a visual "pulse" effect when new roots are found.

## 3. UI/UX Design

### 3.1 Aesthetic: "Technical Minimalist"
- **Dark Theme**: A deep charcoal background (`#0f0f0f`) reduces eye strain and makes neon-colored curves pop.
- **Typography**: Uses **Inter** for UI elements and **Georgia (Serif)** for mathematical equations to evoke a "published paper" feel.
- **Glassmorphism**: Sidebars and control panels use semi-transparent backgrounds with subtle blurs to maintain context.

### 3.2 Layout
- **Main Canvas**: A full-screen p5.js canvas for fluid, high-performance rendering.
- **Floating Controls**: A bento-grid style sidebar on the left for equation input and parameter adjustment.
- **Status Bar**: A clean bottom bar displaying the current equation in publication-ready formatting.

## 4. Technical Implementation

### 4.1 Rendering Engine
- **p5.js**: Handles the core drawing logic, including coordinate transformations and interactive panning/zooming.
- **Marching Squares**: A custom implementation for rendering implicit equations by sampling a grid and generating line segments.
- **3D Projection**: A custom software-based 3D projection matrix that maps `(x, real, imaginary)` coordinates to the 2D screen (used in Pro mode).

### 4.2 State Management
- **React Hooks**: Uses `useState` and `useRef` to manage equation state and rendering parameters.
- **Ref-Based Sync**: Synchronizes React state with the p5.js draw loop using a `stateRef` to ensure zero-latency updates during rapid parameter changes.

### 4.3 Performance Optimizations
- **Adaptive Resolution**: Balances rendering quality and performance by adjusting step sizes based on the current zoom level.
- **Shadow/Glow Effects**: Uses the Canvas `shadowBlur` API for neon glow effects, optimized to only run on active curves.

## 5. Version History

### v1.1.0 (April 6, 2026) - Base Release Candidate
- **Pro Mode Gating**: Refactored the application to hide "Pro" features (3D Complex view, Calculus tools, Linear Algebra, Pro UI toggles) behind an `ENABLE_PRO_MODE` feature flag. The codebase retains these features for future releases.
- **Base Release Streamlining**: Removed the AI Historical Context and Math Insights sections to simplify the base experience. Integrated the remaining Visual Enhancements (Trails, Glow) into the Export section, and moved the "Reset Reference" button for better layout flow.
- **Adaptive Boundary Search**: Fixed fixed-step sampling gaps near domain boundaries by implementing a binary search for exact root/boundary detection.
- **Adaptive Grid Scale**: Replaced static grid with a dynamic, mathematically accurate grid that adjusts logical steps based on zoom level.
- **UI Refinements**: Renamed "Reset Ghost Reference" to "Reset Reference" for clarity.

---
*Last Updated: April 6, 2026*
