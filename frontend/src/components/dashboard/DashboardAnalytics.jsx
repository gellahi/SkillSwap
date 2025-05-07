import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format, subDays } from 'date-fns';
import AnalyticsChart from './AnalyticsChart';
import ExportAnalytics from './ExportAnalytics';

const DashboardAnalytics = () => {
  const { user } = useSelector(state => state.auth);
  const { projects } = useSelector(state => state.projects);
  const { bids } = useSelector(state => state.bids);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Generate sample data for demonstration
  const generateChartData = () => {
    const isClient = user?.role === 'client';
    const today = new Date();
    let labels = [];
    let projectData = [];
    let bidData = [];
    let earningsData = [];

    // Generate date labels based on selected time range
    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        labels.push(format(subDays(today, i), 'EEE'));
        projectData.push(Math.floor(Math.random() * 5));
        bidData.push(Math.floor(Math.random() * 10));
        earningsData.push(Math.floor(Math.random() * 500));
      }
    } else if (timeRange === 'month') {
      for (let i = 29; i >= 0; i--) {
        if (i % 5 === 0) {
          labels.push(format(subDays(today, i), 'MMM dd'));
          projectData.push(Math.floor(Math.random() * 15));
          bidData.push(Math.floor(Math.random() * 30));
          earningsData.push(Math.floor(Math.random() * 2000));
        }
      }
    } else if (timeRange === 'year') {
      for (let i = 0; i < 12; i++) {
        labels.push(format(new Date(today.getFullYear(), i, 1), 'MMM'));
        projectData.push(Math.floor(Math.random() * 50));
        bidData.push(Math.floor(Math.random() * 100));
        earningsData.push(Math.floor(Math.random() * 10000));
      }
    }

    return {
      activityData: {
        labels,
        datasets: [
          {
            label: isClient ? 'Projects Posted' : 'Bids Submitted',
            data: isClient ? projectData : bidData,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.5)',
            tension: 0.3,
            fill: true,
          }
        ]
      },
      earningsData: {
        labels,
        datasets: [
          {
            label: 'Earnings',
            data: earningsData,
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
          }
        ]
      },
      distributionData: {
        labels: isClient ? ['Active', 'Completed', 'Cancelled'] : ['Won', 'Lost', 'Pending'],
        datasets: [
          {
            data: [
              Math.floor(Math.random() * 10) + 5,
              Math.floor(Math.random() * 15) + 10,
              Math.floor(Math.random() * 5) + 2
            ],
            backgroundColor: [
              'rgba(14, 165, 233, 0.7)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(239, 68, 68, 0.7)'
            ],
            borderWidth: 1,
          }
        ]
      }
    };
  };

  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'week'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'month'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'year'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart
          type="line"
          data={chartData.activityData}
          options={chartOptions}
          title={user?.role === 'client' ? 'Project Activity' : 'Bidding Activity'}
          className="col-span-1 md:col-span-2"
        />

        <AnalyticsChart
          type="bar"
          data={chartData.earningsData}
          options={chartOptions}
          title="Earnings Overview"
        />

        <AnalyticsChart
          type="doughnut"
          data={chartData.distributionData}
          options={doughnutOptions}
          title={user?.role === 'client' ? 'Project Distribution' : 'Bid Distribution'}
        />
      </div>

      <div className="flex justify-end">
        <ExportAnalytics
          data={[
            // Sample data for export
            ...Array(10).fill().map((_, i) => ({
              date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
              projects: Math.floor(Math.random() * 5),
              bids: Math.floor(Math.random() * 10),
              earnings: Math.floor(Math.random() * 500)
            }))
          ]}
        />
      </div>
    </div>
  );
};

export default DashboardAnalytics;
