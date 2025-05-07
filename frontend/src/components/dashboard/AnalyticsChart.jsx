import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({ type, data, options, title, className }) => {
  const [chartData, setChartData] = useState(null);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (data) {
      setChartData(data);
    }
  }, [data]);
  
  if (!chartData) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsChart;
