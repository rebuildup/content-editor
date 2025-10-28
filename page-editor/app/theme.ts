import { alpha, createTheme } from "@mui/material/styles";

const paletteBackground = {
  default: "#0a0a0a", // 黒寄りのモノクロ背景
  paper: "#0d0d0d",
};

const theme = createTheme({
  spacing: 6,
  palette: {
    mode: "dark",
    primary: { main: "#1d4ed8" }, // アクセントは維持
    secondary: { main: "#5b21b6" },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: paletteBackground,
    divider: alpha("#ffffff", 0.06),
    action: {
      hover: alpha("#ffffff", 0.03),
      selected: alpha("#ffffff", 0.06),
      disabled: alpha("#ffffff", 0.18),
      disabledBackground: alpha("#ffffff", 0.05),
      focus: alpha("#ffffff", 0.1),
      active: alpha("#ffffff", 0.56),
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Inter Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 13,
    body2: { color: alpha("#ffffff", 0.6) },
    body1: { color: alpha("#ffffff", 0.78) },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          letterSpacing: 0,
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
        html: {
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "none",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: "small",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          paddingInline: 12,
          minHeight: 28,
          borderRadius: 6,
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },
    MuiFormControl: {
      defaultProps: { size: "small" },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 12,
          "&:last-child": { paddingBottom: 12 },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 24,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          opacity: 1,
        },
      },
    },
  },
});

export default theme;
