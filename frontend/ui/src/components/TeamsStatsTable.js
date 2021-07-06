import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sort_LOD_by_key } from '../misc_functions';
import './TeamsStatsTable.css';


function get_filtered_cols_list() {
    const cols_list = ['team_name', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts', 'CS', 'GF_ma_S', 'GF_ma_L', 'difficulty_GF', 
                    'GA_ma_S', 'GA_ma_L', 'difficulty_GA'];
    const excluded_columns = [
        { max_width: 650, cols: ['GF_ma_S', 'GA_ma_S', 'difficulty_GF', 'difficulty_GA'] },
        { max_width: 775, cols: ['GF_ma_S', 'GA_ma_S'] },
        { max_width: 99999, cols: [] },
    ]
    const window_width = window.innerWidth;
    const excluded_cols_item = excluded_columns.find(x => x.max_width > window_width);
    const excluded_cols = excluded_cols_item.cols;
    const filtered_keys_list = cols_list.filter(x => !excluded_cols.includes(x));
    return filtered_keys_list;
}

const TeamsStatsTable = (props) => {
    const [sorted_teams_stats, set_sorted_teams_stats] = useState();
    document.title = 'Fantasy Football Stats | Premier League Table';
    const cols_list = get_filtered_cols_list();
    
    useEffect(() => {
        if (!props.teams_stats)
            return;
        let temp_teams_stats = sort_LOD_by_key(props.teams_stats, 'team_name', true);
        for (const key of ['GF', 'GD', 'Pts']) {
            temp_teams_stats = sort_LOD_by_key(temp_teams_stats, key, false);
        }
        set_sorted_teams_stats(temp_teams_stats);
    }, [props]);

    const get_headings_row = () => {
        const substitution_headings = {
            team_name: 'team',
            GF_ma_S: 'ma(GF,S)',
            GF_ma_L: 'ma(GF,L)',
            GA_ma_S: 'ma(GA,S)',
            GA_ma_L: 'ma(GA,L)',
        }
        const cells = cols_list.map(key => {
            let key_val = key;
            if (key in substitution_headings) {
                key_val = substitution_headings[key];
            }
            return <th key={key}>{key_val.replace(/_/g, ' ')}</th>;
        })
        return <tr>{ cells }</tr>;
    }

    const get_table_row = (team_dict) => {
        const cols_list = get_filtered_cols_list();
        const row_cells = cols_list.map(key => {
            let val = team_dict[key];
            if (key === 'team_name') {
                val = <Link to={`/teams/${team_dict.team_name.replace(' ', '_')}`}>{ team_dict.team_name }</Link>;
                return <td key={team_dict.team_name} className="team-name">{ val }</td>;
            }
            else if (['avg_GF', 'avg_GA', 'norm_GF', 'norm_GA'].includes(key)) {
                val = team_dict[key].toFixed(1);
            }
            return <td key={key}>{val}</td>;
        });
        return <tr key={team_dict.team_name}>{ row_cells }</tr>;
    }

    return (  
        <div className="teams-stats-table-container">
            <table className="styled-table">
                <thead>
                    { get_headings_row()}
                </thead>
                <tbody>
                    { sorted_teams_stats && sorted_teams_stats.map(team_dict => get_table_row(team_dict)) }
                </tbody>
            </table>
        </div>
    );
}
 
export default TeamsStatsTable;