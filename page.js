"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Page() {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ date: "", model: "", color: "", shift: "Siang", total: "" });

  useEffect(() => {
    const saved = localStorage.getItem("production_data");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("production_data", JSON.stringify(data));
  }, [data]);

  const getCurrentTime = () => new Date().toLocaleTimeString();

  const handleSubmit = () => {
    if (!form.date || !form.model || !form.color || !form.total) return;

    setData([...data, { ...form, total: Number(form.total), time: getCurrentTime(), id: Date.now() }]);
    setForm({ date: "", model: "", color: "", shift: "Siang", total: "" });
  };

  const filteredData = filterDate ? data.filter(d => d.date === filterDate) : data;

  const grouped = Object.values(
    filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = { date: item.date, total: 0 };
      acc[item.date].total += item.total;
      return acc;
    }, {})
  );

  const exportToExcel = async () => {
    if (typeof window === "undefined") return;
    if (filteredData.length === 0) return alert("No data");

    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "production_report.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold mb-6">
        Production System
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border p-2" />
        <input placeholder="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="border p-2" />
        <input placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="border p-2" />
        <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} className="border p-2">
          <option value="Siang">Siang</option>
          <option value="Malam">Malam</option>
        </select>
        <input type="number" placeholder="Total" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} className="border p-2" />
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">Tambah Data</button>
      <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded ml-4">Export Excel</button>

      <div className="my-6">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border p-2" />
      </div>

      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={grouped}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}