// src/components/ui/DropdownMenu.js
import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { clsx } from 'clsx';

export function DropdownMenu({ label, children }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="inline-flex items-center justify-center px-4 py-2 bg-white border rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          {label}
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Content
        className="mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        sideOffset={5}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Root>
  );
}

export function DropdownMenuItem({ children, onSelect }) {
  return (
    <DropdownMenuPrimitive.Item
      className={clsx(
        'cursor-pointer select-none relative py-2 pl-10 pr-4 text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      )}
      onSelect={onSelect}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}
