export const departments = ["Men", "Women", "Kids"] as const;

export type Department = (typeof departments)[number];

export function isDepartment(value: unknown): value is Department {
  return departments.some((department) => department === value);
}
