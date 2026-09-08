// Role values on User.role: 0 = member, 1 = admin, 2 = super admin.
export function isAdminRole(role: number | undefined | null): boolean {
  return role === 1 || role === 2;
}
