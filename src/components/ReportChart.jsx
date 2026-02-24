import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export const OccupancyChart = ({ data: customData }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#232323',
                titleFont: { family: 'Noto Serif' },
                bodyFont: { family: 'Noto Sans' },
                borderColor: '#444',
                borderWidth: 1,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(51, 51, 51, 0.4)' },
                ticks: { color: '#666', font: { size: 10 } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#999', font: { size: 10 } },
            },
        },
    };

    const defaultData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'This Week',
                data: [75, 82, 88, 85, 95, 98, 92],
                backgroundColor: '#f4c025',
                borderRadius: 4,
                barThickness: 12,
            },
            {
                label: 'Last Week',
                data: [60, 65, 70, 75, 85, 90, 80],
                backgroundColor: 'rgba(107, 114, 128, 0.3)',
                borderRadius: 4,
                barThickness: 12,
            },
        ],
    };

    return <Bar options={options} data={customData || defaultData} />;
};

export const StatusDoughnut = ({ stats }) => {
    const data = {
        labels: ['Tersedia', 'Pembersihan', 'Kotor', 'Perbaikan'],
        datasets: [
            {
                data: stats ? [stats.available, stats.cleaning, stats.dirty || 0, stats.maintenance] : [65, 8, 8, 19],
                backgroundColor: ['#10b981', '#f4c025', '#9f1239', '#6b7280'],
                borderWidth: 0,
                cutout: '70%',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return <Doughnut data={data} options={options} />;
};
