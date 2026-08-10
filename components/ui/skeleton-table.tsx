const HEADERS = ["Task", "Status", "Priority", "Due date", ""];

export function SkeletonTable() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {HEADERS.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="h-10 px-4 text-xs font-medium tracking-wide whitespace-nowrap text-zinc-500 select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr
                key={row}
                className="border-b border-zinc-800/60 last:border-b-0"
              >
                {HEADERS.map((_, column) => (
                  <td key={column} className="px-4 py-3 align-middle">
                    <div
                      className={`h-4 animate-pulse rounded-md bg-zinc-800/80 ${
                        column === 0 ? "w-2/3" : column === 4 ? "w-4" : "w-1/2"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
        <div className="h-3 w-32 animate-pulse rounded-md bg-zinc-800/80" />
        <div className="h-3 w-48 animate-pulse rounded-md bg-zinc-800/80" />
      </div>
    </div>
  );
}