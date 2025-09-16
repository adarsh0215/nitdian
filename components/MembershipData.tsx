"use client";

import { useEffect, useState } from "react";

type Privilege = {
  id: string;
  name: string;
  active: boolean;
};

export default function MembershipData() {
  const [data, setData] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/membership?email=adatzyadav08@gmail.com");
        const json = await res.json();
        if (!res.ok) {
          setErr(json?.error ?? "Unknown error");
          setData([]);
        } else {
          setData(json?.privileges ?? []);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErr(e.message);
        } else {
          setErr(String(e));
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (err) return <div>Error: {err}</div>;
  if (!data.length) return <div>No privileges found</div>;

  return (
    <div>
      <h2>Membership Privileges</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
