import Constants from 'expo-constants';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only HTML shell.
 * Loads the portal brand theme from /public (never bundled into JS).
 * Fonts: 'Noto Sans' body + 'Fraunces' display (both variable, self-hosted
 * fallback stacks keep Hindi/Malayalam rendering on system Noto faces).
 *
 * On GitHub Pages the site is served under the repo path (experiments.baseUrl
 * in app.json, e.g. /sih-farmer-queue), so the asset hrefs must be prefixed
 * with that path — otherwise the root-absolute URLs would 404.
 */
const IS_DEV = process.env.NODE_ENV === 'development';
const BASE_URL = IS_DEV ? '' : (Constants.expoConfig?.experiments?.baseUrl ?? '');

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#141d3d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=swap"
        />
        <ScrollViewStyleReset />
        <link rel="stylesheet" href={`${BASE_URL}/bootstrap.min.css`} />
        <link rel="stylesheet" href={`${BASE_URL}/bootstrap-icons.css`} />
        <link rel="stylesheet" href={`${BASE_URL}/bootstrap-theme.css`} />
      </head>
      <body>{children}</body>
    </html>
  );
}