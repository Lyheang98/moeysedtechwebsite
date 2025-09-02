"use client";

import { useEffect, useState } from "react";

export default function SheetReport() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await fetch("/api/sheet");
          if (!res.ok) throw new Error("Network response was not ok");
          console.log(res);
        const data = await res.json();
        if (data.values) {
          setRows(data.values);
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to load sheet data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSheet();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Sheet Report</h1>
      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b">
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="p-2 border-r">{cell}</td>
                  ))}  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}