import React from 'react';
import './PlayerStatsTable.css';


function get_filtered_cols_list(cols_list) {
    const excluded_columns = [
        { max_width: 430, cols: ['penalties_missed', 'penalties_saved', 'pts/90min', 'red_cards', 'saves', 'own_goals'] },
        { max_width: 575, cols: ['penalties_missed', 'penalties_saved', 'pts/90min'] },
        { max_width: 650, cols: ['penalties_missed', 'penalties_saved'] },
        { max_width: 800, cols: ['penalties_missed'] },
        { max_width: 99999, cols: [] },
    ]
    const excluded_cols_item = excluded_columns.find(x => x.max_width > window.innerWidth);
    const excluded_cols = excluded_cols_item.cols;
    const filtered_keys_list = cols_list.filter(x => !excluded_cols.includes(x.key));
    return filtered_keys_list;
}

const PlayerStatsTable = (props) => {
    if(!props.stats_values) {
        return null;
    }

    const {stats_values, pts_contrib, pts_contrib_pct, season_stats_info_keys} = props;
    const filtered_stats_info_keys = get_filtered_cols_list(season_stats_info_keys);
    const headings_row_cells = filtered_stats_info_keys.map(item => <th key={item.heading_text}>{item.heading_text}</th>);
    const values_row_cells = filtered_stats_info_keys.map(item => <td key={item.key}>{stats_values[item.key]}</td>);
    const pts_contrib_row_cells = filtered_stats_info_keys.map(item => <td key={item.key}>{pts_contrib[item.key]}</td>);
    const pts_contrib_pct_row_cells = filtered_stats_info_keys.map(item => <td key={item.key}>{pts_contrib_pct[item.key]}</td>);

    return (
        <table className="player-stats-table styled-table">
            <thead>
                <tr>
                    <th>&nbsp;</th>
                    {headings_row_cells}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Stats</td>
                    {values_row_cells}
                </tr>
                <tr>
                    <td>Points</td>
                    {pts_contrib_row_cells}
                </tr>
                <tr>
                    <td>%</td>
                    {pts_contrib_pct_row_cells}
                </tr>
            </tbody>
        </table>
    );
}

export default PlayerStatsTable;


