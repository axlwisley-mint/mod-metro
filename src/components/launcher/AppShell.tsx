import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Boxes, Home, Settings, Shirt, User } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLauncher } from "@/lib/launcher/store";
import { cn } from "@/lib/utils";
import { NovaMark } from "./primitives";
import { SignInDialog } from "./SignInDialog";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/installations", label: "Installations", icon: Boxes },
  { to: "/skins", label: "Skins", icon: Shirt },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setSignInOpen } = useLauncher();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
          <div className="flex items-center gap-2.5">
            <NovaMark />
            <span className="text-[13px] font-semibold tracking-[0.14em]">NOVA</span>
            <span className="text-tiny font-medium tracking-[0.14em] text-faint">LAUNCHER</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" aria-label="Open settings">
                <Link to="/settings"><Settings /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-elevated text-foreground border border-border">Settings</TooltipContent>
          </Tooltip>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-16 shrink-0 flex-col border-r border-border bg-sidebar md:w-56">
            <nav className="flex flex-col gap-1 p-3" aria-label="Main">
              {NAV.map(({ to, label, icon: Icon }) => {
                const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center justify-center gap-3 rounded-[9px] px-3 text-body transition-colors duration-[180ms] md:justify-start",
                      active ? "bg-elevated text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-[180ms]",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon className={cn("size-[18px] shrink-0 transition-colors duration-[180ms]", active && "text-primary")} strokeWidth={1.75} />
                    <span className="hidden font-medium md:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border p-3">
              <button
                onClick={() => setSignInOpen(true)}
                className="flex w-full items-center justify-center gap-3 rounded-[9px] p-2 text-left transition-colors duration-150 hover:bg-surface md:justify-start"
                aria-label="Sign in with Microsoft account"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground">
                  <User className="size-4" strokeWidth={1.75} />
                </span>
                <span className="hidden min-w-0 md:block">
                  <span className="block truncate text-[13px] font-medium">Not signed in</span>
                  <span className="block truncate text-tiny text-faint">Microsoft account</span>
                </span>
              </button>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div key={pathname} className="page-enter mx-auto max-w-[1080px] px-5 py-7 md:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <SignInDialog />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!bg-elevated !border-border !text-foreground !rounded-lg",
            description: "!text-muted-foreground",
          },
        }}
      />
    </TooltipProvider>
  );
}
