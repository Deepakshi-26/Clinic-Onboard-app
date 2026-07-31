"use client";

import { useRouter } from "next/navigation";

export function EmployeeSelector({
  employees,
  selectedId,
  basePath,
}: {
  employees: { id: string; fullName: string }[];
  selectedId?: string;
  basePath: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => router.push(`${basePath}?employeeId=${e.target.value}`)}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
    >
      <option value="" disabled>
        Select an employee...
      </option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.fullName}
        </option>
      ))}
    </select>
  );
}
