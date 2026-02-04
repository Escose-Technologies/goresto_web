/** @type {import('tailwindcss').Config} */

/*
 * ============================================
 * TFS SCHOOL - GLOBAL THEME CONFIGURATION
 * ============================================
 * 
 * All colors and fonts are defined here.
 * To change the theme, simply modify the values below.
 * Changes will automatically apply across ALL pages.
 * 
 * PERFORMANCE: ✅ Zero runtime overhead - compiled at build time
 */

// ===========================================
// THEME COLORS - Change these to update site-wide
// ===========================================
const themeColors = {
    // Primary Blue - Main brand color (buttons, links, headings)
    primary: {
        DEFAULT: 'hsl(224, 64%, 33%)',      // #2E4A8C - Deep Blue
        light: 'hsl(224, 64%, 45%)',         // Lighter variant
        dark: 'hsl(224, 64%, 25%)',          // Darker variant (hover states)
        foreground: 'hsl(0, 0%, 100%)',      // Text on primary bg
    },

    // Secondary Gold - Accent color (highlights, badges)
    secondary: {
        DEFAULT: 'hsl(45, 93%, 47%)',        // #E5A800 - Golden Yellow
        light: 'hsl(45, 93%, 60%)',          // Lighter variant
        dark: 'hsl(45, 93%, 40%)',           // Darker variant
        foreground: 'hsl(222, 47%, 11%)',    // Text on secondary bg
    },

    // Background Colors
    background: {
        DEFAULT: 'hsl(210, 40%, 98%)',       // #F8FAFC - Very light blue-gray
        card: 'hsl(0, 0%, 100%)',            // Pure white for cards
        dark: 'hsl(222, 47%, 11%)',          // Dark mode / footer
    },

    // Text Colors
    foreground: {
        DEFAULT: 'hsl(222, 47%, 11%)',       // #0F172A - Almost black
        muted: 'hsl(215, 16%, 47%)',         // #64748B - Gray text
        light: 'hsl(215, 20%, 65%)',         // Lighter gray
    },

    // UI Colors
    border: 'hsl(214, 32%, 91%)',            // #E2E8F0 - Light borders
    ring: 'hsl(224, 64%, 33%)',              // Focus rings (matches primary)
};

// ===========================================
// THEME FONTS - Change these to update site-wide
// ===========================================
const themeFonts = {
    // Primary Font - Used for body text, UI elements
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],

    // Display Font - Used for headings, titles
    serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],

    // Monospace - Used for code blocks (if needed)
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
};

// ===========================================
// TAILWIND CONFIGURATION
// ===========================================
export default {
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    ],
    theme: {
        extend: {
            fontFamily: themeFonts,
            colors: themeColors,

            // Aurora animation for hero section
            animation: {
                'aurora': 'aurora 15s ease-in-out infinite',
            },
            keyframes: {
                aurora: {
                    '0%, 100%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
                    '33%': { transform: 'translate(-50%, -50%) rotate(120deg) scale(1.1)' },
                    '66%': { transform: 'translate(-50%, -50%) rotate(240deg) scale(0.9)' },
                },
            },
        },
    },
    plugins: [],
};
