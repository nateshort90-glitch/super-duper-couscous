import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    title: "BountyFix - Get Expert Advice in Minutes",
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-indigo-600">BountyFix</span>
              </Link>
              <nav className="hidden md:ml-10 md:flex md:gap-6">
                <Link to="/submit" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Get Help</Link>
                <Link to="/expert/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600">For Experts</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Log in</Link>
              <Link to="/register" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Sign up</Link>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
