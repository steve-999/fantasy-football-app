import React from 'react';
import { Pie } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Test = () => {

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 205, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(201, 203, 207, 0.6)'
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
          maintainAspectRatio: false
        },
    };

    return (  
        <div>
            <h3>Test works!</h3>
            <div>
                <Pie
                    data={config.data}
                    width={300}
                    height={300}
                    redraw={false}
                    options={config.options}
                />
                <FontAwesomeIcon style={{color: 'red', fontSize: '40px'}} icon={faBars} />
            </div>
        </div>
    );
}
 
export default Test;

 