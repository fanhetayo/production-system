import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";


export default function ProductionSystem() {
  const [data, setData] = useState([]);
  const [totalEnabled, setTotalEnabled] = useState(true);
  const [language, setLanguage] = useState("id");
  const [filterDate, setFilterDate] = useState("");

  const text = {
    id: {
      title: "Sistem Data Produksi",
      enableTotal: "Aktifkan TOTAL",
      model: "Model Tas",
      total: "TOTAL",
      color: "Warna",
      time: "Jam",
      add: "Tambah Data",
      grandTotal: "Grand TOTAL",
      chartTitle: "Grafik Produksi Per Hari",
      date: "Tanggal",
      shift: "Shift",
      day: "Siang",
      night: "Malam",
      action: "Aksi",
      delete: "Hapus",
      filter: "Filter Tanggal",
      reset: "Reset",
      exportExcel: "Export Excel",
    },
    cn: {
      title: "生产数据系统",
      enableTotal: "启用TOTAL",
      model: "包款型号",
      total: "TOTAL",
      color: "颜色",
      time: "时间",
      add: "添加数据",
      grandTotal: "总TOTAL",
      chartTitle: "每日生产图表",
      date: "日期",
      shift: "班次",
      day: "白班",
      night: "夜班",
      action: "操作",
      delete: "删除",
      filter: "筛选日期",
      reset: "重置",
      exportExcel: "导出Excel",
    },
  };

  const t = text[language];

  const [form, setForm] = useState({
    date: "",
    model: "",
    color: "",
    shift: "Siang",
    total: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("production_data");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("production_data", JSON.stringify(data));
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSubmit = () => {
    if (!form.date || !form.model || !form.color || !form.total) return;

    setData([
      ...data,
      {
        ...form,
        total: Number(form.total),
        time: getCurrentTime(),
        id: Date.now(),
      },
    ]);

    setForm({ date: "", model: "", color: "", shift: "Siang", total: "" });
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const filteredData = filterDate
    ? data.filter((item) => item.date === filterDate)
    : data;

  const grandTotal = filteredData.reduce((sum, item) => sum + Number(item.total), 0);

  const groupedByDate = Object.values(
    filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = { date: item.date, total: 0 };
      acc[item.date].total += Number(item.total);
      return acc;
    }, {})
  );

  // EXPORT EXCEL (FOLLOW FILTER TANGGAL)
  const exportToExcel = async () => {
    if (typeof window === "undefined") return;

    const XLSX = await import("xlsx");
    if (!filteredData || filteredData.length === 0) {
      alert("Tidak ada data sesuai filter tanggal");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const companyName = "PT. YOUR COMPANY NAME";
    const period = filterDate ? filterDate : "Semua Data (Tanpa Filter)";

    const formattedData = filteredData.map((item) => ({
      Tanggal: item.date || "",
      Jam: item.time || "",
      Model: item.model || "",
      Warna: item.color || "",
      Shift: item.shift || "",
      TOTAL: item.total || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { origin: "A3" });

    XLSX.utils.sheet_add_aoa(worksheet, [[companyName]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, [["Periode:", period]], { origin: "A2" });

    const colWidths = Object.keys(formattedData[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...formattedData.map((row) => String(row[key] || "").length)
      ) + 2,
    }));
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Filtered");

    // ✅ BROWSER SAFE DOWNLOAD (WORKS IN BLOGGER & STATIC HOSTING)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "production_report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6">
        {t.title}
      </motion.h1>

      <div className="mb-4 flex gap-2">
        <Button variant={language === "id" ? "default" : "outline"} onClick={() => setLanguage("id")}>Indonesia</Button>
        <Button variant={language === "cn" ? "default" : "outline"} onClick={() => setLanguage("cn")}>中文</Button>
      </div>

      {/* EXPORT BUTTONS */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6 flex gap-4">
          <Button onClick={exportToExcel}>{t.exportExcel}</Button>
          
        </CardContent>
      </Card>

      {/* FORM */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
          <Input placeholder={t.model} name="model" value={form.model} onChange={handleChange} />
          <Input placeholder={t.color} name="color" value={form.color} onChange={handleChange} />

          <select name="shift" value={form.shift} onChange={handleChange} className="border rounded-xl px-3">
            <option value="Siang">{t.day}</option>
            <option value="Malam">{t.night}</option>
          </select>

          {totalEnabled && (
            <Input placeholder={t.total} name="total" type="number" value={form.total} onChange={handleChange} />
          )}

          <div className="md:col-span-5">
            <Button onClick={handleSubmit} className="w-full rounded-2xl">{t.add}</Button>
          </div>
        </CardContent>
      </Card>

      {/* FILTER */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t.filter}</label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => setFilterDate("")}>{t.reset}</Button>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">{t.date}</th>
                  <th>{t.time}</th>
                  <th>{t.model}</th>
                  <th>{t.color}</th>
                  <th>{t.shift}</th>
                  {totalEnabled && <th>{t.total}</th>}
                  <th>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.model}</td>
                    <td>{item.color}</td>
                    <td>{item.shift === "Siang" ? t.day : t.night}</td>
                    {totalEnabled && <td>{item.total}</td>}
                    <td>
                      <Button variant="destructive" onClick={() => handleDelete(item.id)} className="rounded-xl">
                        {t.delete}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6 text-lg font-semibold">
          {t.grandTotal}: {grandTotal}
        </CardContent>
      </Card>

      {/* GRAPH */}
      <Card className="rounded-2xl shadow-md mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t.chartTitle}</h2>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={groupedByDate}>
                <XAxis dataKey="date" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                <Legend />
                {totalEnabled && (
                  <Bar dataKey="total" fill="#6366F1" radius={[8, 8, 0, 0]} name={t.total} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
