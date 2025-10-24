"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#8b5cf6",
            light: "#a78bfa",
            dark: "#7c3aed",
            contrastText: "#ffffff",
        },
        error: {
            main: "#ef4444",
            light: "#f87171",
            dark: "#dc2626",
        },
        warning: {
            main: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
        },
        info: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#2563eb",
        },
        success: {
            main: "#10b981",
            light: "#34d399",
            dark: "#059669",
        },
        background: {
            default: "#f9fafb",
            paper: "#ffffff",
        },
        text: {
            primary: "#111827",
            secondary: "#6b7280",
        },
    },
    typography: {
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        h1: {
            fontSize: "2.25rem",
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: "1.875rem",
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: "1.25rem",
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: "1.125rem",
            fontWeight: 600,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.5,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

