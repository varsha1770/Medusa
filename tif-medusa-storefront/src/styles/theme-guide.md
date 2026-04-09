# Storefront Theme Guide

This file documents the shared storefront theme aligned with the homepage design.

## Core Theme Files

- `src/styles/storefront-theme.css`: Shared design tokens and common UI styles.
- `src/styles/globals.css`: Global utility and component classes.
- `tailwind.config.js`: Tailwind theme extensions used across modules.

## Font

- Primary font family: `Euclid Circular A`
- Tailwind class: `font-euclid-circular-a`

## Color Tokens

Defined in `storefront-theme.css` and `tailwind.config.js`.

- Body text: `text-body`
- Primary heading text: `text-dark`
- Primary action color: `bg-blue`
- Hover action color: `bg-blue-dark`
- Borders/surfaces: `border-gray-3`, `bg-gray-1`, `bg-white`

## Typography Scale

Key theme sizes from Tailwind config:

- `text-heading-1` to `text-heading-6`
- `text-custom-1`, `text-custom-2`, `text-custom-3`
- `text-custom-sm`, `text-custom-xs`

## Shared Components/Utilities

- `storefront-card`
- `storefront-section-title`
- `storefront-primary-btn`
- `bg-gradient-1`

## Swiper Theme

Global Swiper styles are unified in `storefront-theme.css` to match homepage appearance:

- Pagination bullets
- Prev/next buttons
- Icon sizing

If a module needs different Swiper styling, add a scoped class in that module and override locally.

## Global Medusa Class Remap

To keep module code unchanged but enforce a single storefront theme, `storefront-theme.css` remaps common Medusa utility classes:

- Text: `text-ui-fg-base`, `text-ui-fg-subtle`, `text-ui-fg-muted`, `text-ui-fg-interactive`
- Background: `bg-ui-bg-base`, `bg-ui-bg-subtle`, `bg-ui-bg-field`, `bg-ui-bg-field-hover`, `bg-ui-fg-base`, `bg-ui-bg-interactive`
- Border: `border-ui-border-base`
- Common hover utilities for text/border/background

Extended coverage includes:

- Luxury namespace: `text-luxury-text`, `text-luxury-text-secondary`, `border-luxury-border`, `divide-luxury-border`, `bg-luxury-bg-secondary`, `shadow-luxury-lg`
- Neutral utilities used by store surfaces: `border-black/5`, `border-black/10`, `hover:border-black/20`, `bg-stone-50`, `bg-stone-100`, gradient helpers

This is the preferred extension point for future palette changes across the storefront.
