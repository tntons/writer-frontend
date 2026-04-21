import { stages } from "../constants";
import { classNames, statusClass } from "../lib/format";

export function StageButton({
  stage,
  active,
  complete,
  onSelect,
}: {
  stage: (typeof stages)[number];
  active: boolean;
  complete: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(
        "w-full rounded-md border px-3 py-3 text-left transition hover:border-white/30",
        active ? "border-lime-300/60 bg-lime-300/10" : "border-white/10 bg-white/[0.03]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{stage.label}</span>
        <span
          className={classNames(
            "h-2.5 w-2.5 rounded-full",
            complete ? "bg-lime-300" : active ? "bg-amber-300" : "bg-white/20",
          )}
        />
      </div>
      <p className="mt-1 text-xs text-zinc-500">{stage.helper}</p>
    </button>
  );
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={classNames("inline-flex rounded-md border px-2 py-1 text-xs font-medium", statusClass(value))}>
      {value.replace("_", " ")}
    </span>
  );
}

export function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{helper}</p>
    </div>
  );
}

