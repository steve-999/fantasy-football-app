import React from 'react';
import { Link } from 'react-router-dom';
import './LeagueTable.css';

const SMALLER_MOBILE_MAX_WIDTH = 420;
const MOBILE_MAX_WIDTH = 550;

function get_filtered_headings_list() {
    if (window.innerWidth < SMALLER_MOBILE_MAX_WIDTH) {
        return ['Team', 'Prev pts', 'Deducted', 'Curr pts', 'Sub', 'Total'];
    }
    else if (window.innerWidth < MOBILE_MAX_WIDTH) {
        return ['Rank', 'Team', 'Prev pts', 'Deducted', 'Curr pts', 'Sub', 'Total'];
    }
    else {
        return ['Rank', 'Team', 'Manager', 'Prev pts', 'Pts deducted', 'Curr pts', 'Sub pts', 'Total pts'];
    }
}

function get_filtered_cols_list() {
    if (window.innerWidth < SMALLER_MOBILE_MAX_WIDTH) {
        return ['Team', 'Prev pts', 'Pts deducted', 'Curr pts', 'Sub pts', 'Total pts'];
    }
    else if (window.innerWidth < MOBILE_MAX_WIDTH) {
        return ['Rank', 'Team', 'Prev pts', 'Pts deducted', 'Curr pts', 'Sub pts', 'Total pts'];
    }
    else {
        return ['Rank', 'Team', 'Manager', 'Prev pts', 'Pts deducted', 'Curr pts', 'Sub pts', 'Total pts'];
    }
}


function LeagueTable({curr_gw, league_id, manager_ids, league_table_dict, league_name})  {
    document.title = `Fantasy Football Stats | ${league_name} League Table`;

    const table_headings_row = () => {
        const headings_list = get_filtered_headings_list();
        const table_heading_cells = headings_list.map(col_name => {
            let val = col_name;
            if(col_name === 'Prev pts') {
                val = `GW ${curr_gw && curr_gw - 1}`;
            }
            else if(col_name === 'Curr pts') {
                val = `GW ${curr_gw && curr_gw}`;
            }
            return <th key={col_name}>{ val }</th>;
        });         
        return (<tr>{ table_heading_cells }</tr>);
    }

    const table_body_rows = () => {
        const cols_list = get_filtered_cols_list();
        const start_idx = cols_list.includes('Rank') ? 2 : 1;
        const rows = manager_ids.map((manager_id, i) => {
            return (
                <tr key={manager_id}>
                    { cols_list.includes('Rank') ? <td key="rank">{ manager_ids.length > 1 ? i+1 : '' }</td> : null}
                    <td key="team">
                        <Link to={`/leagues/${league_id}/${manager_id}/`}>
                            { league_table_dict && league_table_dict[manager_id]['team']}
                        </Link>
                    </td>
                    {
                        cols_list.slice(start_idx).map(col_name => {
                            const key_name = col_name.toLowerCase().replace(' ', '_');
                            const val = league_table_dict && league_table_dict[manager_id][key_name];
                            return (
                                <td key={key_name}>{ val }</td>
                            );
                        })
                    }
                </tr>
            );
        });
        return rows;
    }

    return (
        <div className="league-table-container">
            <h3>{ league_name }</h3>
            <table className="styled-table">
                <thead>{ table_headings_row() }</thead>
                <tbody>{ table_body_rows() }</tbody>
            </table>
        </div>
    );
}
 
export default LeagueTable;