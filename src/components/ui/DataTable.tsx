import React from 'react';

import { Loader2 } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Array<TableColumn<T>>;
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loadingMessage?: string;
}

export const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
}: DataTableProps<T>) => {
  const gridCols = `repeat(${columns.length}, 1fr)`;

  return (
    <div className='flex-1 overflow-hidden rounded-lg border border-[#D9D8D0] bg-white shadow'>
      <div className='flex h-full flex-col'>
        {/* Table Header */}
        <div
          className='grid flex-shrink-0 gap-0 border-b border-[#D9D8D0] bg-[#F6F4EE]'
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map(column => (
            <div
              key={column.key}
              className={`text-accent-foreground px-6 py-3 text-left text-sm font-semibold tracking-wider ${column.className ?? ''}`}
            >
              {column.header}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center gap-2 py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-gray-500' />
              <span className='text-gray-500'>{loadingMessage}</span>
            </div>
          ) : data.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <span className='text-gray-500'>{emptyMessage}</span>
            </div>
          ) : (
            <div className='divide-y divide-[#D9D8D0] bg-white'>
              {data.map(item => (
                <div
                  key={item.id}
                  className={`grid gap-0 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  style={{ gridTemplateColumns: gridCols }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(column => (
                    <div
                      key={column.key}
                      className={`text-popover-foreground px-6 py-4 text-sm whitespace-nowrap ${column.className ?? ''}`}
                    >
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
