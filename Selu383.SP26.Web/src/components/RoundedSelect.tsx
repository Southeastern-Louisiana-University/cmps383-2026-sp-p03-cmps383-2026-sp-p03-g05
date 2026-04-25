import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type RoundedSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type RoundedSelectProps = {
  value: string;
  options: RoundedSelectOption[];
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
};

export default function RoundedSelect({
  value,
  options,
  onChange,
  disabled = false,
  className = "",
  ariaLabel,
  placeholder = "",
}: RoundedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const displayLabel =
    selectedOption?.label ??
    options.find((option) => option.value === "")?.label ??
    placeholder;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  const triggerClassName = `rounded-select-trigger${className ? ` ${className}` : ""}`;

  return (
    <div className="rounded-select" ref={rootRef}>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setIsOpen((previous) => !previous)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="rounded-select-label">{displayLabel}</span>
        <ChevronDown size={16} className="rounded-select-icon" />
      </button>

      {isOpen ? (
        <div className="rounded-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const isActive = option.value === value;

            return (
              <button
                key={`${option.value}-${option.label}-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={option.disabled}
                className={`rounded-select-option${isActive ? " active" : ""}`}
                onClick={() => {
                  if (option.disabled) {
                    return;
                  }
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
