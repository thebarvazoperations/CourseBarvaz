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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const COLORS = {
  conservative: "#10b981",
  balanced: "#6366f1",
  dynamic: "#f59e0b",
};

export default function SensitivityChart({ sensitivity }) {
  const labels = sensitivity[0].points.map((p) => `+${p.shock}%`);

  const datasets = sensitivity.map((mix) => ({
    label: mix.label,
    data: mix.points.map((p) => p.monthly),
    borderColor: COLORS[mix.key] || "#9ca3af",
    backgroundColor: COLORS[mix.key] || "#9ca3af",
    tension: 0.3,
    pointRadius: 4,
    borderWidth: 2,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#f9fafb", font: { family: "Assistant", size: 13 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
        bodyFont: { family: "Assistant" },
        titleFont: { family: "Assistant" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { family: "Assistant" } },
        grid: { color: "rgba(31,41,55,0.6)" },
        reverse: true, // RTL — מ-+0% מימין
      },
      y: {
        ticks: {
          color: "#9ca3af",
          font: { family: "Assistant" },
          callback: (v) => `₪${(v / 1000).toFixed(0)}K`,
        },
        grid: { color: "rgba(31,41,55,0.6)" },
      },
    },
  };

  return (
    <div className="h-72 w-full">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}
