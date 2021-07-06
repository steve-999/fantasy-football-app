import React, { useState, useEffect } from 'react';
import {Line} from 'react-chartjs-2';
import { ema } from '../misc_functions';


const LineChartPointsMA = (props) => {
    const [chart_data, set_chart_data] = useState();

    useEffect(() => {
        if(props)
            load_gw_data(props);
    }, [props]);  

    function load_gw_data(props) {
        const { gw_data, Nma, var_name } = props;
        if (!gw_data || !Nma || !var_name) {
            return null;
        }
        const labels = gw_data.map(gw => gw.round);
        const data_total_pts = gw_data.map(gw => gw.total_points);
        let data_pts_ma = ema(data_total_pts, Nma);
        data_pts_ma = data_pts_ma.map(x => parseFloat(x.toFixed(2)));

        const tempObj = {
            labels: labels,
            datasets: [
                {
                    label: props.var_name,
                    data: data_pts_ma,
                    borderColor: '#8c83c9',
                    fill: false,
                    borderWidth: 2,
                    pointStyle: 'rect',
                    pointBackgroundColor: '#8c83c9'     
                },
                {
                    label: 'Points',
                    data: data_total_pts,
                    borderColor: 'tomato',    
                    fill: false,
                    borderWidth: 2,
                    pointStyle: 'cross',
                    showLine: false
                }
            ]
        }
        set_chart_data(tempObj);
    }

    return(
        <div>
            {
                chart_data && (
                    <Line 
                        data={chart_data}
                        width={320}
                        height={320}
                        redraw={false}
                        options={{
                            title: {
                                display: false,
                                text: props.Nma,
                                fontSize: 25,
                            },
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            showLines: true,
                            animation: {
                                duration: 500,
                                easing: 'linear'
                            }
                        }}
                    />
                )
            }
        </div>
    );
}

export default LineChartPointsMA;