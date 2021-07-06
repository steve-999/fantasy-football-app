import React from 'react';
import { Bar } from 'react-chartjs-2';
import { sort_LOD_by_key } from '../misc_functions';

const BarPointsChart = ({pts_contrib}) => {
    if (!pts_contrib) 
        return null;

    let LOD = [];
    for(const key of Object.keys(pts_contrib)) {
        if (key === 'total_points') 
            continue;
        if (Math.abs(pts_contrib[key]) > 2) {
            const d = {};
            d.label = key.replace('_', ' ');
            d.value = pts_contrib[key];
            LOD.push(d);
        }
    }
    LOD = sort_LOD_by_key(LOD, 'value', false)
    const chart_labels = LOD.map(x => x.label);
    const chart_data = LOD.map(x => Math.abs(x.value));

    const labels = chart_labels;
    const data = {
        labels: labels,
        datasets: [{
            label: 'Points contribution',
            data: chart_data,
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(201, 203, 207, 0.7)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                      beginAtZero: true,
                      min: 0
                    }    
                }]
            },
            title: {
                display: true,
                text: 'Points',
                fontSize: 16,
                fontColor: '#333',
                fontWeight: 'bold'
            },  
            legend: {
                display: false,
            },          
            maintainAspectRatio: false
        },
    };

    return (  
        <div>
            <Bar
                data={config.data}
                width={600}
                height={300}
                redraw={false}
                options={config.options}
            />
        </div>
    );
}

export default BarPointsChart;