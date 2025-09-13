import React from "react";

interface ChartData {
  month: string;
  income: number;
  growth: number;
}

interface ChartProps {
  data: ChartData[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const maxIncome = Math.max(...data.map((d) => d.income));
  const maxGrowth = Math.max(...data.map((d) => Math.abs(d.growth)));

  return (
    <div className="relative h-64 w-full">
      {/* Y-axis labels for income */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
        <span>${Math.round(maxIncome)}k</span>
        <span>${Math.round(maxIncome * 0.75)}k</span>
        <span>${Math.round(maxIncome * 0.5)}k</span>
        <span>${Math.round(maxIncome * 0.25)}k</span>
        <span>$0k</span>
      </div>

      {/* Chart content */}
      <div className="ml-8 mr-8 h-full flex items-end justify-between relative">
        {/* Growth line background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points={data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y =
                  100 - ((d.growth + maxGrowth) / (2 * maxGrowth)) * 100;
                return `${x}%,${y}%`;
              })
              .join(" ")}
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            className="opacity-70"
          />
        </svg>

        {/* Income bars */}
        {data.map((item) => (
          <div
            key={item.month}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* Growth indicator */}
            <div className="absolute -top-6 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>

            {/* Income bar */}
            <div className="w-full flex justify-center mb-2">
              <div
                className="bg-purple-600 rounded-t-lg transition-all duration-500 hover:bg-purple-700 cursor-pointer"
                style={{
                  height: `${(item.income / maxIncome) * 180}px`,
                  width: "32px",
                  maxWidth: "80%",
                }}
                title={`${item.month}: $${item.income}k income, ${item.growth}% growth`}
              />
            </div>

            {/* Month label */}
            <span className="text-xs text-gray-600 mt-2">{item.month}</span>
          </div>
        ))}
      </div>

      {/* Right Y-axis labels for growth */}
      <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pl-4">
        <span>{Math.round(maxGrowth)}%</span>
        <span>{Math.round(maxGrowth * 0.5)}%</span>
        <span>0%</span>
        <span>-{Math.round(maxGrowth * 0.5)}%</span>
        <span>-{Math.round(maxGrowth)}%</span>
      </div>
    </div>
  );
};

export default Chart;
