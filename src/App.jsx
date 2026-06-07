import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. State untuk Filter Date Range (Default diset ke 2012-2016 sesuai soal)
  const [startYear, setStartYear] = useState("2012");
  const [endYear, setEndYear] = useState("2016");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?date=2000:2023&format=json"
        );
        setData(response.data[1] || []);
        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Logika Filter Data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter((item) => {
        const year = parseInt(item.date);
        return year >= parseInt(startYear) && year <= parseInt(endYear);
      })
      // Data API World Bank biasanya terbalik (terbaru di atas). 
      // Kita urutkan dari tahun terlama ke terbaru agar grafik garis bergerak dari kiri ke kanan.
      .sort((a, b) => parseInt(a.date) - parseInt(b.date)); 
  }, [data, startYear, endYear]);

  // 3. Konfigurasi Warna Pie Chart
  const COLORS = ['#fd0e0e', '#03ff25', '#00cffd', '#000000', '#eeff01', '#f300fc', '#00ffbf', '#004472'];

  // Fungsi helper untuk meringkas angka (Misal: 310000000 jadi 310 Juta)
  const formatYAxis = (tickItem) => {
    return (tickItem / 1000000).toFixed(0) + "M";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-yellow-500 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header bergaya Neobrutalism */}
        <header className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 rounded-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black uppercase tracking-tight">
            US Population Dashboard
          </h1>
          <p className="text-gray-700 mt-2 font-medium">Test Frontend Engineer - NoLimit</p>
        </header>

        {loading ? (
          <div className="text-center text-xl font-bold p-10 animate-pulse">Mengambil data dari World Bank...</div>
        ) : (
          <>
            {/* 4. Komponen Filter Date Range */}
            <div className="bg-gradient-to-r from-pink-500 to-yellow-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Filter Rentang Tahun:</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="font-bold">Dari:</label>
                  <input 
                    type="number" 
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="border-2 border-black px-3 py-2 font-bold w-24 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <span className="font-bold">-</span>
                <div className="flex items-center gap-2">
                  <label className="font-bold">Sampai:</label>
                  <input 
                    type="number" 
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="border-2 border-black px-3 py-2 font-bold w-24 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* 5. Layout Grafik (Responsif) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Line Chart Component */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-6 text-center">Trend Populasi (Line Chart)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="date" stroke="#000" fontWeight="bold" />
                      <YAxis tickFormatter={formatYAxis} stroke="#000" fontWeight="bold" domain={['auto', 'auto']} />
                      <Tooltip formatter={(value) => new Intl.NumberFormat('en-US').format(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="value" name="Total Populasi" stroke="#000" strokeWidth={4} dot={{ r: 6, fill: '#FFDE59', stroke: '#000', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart Component */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-6 text-center">Proporsi per Tahun (Pie Chart)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredData}
                        dataKey="value"
                        nameKey="date"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ date }) => date}
                        labelLine={false}
                        stroke="#000"
                        strokeWidth={2}
                      >
                        {filteredData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => new Intl.NumberFormat('en-US').format(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;