---
name: Mesa CLICK
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0edea'
  surface-container-high: '#ebe8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#594138'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#8d7167'
  outline-variant: '#e1bfb3'
  surface-tint: '#a63b00'
  primary: '#a23900'
  on-primary: '#ffffff'
  primary-container: '#cb4a04'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb599'
  secondary: '#5e00e4'
  on-secondary: '#ffffff'
  secondary-container: '#7736ff'
  on-secondary-container: '#eee4ff'
  tertiary: '#0055c9'
  on-tertiary: '#ffffff'
  tertiary-container: '#036cfb'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cfbdff'
  on-secondary-fixed: '#22005d'
  on-secondary-fixed-variant: '#5400cc'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b1c5ff'
  on-tertiary-fixed: '#001946'
  on-tertiary-fixed-variant: '#00419e'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display-lg:
    fontFamily: plusJakartaSans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: plusJakartaSans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-md:
    fontFamily: plusJakartaSans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: plusJakartaSans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: plusJakartaSans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: plusJakartaSans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: plusJakartaSans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
---

## Brand & Style

The design system is built on the pillars of efficiency, warmth, and professional reliability. Designed specifically for the high-pressure environment of restaurant administration, the visual language balances the vibrant energy of the gastronomic industry with the structured utility of a productivity tool.

The style is **Corporate / Modern** with a distinct focus on high-legibility and tactile interaction. It leverages the familiar structural logic of popular CSS frameworks but elevates the aesthetic through a refined color palette and generous whitespace. The goal is to evoke a sense of "organized heat"—the excitement of a busy kitchen managed through a calm, professional digital interface. Mobile-first usability is the primary driver, ensuring that administrators can manage orders with speed and precision while on the move.

## Colors

The color palette is designed to stimulate appetite while maintaining functional clarity. 

- **Primary Orange (#E25B1A):** Used for primary actions, critical statuses, and brand presence. It provides high visibility in low-light restaurant environments.
- **Soft Orange Background (#FAE8D8):** Provides a warm, low-strain backdrop for long periods of use, differentiating the platform from cold, sterile administrative tools.
- **Dark Text (#1A1A18):** Ensures WCAG AA compliance against both white and soft orange surfaces.
- **Functional Accents:** The secondary purple and tertiary blue (derived from the core framework inspiration) are reserved for informational states, deep-link navigation, and secondary utility features to avoid clashing with the primary brand orange.

## Typography

The design system utilizes **Plus Jakarta Sans** to achieve a friendly yet geometric and modern look that echoes the requested aesthetic. 

Headlines are set with tight tracking and bold weights to establish a clear hierarchy, essential for scanning order lists quickly. Body text is optimized for readability with a generous line height, ensuring that restaurant administrators can read order details at a glance. Labels and utility text use a slightly increased font-weight to maintain legibility even when reduced in size on mobile screens.

## Layout & Spacing

The layout follows a **Fluid Grid** model, optimized for mobile devices but scalable to tablet and desktop "Kitchen Display System" (KDS) views. 

The rhythm is based on an **8px base unit**, ensuring consistent alignment across all components. For mobile views, the system uses a standard 16px side margin. Components like cards and list items utilize 16px gutters to provide enough tap-target clearance for fast-paced administrative tasks. Layout containers should prefer flexbox for dynamic scaling, allowing the UI to adapt to various smartphone aspect ratios seamlessly.

## Elevation & Depth

The design system employs **Tonal Layers** combined with **Ambient Shadows** to create a structured sense of depth.

- **Level 0 (Background):** The soft orange (#FAE8D8) surface acts as the base canvas.
- **Level 1 (Cards/Surfaces):** White (#FFFFFF) containers sit on the background with a subtle, 4px blur shadow (10% opacity of the neutral color) to indicate interactable areas.
- **Level 2 (Modals/Popovers):** Higher elevation elements use a more pronounced 12px blur shadow to draw focus during critical tasks like "Confirm Order" or "Edit Price."

Shadows should never be pure black; they are slightly tinted with the primary orange or neutral dark to maintain the warmth of the interface.

## Shapes

The shape language is **Rounded**, utilizing a 0.5rem (8px) corner radius as the standard for all primary components. This choice balances the professional rigor of a business tool with the approachable, friendly nature of a food-service brand. 

- **Buttons & Inputs:** Follow the 8px standard.
- **Cards:** Use a larger `rounded-lg` (1rem) for the outer container to create a soft, modern frame for content.
- **Status Pills:** Utilize a full-round (pill) shape to distinguish them from actionable buttons.

## Components

The components within the design system prioritize thumb-friendly interaction and high-contrast feedback.

- **Buttons:** Primary buttons use the brand orange (#E25B1A) with white text. Secondary buttons use a transparent background with an orange border. All buttons have a minimum height of 48px to ensure easy tapping.
- **Order Cards:** Feature a white background, 1rem corner radius, and a thick left-border accent that changes color based on order status (e.g., Orange for "Pending", Blue for "In Progress").
- **Input Fields:** Utilize white backgrounds with a 1px border (#212529 at 20% opacity). Upon focus, the border shifts to the primary orange with a 3px soft glow.
- **Chips/Status Indicators:** Used for table numbers and order categories. These use low-saturation versions of the brand colors to avoid visual clutter while providing clear categorization.
- **Floating Action Button (FAB):** For "New Order" or "Quick Search," a FAB in the brand orange is positioned in the bottom right for easy access during one-handed mobile operation.
- **List Items:** High-density rows for inventory or menu management, featuring 16px vertical padding and subtle bottom dividers.