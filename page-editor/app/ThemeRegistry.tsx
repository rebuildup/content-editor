"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useServerInsertedHTML } from "next/navigation";
import { useMemo } from "react";
import theme from "./theme";

type ThemeRegistryProps = {
  children: React.ReactNode;
};

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [{ cache, flush }] = useMemo(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return [{ cache, flush }];
  }, []);

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    const cssText = names
      .map((name) => cache.inserted[name])
      .filter(Boolean)
      .join(" ");
    return <style data-emotion={`mui ${names.join(" ")}`}>{cssText}</style>;
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
