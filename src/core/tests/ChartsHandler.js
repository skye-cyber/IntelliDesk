//npm install --save-dev jscharting
//npm install plotly.js --save-dev
import JSC from 'jscharting';
JSC.
//Basic Usage Example (Bar Chart):
JSC.chart('chartDiv', {
    type: 'column',
    series: [
        {
            points: [
                { x: 'A', y: 50 },
                { x: 'B', y: 30 },
                { x: 'C', y: 50 }
            ]
        }
    ]
});

// (bar, line, pie, scatter, 3D, maps)
import Plotly from 'plotly.js-dist';

const data = [
    {
        x: ['A', 'B', 'C'],
        y: [50, 30, 50],
        type: 'bar'
    }
];

Plotly.newPlot('chartDiv', data);
