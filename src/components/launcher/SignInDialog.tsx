import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLauncher } from "@/lib/launcher/store";
import { services } from "@/lib/launcher/services";
import { dialogClass } from "./primitives";

function MicrosoftMark() {
  return (
    <div className="grid size-10 grid-cols-2 gap-[3px]" aria-hidden>
      <span className="bg-destructive" />
      <span className="bg-primary" />
      <span className="bg-muted-foreground" />
      <span className="bg-warning" />
    </div>
  );
}

export function SignInDialog() {
  const { signInOpen, setSignInOpen } = useLauncher();

  const onContinue = async () => {
    try {
      await services.auth.signInWithMicrosoft();
    } catch {
      toast("Microsoft sign-in isn't connected yet", {
        description: "Real authentication will be added when the desktop app is integrated.",
      });
    }
  };

  return (
    <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
      <DialogContent className={dialogClass}>
        <MicrosoftMark />
        <DialogTitle className="mt-5 text-section font-semibold">Connect your Microsoft account</DialogTitle>
        <DialogDescription className="mt-2 text-body text-muted-foreground">
          Minecraft Java Edition uses a Microsoft account for official authentication and to verify game ownership.
        </DialogDescription>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onContinue}>Continue with Microsoft</Button>
          <Button size="lg" variant="ghost" onClick={() => setSignInOpen(false)}>Cancel</Button>
        </div>
        <p className="mt-5 flex gap-2 border-t border-border pt-4 text-meta text-faint">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          NOVA will never ask for your password. Sign-in will open Microsoft's official page once desktop authentication is integrated.
        </p>
      </DialogContent>
    </Dialog>
  );
}
