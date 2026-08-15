import { useAuth } from "./useAuth";

export function usePermission(
  permission?: string,
) {
  const {
    hasPermission,
  } = useAuth();

  if (!permission) {
    return true;
  }

  return hasPermission(
    permission,
  );
}