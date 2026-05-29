import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "../lib/format.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PALETTE = {
  conservative: { line: "#10b981", bg: "rgba(16,185,129,0.0)" },
  balanced: { line: "#6366f1", bg: "rgba(99,102,241,0.0)" },
  dynamic: { line: "#f59e0b", bg: "rgba(245,158,11,0.0)" },
};

export default function SensitivityChart({ sensitivity }) {
  if (!sensitivity?.length) return null;

  const labels = sensitivity[0].points.map((p) => `+${p.shock}%`);
  const datasets = sensitivity.map((mix) => ({
    label: mix.label,
    data: mix.points.map((p) => p.monthly),
    borderColor: PALETTE[mix.key]?.line || "#9ca3af",
    backgroundColor: PALETTE[mix.key]?.bg || "transparent",
    tension: 0.35,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2,
    pointBackgroundColor: PALETTE[mix.key]?.line || "#9ca3af",
    pointBorderWidth: 0,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: "#9ca3af",
          font: { family: "Assistant", size: 13 },
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 2,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        borderColor: "#1f2937",
        borderWidth: 1,
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        padding: 10,
        callbacks: {
          title: (items) => `עליית ריבית: ${items[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
        bodyFont: { family: "Assistant", size: 13 },
        titleFont: { family: "Assistant", size: 12 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", font: { family: "Assistant", size: 12 } },
        grid: { color: "rgba(31,41,55,0.35)" },
        border: { display: false },
        reverse: true,
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { family: "Assistant", size: 11 },
          callback: (v) => `₪${(v / 1000).toFixed(1)}K`,
        },
        grid: { color: "rgba(31,41,55,0.35)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-60 w-full">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
