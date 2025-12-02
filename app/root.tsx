import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again later.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    switch (error.status) {
      case 404:
        title = "Page not found";
        message =
          "The page you're looking for doesn't exist or has been moved.";
        break;
      case 401:
        title = "Unauthorized";
        message = "You need to be logged in to access this page.";
        break;
      case 403:
        title = "Access denied";
        message = "You don't have permission to access this page.";
        break;
      default:
        title = "Something went wrong";
        message = error.statusText || message;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    message = error.message;
    stack = error.stack;
  }

  return (
    <div className="error-page">
      <div className="error-content">
        <span className="error-status">{status}</span>
        <h1 className="error-title">{title}</h1>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <a href="/" className="error-btn error-btn-primary">
            Go to Homepage
          </a>
          <button
            type="button"
            className="error-btn error-btn-secondary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
        {stack && (
          <details className="error-stack">
            <summary>Error Details</summary>
            <pre>
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
