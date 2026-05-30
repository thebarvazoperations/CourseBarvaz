import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = {
  conservative: { bg: "rgba(16,185,129,0.7)", border: "#10b981" },
  balanced: { bg: "rgba(99,102,241,0.7)", border: "#6366f1" },
  dynamic: { bg: "rgba(245,158,11,0.7)", border: "#f59e0b" },
};

export default function CostCompareChart({ mixes }) {
  if (!mixes?.length) return null;

  const labels = mixes.map((m) => m.label);
  const principal = mixes[0] ? mixes[0].total - mixes[0].total * 0 : 0; // just for reference

  const datasets = [
    {
      label: "קרן",
      data: mixes.map((m) => {
        const loanAmount = m.total - (m.monthly * 12 * /* dummy */ 1);
        // We use total - interest
        return null; // placeholder - will compute below
      }),
    },
  ];

  // Build stacked bars: principal + interest
  const principalData = mixes.map((m) => {
    // principal is the same across mixes — loan amount
    // We'll estimate: first mix total minus what interest would be
    // Actually we don't have loanAmount here, use total - interest approx
    // Better: just show total cost split visually
    return null;
  });

  // Simple: just show total cost per mix
  const data = {
    labels,
    datasets: [
      {
        label: "עלות כוללת",
        data: mixes.map((m) => m.total),
        backgroundColor: mixes.map((m) => COLORS[m.key]?.bg || "rgba(99,102,241,0.7)"),
        borderColor: mixes.map((m) => COLORS[m.key]?.border || "#6366f1"),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        borderColor: "#1f2937",
        borderWidth: 1,
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        callbacks: {
          label: (ctx) => ` עלות: ₪${ctx.parsed.y.toLocaleString("he-IL")}`,
        },
        bodyFont: { family: "Assistant" },
        titleFont: { family: "Assistant" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { family: "Assistant", size: 13 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { family: "Assistant", size: 11 },
          callback: (v) => `₪${(v / 1000000).toFixed(2)}M`,
        },
        grid: { color: "rgba(31,41,55,0.4)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-48 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
