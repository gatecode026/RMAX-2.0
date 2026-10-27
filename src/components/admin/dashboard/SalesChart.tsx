"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { SalesMonthPoint } from "@/lib/admin/types";

interface SalesChartProps {
  data: SalesMonthPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState("Last 6 Months");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const maxOrders = 400;
  const maxRevenue = 2000000; // 20 Lakhs

  // SVG viewBox dimensions
  const width = 560;
  const height = 230;
  const paddingLeft = 36;
  const paddingRight = 42;
  const paddingTop = 22;
  const paddingBottom = 32;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const stepX = chartWidth / (data.length - 1 || 1);

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + i * stepX;
    const yOrder = paddingTop + chartHeight - (d.orders / maxOrders) * chartHeight;
    const yRev = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { ...d, x, yOrder, yRev };
  });

  // Line path for revenue
  const linePath = points.reduce((path, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.yRev}` : `${path} L ${pt.x} ${pt.yRev}`;
  }, "");

  const barWidth = 30;

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <h3 className="font-jakarta text-[16.5px] font-bold text-[#202A36]">Sales Overview</h3>
          <p className="text-[12px] text-[#718096]">Monthly orders and revenue</p>
        </div>

        {/* Dropdown & Legend */}
        <div className="flex items-center gap-3.5">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] text-[#718096]">
              <span className="size-2.5 rounded-xs bg-[#B8D3F8]" />
              <span>Orders</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#718096]">
              <span className="h-0.5 w-3 bg-[#0B2450]" />
              <span className="size-2 rounded-full bg-[#0B2450]" />
              <span>Revenue</span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              <span>{period}</span>
              <ChevronDown className="size-3 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[36px] z-30 w-36 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                {["Last 3 Months", "Last 6 Months", "Full Year"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPeriod(opt);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-100 hover:text-[#10469B]"
                  >
                    <span>{opt}</span>
                    {period === opt && <Check className="size-3 text-[#10469B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Responsive SVG Chart */}
      <div className="relative mt-2 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[235px] w-full overflow-visible"
        >
          {/* Horizontal grid lines */}
          {[0, 100, 200, 300, 400].map((val) => {
            const y = paddingTop + chartHeight - (val / maxOrders) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                {/* Left Y-axis label (Orders) */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-[#94A3B8] text-[10px] font-medium"
                >
                  {val}
                </text>
                {/* Right Y-axis label (Revenue in Lakhs) */}
                <text
                  x={width - paddingRight + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  className="fill-[#94A3B8] text-[10px] font-medium"
                >
                  {val === 0 ? "₹0" : `₹${(val * 5) / 100}L`}
                </text>
              </g>
            );
          })}

          {/* Bar Chart Series (Orders) */}
          {points.map((pt, i) => {
            const barH = chartHeight - (pt.yOrder - paddingTop);
            return (
              <rect
                key={`bar-${i}`}
                x={pt.x - barWidth / 2}
                y={pt.yOrder}
                width={barWidth}
                height={barH}
                rx="4"
                className="fill-[#B8D3F8] transition-all hover:fill-[#8FB9F4]"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Line Chart Series (Revenue) */}
          <path
            d={linePath}
            fill="none"
            stroke="#0B2450"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Revenue Data Points */}
          {points.map((pt, i) => (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.yRev}
              r={hoveredIndex === i ? 6 : 4}
              className="cursor-pointer fill-[#0B2450] stroke-white stroke-2 transition-all"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* X-axis Month Labels */}
          {points.map((pt, i) => (
            <text
              key={`x-${i}`}
              x={pt.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#64748B] text-[11px] font-semibold"
            >
              {pt.month}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="pointer-events-none absolute -top-4 z-20 rounded-xl border border-gray-200 bg-white p-2.5 shadow-lg"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            <p className="text-[11px] font-bold text-gray-500 uppercase">{points[hoveredIndex].month} 2026</p>
            <p className="mt-0.5 text-[12px] font-semibold text-[#10469B]">
              Orders: <span className="font-bold text-gray-900">{points[hoveredIndex].orders}</span>
            </p>
            <p className="text-[12px] font-semibold text-[#0B2450]">
              Revenue: <span className="font-bold text-gray-900">{formatINR(points[hoveredIndex].revenue)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
