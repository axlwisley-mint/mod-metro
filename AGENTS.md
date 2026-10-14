<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Rules
- The launcher shell (title bar, sidebar, sign-in dialog) is rendered once from `__root` via `AppShell`; screens are plain routes — keeps the shell stable across navigation.
- All game/auth/install operations go through `src/lib/launcher/services.ts` interfaces; browser stubs reject with NotImplementedError — native work must cross a desktop bridge later, never browser code.
- App UI state lives in `src/lib/launcher/store.tsx`; persistence only through `storage.ts`, never tokens or credentials — keeps storage swappable.
- Motion is centralized: `html[data-reduce-motion]` plus the OS media query in styles.css disable transitions globally.
