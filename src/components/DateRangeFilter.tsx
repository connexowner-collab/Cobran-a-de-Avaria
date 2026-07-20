'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

type DateRangeFilterProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

/** Exibe um campo que abre calendário para seleção de período (de – até) no mesmo calendário. */
export default function DateRangeFilter({
  value,
  onChange,
  placeholder = 'Selecionar período',
  ariaLabel = 'Filtrar por período',
  className = '',
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [popoverRect, setPopoverRect] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (buttonRef.current && typeof document !== 'undefined') {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverRect({
        left: rect.left,
        top: rect.bottom + 4,
      });
    }
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      setTimeout(updatePosition, 0);
    } else {
      setPopoverRect(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        const popover = document.getElementById('date-range-filter-popover');
        if (popover && !popover.contains(target)) {
          setOpen(false);
          setPopoverRect(null);
        }
      }
    };
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const label =
    value?.from && value?.to
      ? `${format(value.from, 'dd/MM/yyyy', { locale: ptBR })} – ${format(value.to, 'dd/MM/yyyy', { locale: ptBR })}`
      : value?.from
        ? format(value.from, 'dd/MM/yyyy', { locale: ptBR })
        : '';

  const hasValue = Boolean(value?.from);

  const popoverContent =
    open && popoverRect && typeof document !== 'undefined'
      ? createPortal(
          <div
            id="date-range-filter-popover"
            className="date-range-filter-popover fixed z-[9999] rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
            style={{ left: popoverRect.left, top: popoverRect.top }}
          >
            <DayPicker
              mode="range"
              selected={value}
              onSelect={onChange}
              locale={ptBR}
              defaultMonth={value?.from ?? new Date()}
              numberOfMonths={1}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear() + 1}
            />
            <div className="mt-2 flex justify-end border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                  setPopoverRect(null);
                }}
                className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Limpar
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={containerRef} className={`relative flex min-w-0 max-w-full items-center overflow-hidden ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          className="input-field input-field--filter-line py-1.5 pl-2 text-left text-xs flex-1 min-w-0 pr-7"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className={label ? 'text-slate-900' : 'text-slate-400'}>{label || placeholder}</span>
        </button>
        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Limpar período"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {popoverContent}
    </>
  );
}

/** Verifica se uma data ISO está dentro do período (inclusive). Considera apenas o dia (ignora hora). */
export function isDateInRange(iso: string | null | undefined, range: DateRange | undefined): boolean {
  if (!range?.from) return true;
  try {
    const d = new Date(iso ?? '');
    if (Number.isNaN(d.getTime())) return false;
    const day = startOfDay(d);
    const from = startOfDay(range.from);
    const to = range.to ? endOfDay(range.to) : endOfDay(range.from);
    return isWithinInterval(day, { start: from, end: to });
  } catch {
    return false;
  }
}
