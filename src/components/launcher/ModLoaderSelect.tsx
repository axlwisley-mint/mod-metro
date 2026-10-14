import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOD_LOADERS } from "@/lib/launcher/catalog";
import type { ModLoader } from "@/lib/launcher/types";
import { selectContentClass, selectItemClass, selectTriggerClass } from "./primitives";

export function ModLoaderSelect({ id, value, onChange }: { id?: string; value: ModLoader; onChange: (v: ModLoader) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ModLoader)}>
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={selectContentClass}>
        {MOD_LOADERS.map((m) => (
          <SelectItem key={m.id} value={m.id} className={selectItemClass}>{m.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
