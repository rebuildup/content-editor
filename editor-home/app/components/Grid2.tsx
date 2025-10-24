"use client";

// Material UI v7 での Grid2 のラッパー
import { styled } from "@mui/material/styles";
import Box, { BoxProps } from "@mui/material/Box";

interface Grid2Props extends BoxProps {
  container?: boolean;
  spacing?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

const Grid2 = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "container" && prop !== "spacing" && prop !== "xs" && prop !== "sm" && prop !== "md" && prop !== "lg" && prop !== "xl",
})<Grid2Props>(({ theme, container, spacing, xs, sm, md, lg, xl }) => ({
  ...(container && {
    display: "grid",
    gridTemplateColumns: `repeat(12, 1fr)`,
    gap: spacing ? theme.spacing(spacing) : 0,
  }),
  ...(!container && {
    gridColumn: `span ${xs || 12}`,
    [theme.breakpoints.up("sm")]: {
      gridColumn: sm ? `span ${sm}` : `span ${xs || 12}`,
    },
    [theme.breakpoints.up("md")]: {
      gridColumn: md ? `span ${md}` : sm ? `span ${sm}` : `span ${xs || 12}`,
    },
    [theme.breakpoints.up("lg")]: {
      gridColumn: lg ? `span ${lg}` : md ? `span ${md}` : sm ? `span ${sm}` : `span ${xs || 12}`,
    },
    [theme.breakpoints.up("xl")]: {
      gridColumn: xl ? `span ${xl}` : lg ? `span ${lg}` : md ? `span ${md}` : sm ? `span ${sm}` : `span ${xs || 12}`,
    },
  }),
}));

export default Grid2;

