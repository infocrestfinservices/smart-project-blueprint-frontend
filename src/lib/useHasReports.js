import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { reportStorage } from "@/api/localStorageService";

// Whether the signed-in user has generated at least one report — the
// Dashboard/Account/Admin nav only earns its place once there is
// something for it to point to.
export function useHasReports() {
  const { user } = useAuth();
  const [hasReports, setHasReports] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setHasReports(false);
      return;
    }
    reportStorage
      .list("-created_date", 1)
      .then((list) => !cancelled && setHasReports(list.length > 0))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  return hasReports;
}
