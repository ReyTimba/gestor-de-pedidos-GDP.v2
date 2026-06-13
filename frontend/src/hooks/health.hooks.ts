import { useEffect, useState } from "react";

type HealthResponse = {
    ok: boolean;
    database: "connected" | "error";
};


export function useHealth() {
    const [health, setHealth] = useState<HealthResponse | null>(null);

    useEffect(() => {
        fetch("/api/health")
          .then((response) => response.json())
          .then(setHealth)
          .catch(() => setHealth({ ok: false, database: "error" }));
      }, []);
      
      return {health}
}