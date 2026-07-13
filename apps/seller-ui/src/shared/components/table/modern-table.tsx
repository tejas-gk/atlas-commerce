import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface ModernTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    sortBy?: keyof T;
    sortOrder?: "asc" | "desc";
    onSort?: (column: keyof T) => void;
    hoverable?: boolean;
    striped?: boolean;
    compact?: boolean;
}

export const ModernTable = React.forwardRef<
    HTMLDivElement,
    ModernTableProps<any>
>(
    (
        {
            columns,
            data,
            onRowClick,
            sortBy,
            sortOrder,
            onSort,
            hoverable = true,
            striped = true,
            compact = false,
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
            >
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            {columns.map((column) => (
                                <th
                                    key={String(column.accessorKey)}
                                    style={{ width: column.width }}
                                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${column.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50" : ""
                                        }`}
                                    onClick={() =>
                                        column.sortable && onSort && onSort(column.accessorKey)
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && (
                                            <>
                                                {sortBy === column.accessorKey ? (
                                                    sortOrder === "asc" ? (
                                                        <ChevronUp className="h-4 w-4 text-primary-600" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-primary-600" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${striped && rowIndex % 2 === 0
                                        ? "bg-white dark:bg-gray-800"
                                        : "bg-gray-50/50 dark:bg-gray-800/50"
                                    } ${hoverable && onRowClick
                                        ? "hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer"
                                        : ""
                                    }`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.accessorKey)}
                                        className={`px-6 text-sm text-gray-900 dark:text-gray-50 ${compact ? "py-2" : "py-4"
                                            }`}
                                    >
                                        {column.cell
                                            ? column.cell(row[column.accessorKey], row)
                                            : (row[column.accessorKey] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No data available</p>
                    </div>
                )}
            </div>
        );
    }
);

ModernTable.displayName = "ModernTable";
