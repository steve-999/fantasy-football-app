import React, { Component } from 'react';
import './PlayerInfo.css';
import PlayerStatsTable from './PlayerStatsTable';
import LineChartPointsMA from './LineChartPointsMA';
import BarPointsChart from './BarPointsChart';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetch_player_season_stats, fetch_player_gw_stats, fetch_fixture_list } from '../redux/actionCreators';

const mapStateToProps = state => {
    return {
        player_season_stats_data: state.player_season_stats_data,
        player_gw_stats_data: state.player_gw_stats_data,
        fixture_list_data: state.fixture_list_data
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetch_player_season_stats: web_name_id => dispatch(fetch_player_season_stats(web_name_id)),
        fetch_player_gw_stats: web_name_id => dispatch(fetch_player_gw_stats(web_name_id)),
        fetch_fixture_list: () => dispatch(fetch_fixture_list())
    };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const Nma_L = 10;
const Nma_S = 5;

const season_stats_info_keys = [
    { key: 'total_points',          heading_text: 'Pts'},
    { key: 'minutes',               heading_text: 'Mins'},
    { key: 'goals_scored',          heading_text: 'G'},
    { key: 'assists',               heading_text: 'A'},
    { key: 'clean_sheets',          heading_text: 'CS'},
    { key: 'goals_conceded',        heading_text: 'GC'},
    { key: 'bonus',                 heading_text: 'bonus'},
    { key: 'yellow_cards',          heading_text: 'YC'},
    { key: 'red_cards',             heading_text: 'RC'},
    { key: 'saves',                 heading_text: 'saves'},
    { key: 'penalties_saved',       heading_text: 'pens saved'},
    { key: 'penalties_missed',      heading_text: 'pens missed'},
    { key: 'own_goals',             heading_text: 'OG'},
    { key: 'mins/(G + A)',          heading_text: 'mins/(G+A)'},
    { key: 'pts/90min',             heading_text: 'pts/90min'},
];
const season_stats_keys = season_stats_info_keys.map(x => x.key);
const season_stats_table_headings = season_stats_info_keys.map(x => x.heading_text);

const gw_stats_table_keys_list = [
    { displayName: 'Date',              arrayKey: 'datetime',           type: 'string', sortDirection: 'asc'},
    { displayName: 'GW',                arrayKey: 'round',              type: 'int',    sortDirection: 'asc'},
    { displayName: 'Opposition',        arrayKey: 'opposition',         type: 'string', sortDirection: 'asc'},
    { displayName: 'H/A',               arrayKey: 'home_away',          type: 'string', sortDirection: 'asc'},
    { displayName: 'GF',                arrayKey: 'GF',                 type: 'int',    sortDirection: 'asc'},
    { displayName: 'GA',                arrayKey: 'GA',                 type: 'int',    sortDirection: 'asc'},
    { displayName: 'Mins',              arrayKey: 'minutes',            type: 'int',    sortDirection: 'asc'},
    { displayName: 'Pts',               arrayKey: 'total_points',       type: 'int',    sortDirection: 'asc'},
    { displayName: 'G',                 arrayKey: 'goals_scored',       type: 'int',    sortDirection: 'asc'},
    { displayName: 'A',                 arrayKey: 'assists',            type: 'int',    sortDirection: 'asc'},
    { displayName: 'CS',                arrayKey: 'clean_sheets',       type: 'int',    sortDirection: 'asc'},
    { displayName: 'GC',                arrayKey: 'goals_conceded',     type: 'int',    sortDirection: 'asc'}, 
    { displayName: 'OG',                arrayKey: 'own_goals',          type: 'int',    sortDirection: 'asc'},
    { displayName: 'YC',                arrayKey: 'yellow_cards',       type: 'int',    sortDirection: 'asc'},
    { displayName: 'RC',                arrayKey: 'red_cards',          type: 'int',    sortDirection: 'asc'},
    { displayName: 'Bonus',             arrayKey: 'bonus',              type: 'int',    sortDirection: 'asc'}, 
    { displayName: 'Saves',             arrayKey: 'saves',              type: 'int',    sortDirection: 'asc'},
    { displayName: 'ma(Pts,L)',         arrayKey: 'pts_ma_L',           type: 'float',  sortDirection: 'asc'},
    { displayName: 'ma(Pts,S)',         arrayKey: 'pts_ma_S',           type: 'float',  sortDirection: 'asc'},
    { displayName: 'Transfers (k)',     arrayKey: 'transfers_balance',  type: 'int',    sortDirection: 'asc'},
    { displayName: 'Price',             arrayKey: 'value',              type: 'int',    sortDirection: 'asc'},
];

const excluded_columns = [
    {
        max_width: 450,
        cols: ['transfers_balance', 'own_goals', 'saves', 'yellow_cards', 'red_cards', 'pts_ma_S', 'pts_ma_L', 'goals_conceded', 'value']
    }, 
    {
        max_width: 500,
        cols: ['transfers_balance', 'own_goals', 'saves', 'yellow_cards', 'red_cards', 'pts_ma_S', 'pts_ma_L', 'goals_conceded']
    }, 
    {
        max_width: 560,
        cols: ['transfers_balance', 'own_goals', 'saves', 'yellow_cards', 'red_cards', 'pts_ma_S', 'pts_ma_L']
    }, 
    {
        max_width: 700,
        cols: ['transfers_balance', 'own_goals', 'saves', 'yellow_cards', 'red_cards', 'pts_ma_S']
    }, 
    {
        max_width: 840,
        cols: ['transfers_balance', 'own_goals', 'saves']
    },    
    {
        max_width: 99999,
        cols: []
    },
];

function get_filtered_keys_list(cols_list, excluded_cols) {
    const excluded_cols_item = excluded_cols.find(x => x.max_width > window.innerWidth);
    const excluded_cols_list = excluded_cols_item.cols;
    const filtered_keys_list = cols_list.filter(x => !excluded_cols_list.includes(x.arrayKey));
    return filtered_keys_list;
}


const PlayerInfoTable = ({season_stats, web_name}) => {
    const player_info_keys = [
        'team_name',
        'position',
        'price',
    ];
    const longPositionName = {
        'GK': 'Goalkeeper',
        'DEF': 'Defender',
        'MID': 'Midfield',
        'FWD': 'Forward'
    }

    if (!season_stats) {
        return null;
    }
    const displayVals = {};
    displayVals.team_name = season_stats.team_name;
    displayVals.position = longPositionName[season_stats.position];
    displayVals.price = `£${season_stats.price}m`;
    const img_fname = season_stats.photo.replace('jpg', 'png');
    const cells = player_info_keys.map(key => <li key={`${key}-value`}>{ season_stats && displayVals[key] }</li>);

    const JSX = (
        <div className="player-info-banner">
            <ul className="player-info-list">
                <li key="web_name" className="player-name-title">{ web_name }</li>
                { cells }
            </ul>
            <div className="player-img-div">
                <img src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${img_fname}`} alt={web_name} />
            </div>
        </div>
    )
    return JSX;
}

///////////////////////////////////////////////////////////////////////////////

class PlayerInfo extends Component {

    constructor(props) {
        super(props);
        let web_name_id = this.props.match.params.web_name_id;
        this.state = {
            web_name_id: web_name_id,
            web_name: web_name_id.split('_').slice(0, -1).join('_'),
            gw_data: undefined,
            fixtures_dict: undefined,
            fixtures_data: undefined,
            season_stats: undefined,
        };
    }

    componentDidMount() {
        document.title = `Fantasy Football Stats | ${this.state.web_name}`;
        this.props.fetch_player_season_stats(this.state.web_name_id);
        this.props.fetch_player_gw_stats(this.state.web_name_id); 
        this.props.fetch_fixture_list();
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.player_season_stats_data !== this.props.player_season_stats_data) {
            this.process_player_season_stats(this.props.player_season_stats_data);
        }
        if(prevProps.player_gw_stats_data !== this.props.player_gw_stats_data) {
            this.process_player_gw_stats(this.props.player_gw_stats_data);
        }
        if(prevProps.fixture_list_data !== this.props.fixture_list_data) {
            this.process_fixture_list(this.props.fixture_list_data);
        }
    }


    process_player_season_stats(data) {
        if (!data)
            return;
        data['mins/(G + A)'] = (data.goals_scored + data.assists) > 0 
            ? Math.round(data.minutes / (data.goals_scored + data.assists))
            : '-';
        data['pts/90min'] = (data.minutes > 0 ? data.total_points / (data.minutes / 90) : 0).toFixed(1);
        this.setState({
            season_stats: data
        }, () => this.calc_player_stats_table_values());
    }


    process_player_gw_stats(data) {
        this.setState({
            gw_data: data.gw_stats
        }, () => this.calc_player_stats_table_values());     
    }

    process_fixture_list(data) {
        const dict = {};
        data.forEach(item => {
            dict[item.game_id] = {
                team_h_name: item.team_h_name,
                team_a_name: item.team_a_name,
                team_h_score: item.team_h_score,
                team_a_score: item.team_a_score,
            }
        });
        this.setState({
            fixtures_dict: dict,
            fixtures_data: data
        });
    }

    calc_player_stats_table_values() {
        if (!this.state.season_stats || !this.state.gw_data) {
            return;
        }

        const calcPointsContribution = (season_stats, gw_data) => {

            const get_pts_for_mins = (gw_data) =>  {
                const mins_array = gw_data.map(gw => gw.minutes);
                const pts_fn = mins => mins >= 60 ? 2 : (mins > 0 ? 1 : 0);
                return mins_array.map(pts_fn).reduce((acc, cur) => acc + cur);
            }
    
            const get_pts_for_saves = (position, gw_data) =>  {
                const pts_array = gw_data.map(gw => {
                    return position === 'GK' ?  Math.floor(gw.saves / 3) : 0;
                });
                return pts_array.reduce((acc, cur) => acc + cur);
            }
            
            const get_pts_for_goals_conceded = (position, gw_data) => {
                const pts_array = gw_data.map(gw => {
                    return ['GK', 'DEF'].includes(position) ? -1 * Math.floor(gw.goals_conceded / 2) : 0;
                });
                return pts_array.reduce((acc, cur) => acc + cur);                                                           
            }
    
            const get_pts_for_clean_sheets = (position, gw_data) => {
                const pts_array = gw_data.map(gw => {
                    if (gw.clean_sheets === 1 && gw.minutes >= 60) {
                        switch(position) {
                            case 'GK':
                            case 'DEF':
                                return 4;
                            case 'MID':
                                return 1;
                            case 'FWD':
                                return 0;
                            default:
                                return 0;
                        }
                    }
                    return 0;
                });
                return pts_array.reduce((acc, cur) => acc + cur);
            }
    
            const get_pts_for_key = (season_stats, position) => {
                const pts_for_positions = {
                    penalties_saved:    { GK:    5, DEF:    0, MID:    0, FWD:    0 },
                    penalties_missed:   { GK:   -2, DEF:   -2, MID:   -2, FWD:   -2 },
                    bonus:              { GK:    1, DEF:    1, MID:    1, FWD:    1 },
                    yellow_cards:       { GK:   -1, DEF:   -1, MID:   -1, FWD:   -1 },
                    red_cards:          { GK:   -3, DEF:   -3, MID:   -3, FWD:   -3 },
                    goals_scored:       { GK:    6, DEF:    6, MID:    5, FWD:    4 },
                    assists:            { GK:    3, DEF:    3, MID:    3, FWD:    3 },
                    own_goals:          { GK:   -2, DEF:   -2, MID:   -2, FWD:   -2 },
                    total_points:       { GK:    1, DEF:    1, MID:    1, FWD:    1 },
                };
    
                const pts_contrib = {}
                Object.keys(pts_for_positions).forEach(key => {
                    pts_contrib[key] = season_stats[key] * pts_for_positions[key][position];
                });
                return pts_contrib;
            }
        
            const position = season_stats.position;
            const pts_contrib = get_pts_for_key(season_stats, position);
            pts_contrib.minutes = get_pts_for_mins(gw_data);
            pts_contrib.saves = get_pts_for_saves(position, gw_data);
            pts_contrib.goals_conceded = get_pts_for_goals_conceded(position, gw_data);
            pts_contrib.clean_sheets = get_pts_for_clean_sheets(position, gw_data);
            pts_contrib.total_points = season_stats.total_points;
            return pts_contrib;
        }
    
        const get_pts_contrib_percentage = (pts_contrib) => {
            const pts_contrib_pct = {};
            for (const key of Object.keys(pts_contrib)) {
                pts_contrib_pct[key] = parseInt((100 * pts_contrib[key] / pts_contrib.total_points).toFixed(0));
            }
            return pts_contrib_pct;
        }
    
        const get_stats_values = (season_stats) => {
            const res = {};
            season_stats_keys.forEach(key => {
                if (key.includes('ppm')) {
                    res[key] = season_stats[key].toFixed(4);
                }
                else {
                    res[key] = season_stats[key];
                } 
            })    
            return res;
        }
    
        const stats_values = get_stats_values(this.state.season_stats);
        const pts_contrib = calcPointsContribution(this.state.season_stats, this.state.gw_data);
        const pts_contrib_pct = get_pts_contrib_percentage(pts_contrib);

        this.setState({
            stats_values: stats_values,
            pts_contrib: pts_contrib,
            pts_contrib_pct: pts_contrib_pct
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getPlayerResultsTableHeadingsRow() {
        const filtered_keys_list = get_filtered_keys_list(gw_stats_table_keys_list, excluded_columns);
        const row = filtered_keys_list.map(x => {
            return(
                <th key={x.arrayKey} 
                    className={this.state.sortByKey === x.displayName ? 'heading-cell-sortByKey' : 'heading-cell-normal'} 
                    onClick={this.handleHeadingClick}
                    >
                    { x.displayName }
                </th>
            );
        });
        return row;
    }

    getPlayerResultsTableRow(gw_data) {
        const fixtureInfo = this.state.fixtures_dict[gw_data.fixture];
        const dt = new Date(gw_data.kickoff_time);
        gw_data.datetime = `${dt.getDate().toString().padStart(2, '0')} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;

        const players_team = this.state.season_stats.team_name;
        if (fixtureInfo.team_h_name === players_team) {
            gw_data.opposition = fixtureInfo.team_a_name;
            gw_data.home_away = 'H';
            gw_data.GF = fixtureInfo.team_h_score
            gw_data.GA = fixtureInfo.team_a_score;
        }
        else {
            gw_data.opposition = fixtureInfo.team_h_name;
            gw_data.home_away = 'A';
            gw_data.GF = fixtureInfo.team_a_score;
            gw_data.GA = fixtureInfo.team_h_score;
        }

        const filtered_keys_list = get_filtered_keys_list(gw_stats_table_keys_list, excluded_columns);
        const row = filtered_keys_list.map(x => {
            let val = gw_data[x.arrayKey];
            if (x.arrayKey === 'opposition') {
                val = <Link to={`/teams/${gw_data.opposition.replace(' ', '_')}`}>{gw_data.opposition}</Link>
            }
            else if (x.arrayKey.includes('transfers_')) {
                val = Math.round(gw_data[x.arrayKey] / 1000);
            }
            else if (x.arrayKey === 'value') {
                val = Math.round(10 * gw_data.value) / 100;
            }
            if (x.type === 'string') {
                return <td key={x.arrayKey}>{ val }</td>;
            }
            else {
                return <td key={x.arrayKey} className="td-centre-text">{ val }</td>
            }
        });
        return row;
    }

    createPlayerResultsTableRows() {
        const rows = this.state.gw_data.map((data, i) => {
            return(
                <tr key={i}>
                    { this.getPlayerResultsTableRow(data) }
                </tr>
            );
        })
        return rows;
    }

    render() {
        return (
            <div className="player-info-page-container">
                <div className="player-info-flex-container">
                    <div className="player-info-container">
                        <div>
                            <PlayerInfoTable season_stats={this.state.season_stats} web_name={this.state.web_name} />
                        </div>
                        <div className="stats-tables-container">

                            <div className="player-stats-table-container">
                                <PlayerStatsTable 
                                    stats_values={this.state.stats_values} 
                                    pts_contrib={this.state.pts_contrib}
                                    pts_contrib_pct={this.state.pts_contrib_pct} 
                                    season_stats_info_keys={season_stats_info_keys}
                                    season_stats_keys={season_stats_keys}
                                    season_stats_table_headings={season_stats_table_headings}

                                />
                            </div>
                            <div className="line-charts-container">
                                <span className="line-chart-span">
                                    <LineChartPointsMA 
                                        Nma={Nma_L} 
                                        var_name="Pts ma L"
                                        gw_data={this.state.gw_data} 
                                    />
                                </span>
                                <span className="line-chart-span">
                                    <LineChartPointsMA 
                                        Nma={Nma_S} 
                                        var_name="Pts ma S"
                                        gw_data={this.state.gw_data} 
                                    />
                                </span>
                            </div>
                            <div className="bar-chart-container">
                                <BarPointsChart pts_contrib={this.state.pts_contrib} />
                            </div>
                        </div>
                        <div className="player-results-table-container">
                            <table className="styled-table">
                                <thead><tr>{ this.getPlayerResultsTableHeadingsRow() }</tr></thead>
                                <tbody>
                                    {this.state.gw_data && this.state.fixtures_dict && this.createPlayerResultsTableRows() }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerInfo);