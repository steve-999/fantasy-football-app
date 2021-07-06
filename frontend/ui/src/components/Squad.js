import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import LeagueTable from './LeagueTable';
import './Squad.css';

const TOTALS_BG_COLOR = 'lightgreen';
const SUBSTITUTES_BG_COLOR = '#dbe4f0';

const keys_info_list = [
    { key: 'web_name',          heading_text: 'Player'},
    { key: 'team_name',         heading_text: 'Team'}, 
    { key: 'curr_gw_game',      heading_text: 'Games'}, 
    { key: 'position',          heading_text: 'Position'}, 
    { key: 'captain',           heading_text: 'Captain'}, 
    { key: 'on_bench',          heading_text: 'Sub'},
];

const stats_info_list = [
    { key: 'total_points',          heading_text: 'Points'},
    { key: 'minutes',               heading_text: 'Mins'},
    { key: 'goals_scored',          heading_text: 'G'},
    { key: 'assists',               heading_text: 'A'},
    { key: 'goals_conceded',        heading_text: 'GC'},
    { key: 'clean_sheets',          heading_text: 'CS'},
    { key: 'bonus',                 heading_text: 'Bonus'},
    { key: 'yellow_cards',          heading_text: 'YC'},
    { key: 'red_cards',             heading_text: 'RC'},
    { key: 'saves',                 heading_text: 'Saves'},
    { key: 'penalties_saved',       heading_text: 'Pens saved'},
    { key: 'penalties_missed',      heading_text: 'Pens missed'},
    { key: 'own_goals',             heading_text: 'OG'},
];

const player_info_headings = keys_info_list.map(x => x.heading_text);
const player_info_keys = keys_info_list.map(x => x.key);
const stats_headings = stats_info_list.map(x => x.heading_text);
const stats_keys = stats_info_list.map(x => x.key);


class Squad extends Component {
    constructor(props) {
        super(props);
        this.state = {  
            curr_gw: undefined,
            league_id: undefined,
            manager_id: undefined,
            squad_dict: undefined,
            team_info: undefined,
            teams_lookup: undefined
        }
    }

    componentDidMount() {
        this.setState({
            manager_id: this.props.match.params.manager_id,
            league_id: this.props.match.params.league_id,
            manager_id_as_array: [this.props.match.params.manager_id]
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.manager_id) {
            if (this.props.curr_gw && prevState.curr_gw !== this.props.curr_gw) {
                this.setState({ 
                    curr_gw: this.props.curr_gw
                });
            }

            if (this.state.manager_id && this.props.squads_dict && prevState.squads_dict !== this.props.squads_dict) {
                this.setState({ 
                    squads_dict: this.props.squads_dict,
                    squad_dict: this.props.squads_dict[this.state.manager_id]
                });
            }

            if (this.state.manager_id && this.props.league_table_dict && prevState.league_table_dict !== this.props.league_table_dict) {
                const team_info = this.props.league_table_dict[this.state.manager_id];
                document.title = `Fantasy Football Stats | ${team_info.team} Squad`;
                this.setState({ 
                    team_info: team_info,
                    league_table_dict: this.props.league_table_dict
                });
            }          
        }
    }

    get_table_headings_row = () => {
        const player_info_th_cells = player_info_headings.map(k => <th key={k}>{ k }</th>);
        const stats_th_cells = stats_headings.map(k => <th key={k}>{ k }</th>);
        return <tr key="headings">{ player_info_th_cells.concat(stats_th_cells) }</tr>;
    }

    captainDidNotPlay(squad) {
        for (const player of squad) {
            if (player.captain === true) {
                return player.did_play === false;
            }   
        };
    }

    get_table_row_dict = (player) => {
        const row_dict = {};
        player_info_keys.forEach(key => {
            let val = player[key];
            row_dict.player_id = player.player_id;
            if (key === 'captain') {
                if (player.captain) {
                    val = this.state.team_info.chip_status === '3xc' ? '3xC' : 'C';
                } 
                else if (player.vice_captain) {
                    val = this.state.team_info.chip_status === '3xc' ? '3xV' : 'V';
                }
            }
            else if (key === 'curr_gw_game') {
                val = player.curr_gw_game.map(game => {
                    const d = {};
                    d.datetime = game.datetime;
                    d.opposition = game.opposition;
                    d.game_status = game.game_status;
                    return d;
                });
            }
            else if (key === 'on_bench') {
                val = player.on_bench ? 'Sub' : '';
            }
            row_dict[key] = val;
        });
        const captain_status = this.state.squad_dict.captain_status;
        stats_keys.forEach(key => {
            let val = player.stats[key];
            if (key === 'total_points') {
                if (player.captain && ['2xC', '3xC'].includes(captain_status)) {
                    val = captain_status === '2xC' ? val * 2 : (captain_status === '3xC' ? val * 3 : val); 
                }
                else if (player.vice_captain && ['2xV', '3xV'].includes(captain_status)) {
                    val = captain_status === '3xV' ? val * 3 : (captain_status === '2xV' ? val * 2 : val); 
                }
            }
            row_dict[key] = val;
        });
        return row_dict;
    }
    
    calc_stats_totals(LOD) {
        const totals = {};
        totals.web_name = 'Total';
        stats_keys.forEach(key => totals[key] = 0);
        LOD.forEach(player => {
            stats_keys.forEach(key => totals[key] += player[key]);
        })
        return totals;
    }

    create_table_row = (player, row_bg_color) => {
        const keys_list = player_info_keys.concat(stats_keys);
        const row_cells = keys_list.map(key => {
            let val = player[key];
            if (key === 'web_name') {
                const web_name_id = `${player.web_name.replace(' ', '_')}_${player.player_id}`;
                val = <Link to={`/players/${web_name_id}`}>{player.web_name}</Link>;
            }
            else if (key === 'team_name') {
                const team_name = player.team_name.replace(' ', '_');
                val = <Link to={`/teams/${team_name}`}>{player.team_name}</Link>;
            }
            else if (key === 'curr_gw_game') {
                val = player.curr_gw_game.map(game => {
                    let class_name;
                    if (game.game_status === 'not_started') {
                        class_name = 'curr_gw_game_not_started';
                    }
                    else if (game.game_status === 'in_progress') {
                        class_name = 'curr_gw_game_in_progress';
                    }
                    else {
                        class_name = 'curr_gw_game_finished';
                    }
                    return <div key={`${player.player_id}|${game.game_id}`} className={class_name}>{game.opposition}</div>
                });
            }

            switch(key) {
                case 'web_name':
                case 'team_name':
                    return <td key={key} style={{textAlign: 'left'}}>{val}</td>;
                case 'curr_gw_game':
                    return <td key={key} style={{padding: '0px', margin: '0px'}}>{val}</td>;
                default:
                    return <td key={key}>{val}</td>;
            }
        });
        let row;
        if(row_bg_color) {
            row = <tr key={player.player_id} style={{backgroundColor: row_bg_color}}>{row_cells}</tr>;
        }
        else {
            row = <tr key={player.player_id}>{row_cells}</tr>;
        }
        return row;
    }

    create_totals_row = (totals_dict, row_bg_color) => {
        const keys_list = player_info_keys.concat(stats_keys);
        const row_cells = keys_list.map(key => {
            return (key === 'web_name' 
                        ? <td key={key} style={{textAlign: 'left'}}>{totals_dict[key]}</td> 
                        : <td key={key}>{totals_dict[key]}</td>);
        }); 
        const row = <tr key="totals" style={{backgroundColor: row_bg_color}}>{row_cells}</tr>;       
        return row; 
    }

    get_table_rows() {
        const { squad_dict } = this.state;
        const player_ids = squad_dict.squad.map(player => player.player_id);
        const firstXI_player_ids = squad_dict.final_firstXI.map(player => player.player_id);
        const substitute_player_ids = player_ids.filter(player_id => !firstXI_player_ids.includes(player_id))
        const squad_lookup = {};
        squad_dict.squad.forEach(player => squad_lookup[player.player_id] = player);
        const firstXI_LOD = firstXI_player_ids.map(player_id => this.get_table_row_dict(squad_lookup[player_id]));
        const substitute_LOD = substitute_player_ids.map(player_id => this.get_table_row_dict(squad_lookup[player_id]));
        const firstXI_totals_dict = this.calc_stats_totals(firstXI_LOD);
        const substitute_totals_dict = this.calc_stats_totals(substitute_LOD);
        const firstXI_rows = firstXI_LOD.map(player => this.create_table_row(player));
        const substitute_rows = substitute_LOD.map(player => this.create_table_row(player, SUBSTITUTES_BG_COLOR));
        let totals_row;
        if (this.state.team_info.chip_status === 'bboost') {
            let totals_dict = {};
            Object.keys(firstXI_totals_dict).forEach(key => totals_dict[key] = firstXI_totals_dict[key] + substitute_totals_dict[key]);
            totals_dict.web_name = 'Total';
            totals_row = this.create_totals_row(totals_dict, TOTALS_BG_COLOR);
        }
        else {
            totals_row = this.create_totals_row(firstXI_totals_dict, TOTALS_BG_COLOR);
        }
        return firstXI_rows.concat(substitute_rows).concat(totals_row);
    }

    render() { 
        return (  
            <div className="squad-container">
                <div className="title-container">
                    <span className="title-text"><Link to={`/leagues/${this.props.league_id}`}>{this.props.league_name}</Link></span>
                    <span className="title-text">&nbsp;&gt;&nbsp;{ this.state.team_info && this.state.team_info.team }</span>
                </div>
                <div className="league-table-container">
                    {this.state.squad_dict 
                        && <LeagueTable 
                                curr_gw={this.state.curr_gw}
                                league_id={this.state.league_id}
                                manager_ids={this.state.manager_id_as_array}
                                league_table_dict={this.state.league_table_dict}
                                league_name={''}
                            />
                    }
                </div>
                <div className="squad-table-container">
                    { this.state.squad_dict ? (
                            <table className="styled-table">
                                <thead>
                                    { this.get_table_headings_row() }
                                </thead>
                                <tbody>
                                    { this.get_table_rows() }
                                </tbody>
                            </table>
                        )
                        : <h3>There are no fixtures left this season.</h3>
                    }
                </div>
            </div>
        );
    }
}
 
export default withRouter(Squad);