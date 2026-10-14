import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_VERSIONS } from "@/lib/launcher/catalog";
import { selectContentClass, selectItemClass, selectTriggerClass } from "./primitives";
import { cn } from "@/lib/utils";

export function VersionSelect({ id, value, onChange, className }: { id?: string; value: string | null; onChange: (v: string) => void; className?: string }) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn(selectTriggerClass, className)}>
        <SelectValue placeholder="Select a version" />
      </SelectTrigger>
      <SelectContent className={selectContentClass}>
        {DEMO_VERSIONS.map((v) => (
          <SelectItem key={v.id} value={v.id} className={selectItemClass}>
            {v.label} <span className="ml-1 text-tiny text-faint">· demo</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
