export const departments = ["Men", "Women", "Kids"];
export function isDepartment(value) {
    return departments.some((department) => department === value);
}
