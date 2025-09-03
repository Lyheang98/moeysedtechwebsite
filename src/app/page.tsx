"use client";
import { useEffect, useState } from "react";
type SheetData = {
  sheetId: string;
  sheetName: string;
  values: string[][];
};

export default function SheetReport() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [showProvinces, setShowProvinces] = useState(true);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const res = await fetch("/api/sheet");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();

        if (data.sheets && data.sheets.length > 0) {
          setSheets(data.sheets);
          setSelectedProvince(data.sheets[0].sheetId); // Default to first province by sheetId
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to load sheet data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  // Custom button names and mapping to sheetId - dynamically create from API response
  const customButtons = sheets.map((sheet, index) => {
    // Map sheet IDs to proper province names
    const provinceNames: Record<string, string> = {
      '1hhkcCpJogBJWzZv-XESo7owkr9cygClTNVzWTs5sJR8': 'Kampong Chnang',
      '1wEoudR-xoh9ReJpF1Hshe5vzdpC_xrv0NQ8QQv2UEaA': 'Battambang',
      '1lWgk9dXsP64w8IXWHT_4HMPztLgW0S74GXvT4P98Kko': 'Porsat',
      '1oG-NnOTdqZHAuM1cg5e-rhIm16l4rTRP2--AKAktfHo': 'Pailin',
      '1HV_Zo2fdOnGGfD5rMLMx8kO9rfYlspuoNzaMCRjAaNs': 'Oudormean Chey',
      '1XIiZovr2KayQnlYOPIZbP_JCeLSD84BJjJ2apyANVx8': 'Kompot',
    };
    
    return {
      id: sheet.sheetId,
      name: provinceNames[sheet.sheetId] || sheet.sheetName || `Province ${index + 1}`
    };
  });

  const selectedSheet = sheets.find((sheet) => sheet.sheetId === selectedProvince);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mt-5 mb-2 text-center">School Province</h1>
      <p className="text-center mb-10">Select a province to view its schools</p>

      {loading && <p className="text-center">Loading data...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <>
          {showProvinces ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {customButtons.map((prov) => (
                <div
                  key={prov.id}
                  className={`cursor-pointer bg-white rounded-2xl shadow-md p-8 border border-gray-200 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-200 ${!prov.id ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => {
                    if (prov.id) {
                      setSelectedProvince(prov.id);
                      setShowProvinces(false);
                    }
                  }}
                >
                  <span className="text-2xl font-bold mb-2 text-blue-700">{prov.name}</span>
                  <span className="text-gray-500">View Schools</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button
                className="mb-6 px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                onClick={() => setShowProvinces(true)}
              >
                &larr; Back to Provinces
              </button>
              <div className="space-y-10">
                {selectedSheet && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{customButtons.find(b => b.id === selectedProvince)?.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedSheet.values.map((row, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl shadow-md p-4 border border-gray-200"
                        >
                          {row.map((cell, cidx) => (
                            <p key={cidx} className="text-gray-700 mb-2">
                              {cell}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
