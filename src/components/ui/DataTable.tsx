import React from 'react';
import { EmptyState } from './EmptyState';
import { HelpCircle } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  id?: string;
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  id,
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no entries available for this view.',
  className = '',
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading table data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={HelpCircle}
        title={emptyTitle}
        description={emptyDescription}
        className="m-4"
      />
    );
  }

  return (
    <div id={id} className={`overflow-x-auto w-full ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200/90 bg-slate-50/70">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, index) => {
            const key = keyExtractor(item, index);
            const customRow = rowClassName ? rowClassName(item, index) : '';
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors hover:bg-slate-50/80 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${customRow}`}
              >
                {columns.map((col) => {
                  const content = col.render
                    ? col.render(item, index)
                    : (item as any)[col.key];

                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 text-slate-800 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
