import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useHealthPing() {
  return useQuery({
    queryKey: [api.health.ping.path],
    queryFn: async () => {
      const res = await fetch(api.health.ping.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch health ping");
      return api.health.ping.responses[200].parse(await res.json());
    },
    // Don't fail the UI if the backend ping isn't fully set up yet
    retry: false,
    refetchOnWindowFocus: false,
  });
}
