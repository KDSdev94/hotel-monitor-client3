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

export const IssuesChart = ({ stats }) => {
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
                grid: { color: 'rgba(51, 51, 51, 0.4)' },
                ticks: { color: '#666', font: { size: 10 }, stepSize: 1 },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#999', font: { size: 10 } },
            },
        },
    };

    const data = {
        labels: ['Diselesaikan (Resolved)', 'Menunggu (Pending/Open)'],
        datasets: [
            {
                label: 'Jumlah Isu',
                data: [stats?.resolved || 0, stats?.pending || 0],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderRadius: 4,
                barThickness: 32,
            },
        ],
    };

    return <Bar options={options} data={data} />;
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
