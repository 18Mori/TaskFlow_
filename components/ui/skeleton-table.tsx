const HEADERS = [
  { label: "", mobile: true },
  { label: "Task", mobile: true },
  { label: "Status", mobile: true },
  { label: "Priority", mobile: false },
  { label: "Due date", mobile: false },
  { label: "", mobile: true },
];

export function SkeletonTable() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-zinc-800">
              {HEADERS.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="h-10 px-4 text-xs font-medium tracking-wide whitespace-nowrap text-zinc-500 select-none"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr
                key={row}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-zinc-800/60 last:border-b-0 md:table-row"
              >
                {HEADERS.map((header, column) => (
                  <td
                    key={column}
                    className={`px-4 py-3 align-middle ${
                      !header.mobile ? "hidden md:table-cell" : ""
                    } ${
                      column === 1
                        ? "max-md:flex-1 max-md:min-w-0"
                        : column === 0
                          ? "max-md:shrink-0"
                          : ""
                    }`}
                  >
                    <div
                      className={`h-4 animate-pulse rounded-md bg-zinc-800/80 ${
                        column === 1
                          ? "max-md:w-2/3 w-2/3"
                          : column === HEADERS.length - 1
                            ? "max-md:ml-auto max-md:w-4 w-4"
                            : "w-1/2"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-3 w-32 animate-pulse rounded-md bg-zinc-800/80" />
        <div className="h-3 w-48 animate-pulse rounded-md bg-zinc-800/80" />
      </div>
    </div>
  );
}