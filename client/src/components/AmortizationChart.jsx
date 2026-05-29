import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function AmortizationChart({ schedule }) {
  if (!schedule?.length) return null;

  const labels = schedule.map((s) => `שנה ${s.year}`);

  const datasets = [
    {
      label: "ריבית שנתית",
      data: schedule.map((s) => s.interestPaid),
      borderColor: "#ef4444",
      backgroundColor: "rgba(239,68,68,0.12)",
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
    },
    {
      label: "קרן שנתית",
      data: schedule.map((s) => s.principalPaid),
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.12)",
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: "#9ca3af",
          font: { family: "Assistant", size: 13 },
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 3,
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        borderColor: "#1f2937",
        borderWidth: 1,
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ₪${ctx.parsed.y.toLocaleString("he-IL")}`,
        },
        bodyFont: { family: "Assistant" },
        titleFont: { family: "Assistant" },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
          font: { family: "Assistant", size: 11 },
          maxTicksLimit: 8,
        },
        grid: { color: "rgba(31,41,55,0.4)" },
        border: { display: false },
        reverse: true,
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { family: "Assistant", size: 11 },
          callback: (v) => `₪${(v / 1000).toFixed(0)}K`,
        },
        grid: { color: "rgba(31,41,55,0.4)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
