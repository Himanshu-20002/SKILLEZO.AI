'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface InlineTextProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'div' | 'li';
  multiline?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export const InlineText: React.FC<InlineTextProps> = React.memo(({
  value = '',
  onChange,
  placeholder = 'Type here...',
  className = '',
  as: Component = 'span',
  multiline = false,
  disabled = false,
  onBlur,
  onKeyDown,
}) => {
  const elRef = useRef<HTMLElement>(null);
  const isFocusedRef = useRef(false);
  const localValueRef = useRef<string>(value || '');

  // Mount initial text
  useEffect(() => {
    if (elRef.current && elRef.current.innerText !== (value || '')) {
      elRef.current.innerText = value || '';
      localValueRef.current = value || '';
    }
  }, []);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external changes into the DOM node ONLY when not actively focused AND when value is genuinely different from localValue
  useEffect(() => {
    const nextVal = value || '';
    if (!isFocusedRef.current && nextVal !== localValueRef.current) {
      localValueRef.current = nextVal;
      if (elRef.current && elRef.current.innerText !== nextVal) {
        elRef.current.innerText = nextVal;
      }
    }
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInput = useCallback(() => {
    if (elRef.current) {
      const text = elRef.current.innerText ?? '';
      localValueRef.current = text;
      
      // Micro-batch upward React re-renders by 60ms during high-speed typing
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        onChange(text);
      }, 60);
    }
  }, [onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    isFocusedRef.current = true;
    e.stopPropagation();
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    isFocusedRef.current = false;
    e.stopPropagation();

    // Flush any pending debounced change immediately on blur
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (elRef.current) {
      const text = elRef.current.innerText ?? '';
      localValueRef.current = text;
      if (text !== (value || '')) {
        onChange(text);
      }
    }
    onBlur?.();
  }, [onChange, onBlur, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }

    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      elRef.current?.blur();
    } else if (e.key === 'Escape') {
      elRef.current?.blur();
    }
  }, [multiline, onKeyDown]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Prevent outer section click handlers from triggering sidebar navigations while editing text
    e.stopPropagation();
  }, []);

  return (
    <Component
      ref={elRef as any}
      contentEditable={!disabled}
      suppressContentEditableWarning={true}
      data-placeholder={placeholder}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className={`outline-none cursor-text transition-colors duration-150 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:italic empty:before:pointer-events-none focus:ring-1 focus:ring-indigo-400/60 focus:bg-indigo-50/20 dark:focus:bg-indigo-950/20 rounded-xs ${
        !disabled ? 'hover:bg-slate-100/40 dark:hover:bg-slate-800/40' : ''
      } ${className}`}
    />
  );
});

InlineText.displayName = 'InlineText';
