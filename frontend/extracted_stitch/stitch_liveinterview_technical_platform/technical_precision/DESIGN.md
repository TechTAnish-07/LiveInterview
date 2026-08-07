---
name: Technical Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#47464f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#787680'
  outline-variant: '#c8c5d0'
  surface-tint: '#5b598c'
  primary: '#070235'
  on-primary: '#ffffff'
  primary-container: '#1e1b4b'
  on-primary-container: '#8683ba'
  inverse-primary: '#c4c1fb'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000e0c'
  on-tertiary: '#ffffff'
  tertiary-container: '#002723'
  on-tertiary-container: '#1a998d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c1fb'
  on-primary-fixed: '#181445'
  on-primary-fixed-variant: '#444173'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style
The design system for this product is built on a foundation of engineering excellence and professional reliability. The aesthetic is "High-Precision Corporate," drawing inspiration from high-end developer tools and modern workspace platforms. It prioritizes clarity, performance, and focus, ensuring that the interface never distracts from the critical task of technical evaluation.

The design language utilizes a refined version of Modernism: 
- **Efficiency-First:** Minimalist interfaces that leverage generous whitespace to reduce cognitive load during high-pressure interviews.
- **Polished Utility:** Every element serves a functional purpose, with subtle glassmorphism and soft shadows used to indicate hierarchy rather than for mere decoration.
- **Technical Sophistication:** Precision-aligned grids and consistent stroke weights reflect the rigor of the engineering disciplines the platform serves.

## Colors
The palette is rooted in a "Deep Navy" primary to establish authority and trust. The "Electric Blue" accent is used for primary actions and focused states, while "Teal" is reserved for success states and technical indicators (like 'Live' status or 'Code Passed').

**Color Application:**
- **Primary (#1E1B4B):** Used for navigation sidebars, heavy headings, and high-emphasis surfaces.
- **Accent (#3B82F6):** Used for primary buttons, active input borders, and progress indicators.
- **Support (#0D9488):** Applied to success tags, completion states, and collaborative indicators.
- **Background (#F8FAFC):** The canvas for light mode, providing a cool, crisp environment.
- **Dark Mode:** Surfaces should shift to a deep charcoal (#0F172A) rather than pure black, maintaining the sophisticated "Engineering" feel.

## Typography
The system uses **Inter** for all UI and editorial content to ensure maximum legibility across different resolutions. To emphasize the product's technical core, **JetBrains Mono** is introduced for labels, metadata, and the code editor environments.

**Guidelines:**
- **Headings:** Use tight letter-spacing for headlines to create a "dense" and professional appearance.
- **Body:** Use the standard weight (400) for general content and medium (500) for emphasized text or secondary buttons.
- **Monospace:** Use for any technical data, including IDs, timestamps, and the integrated code editor.

## Layout & Spacing
The layout follows a strict 4px baseline grid to maintain alignment across complex data-heavy views.

**Grid Strategy:**
- **Desktop:** A 12-column fluid grid for dashboard views, switching to a 2-column "Master-Detail" split for live interviews (Video/Notes on left, Code/Editor on right).
- **Margins:** 32px on desktop, scaling down to 16px on mobile.
- **Rhythm:** Use "md" (16px) for standard component padding and "lg" (24px) for spacing between logical sections or card groups.

## Elevation & Depth
Depth in this design system is used to signify interactivity and layer hierarchy. It avoids heavy shadows in favor of subtle "ambient" elevation.

- **Level 0 (Surface):** The main background color (#F8FAFC).
- **Level 1 (Card):** White background with a 1px border (#E2E8F0) and a very soft, diffused shadow (0 4px 6px -1px rgb(0 0 0 / 0.1)).
- **Level 2 (Active/Floating):** Used for modals and dropdowns. Features a more pronounced shadow and a subtle inner border for crispness.
- **Depth Cues:** Interactive cards should subtly lift (increase shadow) on hover to provide tactile feedback to the user.

## Shapes
The shape language balances approachability with professional structure. All containers and buttons use a consistent rounded corner radius.

- **Cards & Input Fields:** 8px (0.5rem) corner radius.
- **Buttons & Tags:** 6px (0.375rem) for a sharper, more precise appearance than large rounded pills.
- **Video Tiles:** 12px (0.75rem) to differentiate human-centric content from UI-centric content.

## Components

### Buttons
- **Primary:** Deep Navy background, white text. No gradient. Focus state uses an Electric Blue ring.
- **Secondary:** Transparent background, 1px border (#CBD5E1), Deep Navy text.
- **Ghost:** No background or border. Text color inherits from context.

### Input Fields
- Use a 1px border (#CBD5E1). On focus, the border changes to Electric Blue with a subtle outer glow.
- Labels are always positioned above the input field using `label-md` typography.

### Status Tags
- **Scheduled:** Light blue background, Electric Blue text.
- **Completed:** Light grey background, Deep Navy text.
- **In Progress:** Light teal background, Teal text.

### Video Tiles
- Minimalistic frames. Name labels are placed in the bottom-left corner on a semi-transparent dark blur.
- Active speaker is indicated by a 2px Electric Blue border ring.

### Code Editor Panels
- Dark-themed by default (#0F172A) even in light mode to mimic developer environments.
- Syntax highlighting should use a professional palette (Avoid overly neon colors).
- Sidebar within the editor for file navigation uses a slightly lighter charcoal background.