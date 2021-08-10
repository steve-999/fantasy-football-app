import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { sort_LOD_by_key, create_lookup_dict } from '../misc_functions';
import LeagueTable from './LeagueTable';
import Squad from './Squad';

import { connect } from 'react-redux';
import { 
    fetch_league_info, 
    fetch_live_data, 
    fetch_squads_for_league_id,
    fetch_curr_gw
} from '../redux/actionCreators';

const mapStateToProps = state => {
    return {
        loading_league_info: state.loading_league_info,
        league_info_data: state.league_info_data,
        loading_live_data: state.loading_live_data,
        live_data: state.live_data,
        loading_squads_for_league_id: state.loading_squads_for_league_id,
        squads_for_league_id_data: state.squads_for_league_id_data,
        loading_curr_gw: state.loading_curr_gw,
        curr_gw: state.curr_gw,
        teams: state.team_ids_data
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetch_league_info: league_id => dispatch(fetch_league_info(league_id)),
        fetch_live_data: curr_gw => dispatch(fetch_live_data(curr_gw)),
        fetch_squads_for_league_id: (league_id, curr_gw) => dispatch(fetch_squads_for_league_id(league_id, curr_gw)),
        fetch_curr_gw: () => dispatch(fetch_curr_gw())
    };
}

function get_game_status(game_start_datetime) {
    const game_datetime = game_start_datetime;
    const curr_datetime = (new Date()).toISOString();
    const game_date_time_array = game_datetime.split('T');
    const game_starttime_array = game_date_time_array[1].split(':');
    const game_endtime_array = [...game_starttime_array];
    game_endtime_array[0] = (parseInt(game_endtime_array[0]) + 2).toString();
    const game_endtime = game_endtime_array.join(':');
    const game_end_datetime = [game_date_time_array[0], game_endtime].join('T');
    if (curr_datetime > game_end_datetime)
        return 'finished';
    else if (curr_datetime > game_datetime && curr_datetime < game_end_datetime)
        return 'in_progress';
    else
        return 'not_started';
}


class LeaguesContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manager_ids: [],
            league_name: '',
            league_id: undefined,
            league_info: undefined,
            league_table_dict: undefined,
            league_squads_dict: undefined,
            live_data_dict: undefined,
            path: undefined
        }
    }

    componentDidMount() {
        if (!this.props.curr_gw && !this.props.loading_curr_gw)
            this.props.fetch_curr_gw();  
        this.setState({
            league_id: this.props.match.params.league_id,
            path: this.props.match.url
        }, () => {
            if (!this.props.league_info_data && !this.props.loading_league_info) {
                this.props.fetch_league_info(this.state.league_id);  
            }
        });
        
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.curr_gw && prevState.curr_gw !== this.props.curr_gw) {
            const { curr_gw } = this.props;
            if (!this.props.loading_live_data)
                this.props.fetch_live_data(curr_gw);
            if (!this.props.squads_for_league_id_data && !this.props.loading_squads_for_league_id)
                this.props.fetch_squads_for_league_id(this.state.league_id, curr_gw);
            this.setState({
                curr_gw: curr_gw
            });
        }

        if (this.props.league_info_data && prevState.league_info !== this.props.league_info_data){
            this.setState({
                league_info: this.props.league_info_data,
                manager_ids: this.props.league_info_data.manager_ids,
                league_name: this.props.league_info_data.name
            }, () => {
                const league_table_dict = this.create_league_table_dict(this.props.league_info_data);
                if(league_table_dict) {
                    this.setState({
                        league_table_dict: league_table_dict
                    });
                }
            });  
        }
        
        if (this.props.live_data && prevProps.live_data !== this.props.live_data){
            const live_data_dict = create_lookup_dict(this.props.live_data.elements, 'id');
            this.setState({
                live_data_dict: live_data_dict
            }, () => {
                this.calculate_league_table_dict(this.state.league_table_dict, this.state.live_data_dict, this.state.squads_for_league_id)
            });
        }

        if (this.props.squads_for_league_id_data && prevState.squads_for_league_id !== this.props.squads_for_league_id_data){
            this.setState({
                squads_for_league_id: this.props.squads_for_league_id_data
            }, () => {
                this.calculate_league_table_dict(this.state.league_table_dict, this.state.live_data_dict, this.state.squads_for_league_id);
            });
        }
    }

    calculate_league_table_dict(league_table_dict, live_data_dict, squads_for_league_id) {
        const league_squads_dict = this.create_league_squads_dict(league_table_dict, live_data_dict, squads_for_league_id);
        if (league_squads_dict) {
            this.setState({
                league_squads_dict: league_squads_dict
            }, () => {
                const result = this.calcSubstitutesPoints(league_table_dict, league_squads_dict);
                this.setState({
                    league_table_dict: result.league_table_dict,
                    league_squads_dict: result.league_squads_dict
                }, () => {
                    const league_table_dict = this.calcTotalPoints(this.state.manager_ids, this.state.league_table_dict, 
                                                                            league_squads_dict, live_data_dict);
                    const new_manager_ids = this.sort_manager_ids_by_total_pts(league_table_dict);
                    if(league_table_dict) {
                        this.setState({
                            league_table_dict: league_table_dict,
                            manager_ids: new_manager_ids
                        });
                    }
                })
            });
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    captainDidNotPlay(squad) {
        for (const player of squad) {
            if (player.captain === true) {
                return player.did_play === false;
            }   
        };
    }
    
    
    create_league_table_dict(league_info_data) {
        if (!league_info_data) {
            return undefined;
        }
    
        const empty_table_obj = {
            rank: null,
            team: '',
            manager: '',
            prev_pts: null,
            curr_pts: null,
            pts_deducted: null,
            sub_pts: null,
            total_pts: null,
            chip_status: null
        }
    
        const league_table_dict = {};
        const manager_data = league_info_data.managers_curr_gw_info;
        manager_data.forEach(x => {
            const manager_id = x.manager_id; 
            const d = {
                ...empty_table_obj,
                team: x.team_name.replace(/[^ -~]+/g, ""),
                manager: x.manager_name,    
                last_rank: x.last_rank,
                rank: x.rank,
                pts_deducted: x.points_deducted,
                prev_pts: x.prev_gw_points,
                chip_status: x.chip_status
            };
            league_table_dict[manager_id] = d;
        });
        return league_table_dict;
    }
    
    
    create_league_squads_dict(league_table_dict, live_data_dict, squads_for_league_id) {
        if (!league_table_dict || !live_data_dict || !squads_for_league_id || Object.keys(live_data_dict).length === 0) {
            return undefined;
        }
        const data = squads_for_league_id;
        Object.keys(data).forEach(manager_id => {
            data[manager_id].squad.curr_gw_game = data[manager_id].squad.forEach((player, idx) => {
                const new_player_dict = {...player};
                new_player_dict.curr_gw_game = player.curr_gw_game.map(game => {
                    const d = {...game};
                    d.game_status = get_game_status(game.datetime);
                    if (game.team_a_name === player.team_name) {
                        d.opposition = game.team_h_name;
                    }
                    else {
                        d.opposition = game.team_a_name;
                    } 
                    return d;
                });
                data[manager_id].squad[idx] = {...new_player_dict};
            });
        });

        const league_squads_dict = {}
        for (const manager_id of Object.keys(data)) {
            const manager_data = {...data[manager_id]};
            manager_data.squad.forEach((player_info, i) => {
                manager_data.squad[i] = {...player_info}
                manager_data.squad[i].stats = live_data_dict[player_info.player_id].stats
                manager_data.squad[i].explain = live_data_dict[player_info.player_id].explain
            })
            manager_data.squad.forEach(player => {
                if (player.captain === true) {
                    manager_data.captain_status = league_table_dict[manager_id].chip_status === '3xc' ? '3xC' : '2xC';
                    const captains_games_all_finished = player.curr_gw_game.every(game => game.game_status === 'finished');
                    if (captains_games_all_finished) {
                        manager_data.captain_did_not_play = player.stats.minutes === 0;
                        if (manager_data.captain_did_not_play) {
                            manager_data.captain_status = league_table_dict[manager_id].chip_status === '3xc' ? '3xV' : '2xV';
                        }
                    }
                    else {
                        manager_data.captain_did_not_play = undefined;
                    }
                }
            });
            league_squads_dict[manager_id] = manager_data;
        }
        return league_squads_dict;
    }
    
    
    calcTotalPoints(manager_ids, league_table_dict, league_squads_dict, live_data_dict) {
        if(![manager_ids, league_table_dict, league_squads_dict, live_data_dict].every(v => v)) {
            return undefined;
        }
        manager_ids.forEach(manager_id => {
            let curr_points = 0;
            const chip_status = league_squads_dict[manager_id].chip_status;
            league_table_dict[manager_id].pts_deducted = -1 * league_squads_dict[manager_id].points_deducted;
            league_squads_dict[manager_id].squad.forEach(player => {                    
                const player_id = player.player_id;
                let points = live_data_dict[player_id].stats.total_points;
                if (player.captain === true && league_squads_dict[manager_id].captain_did_not_play !== true) {
                    points = chip_status === '3xc' ? points * 3 : points * 2;
                }
                else if (player.vice_captain === true && league_squads_dict[manager_id].captain_did_not_play) {
                    points = chip_status === '3xc' ? points * 3 : points * 2;
                }
                else if (player.on_bench === true && chip_status !== 'bboost') {
                    points = 0;
                }
                curr_points += points;
            });
            league_table_dict[manager_id].curr_pts = curr_points;
            league_table_dict[manager_id].total_pts =   league_table_dict[manager_id].prev_pts 
                                                            + curr_points
                                                            + league_table_dict[manager_id].sub_pts
                                                            + league_table_dict[manager_id].pts_deducted;                                                                                  
        });
        return league_table_dict;
    }
    
    add_did_play_property_to_squads(league_squads_dict) {
        for (const manager_id in league_squads_dict) {
            for (let i=0; i<league_squads_dict[manager_id].squad.length; i++) {
                const player_dict = {...league_squads_dict[manager_id].squad[i]};
                const did_not_play_array = player_dict.curr_gw_game.map(game_dict => {
                    if (Object.keys(game_dict).length === 0) {
                        return true;
                    }
                    else if(get_game_status(game_dict.datetime) === 'finished') {
                        return player_dict.stats.minutes === 0;
                    }
                    return false;
                })
                if ((did_not_play_array.every(x => x === true) && did_not_play_array.length === player_dict.curr_gw_game.length) 
                || did_not_play_array === []) {
                    player_dict.did_play = false;
                }
                else if (player_dict.stats.minutes > 0) {
                    player_dict.did_play = true;
                }
                else {
                    player_dict.did_play = undefined;
                }
                league_squads_dict[manager_id].squad[i] = player_dict;
            }
        }
        return league_squads_dict;
    }
    
    
    calcSubstitutesPoints(league_table_dict, league_squads_dict) {  
            
        function check_team_meets_squad_criteria(firstXI) {
            // "team can play in any formation providing that 1 goalkeeper, at least 3 defenders and at least 1 forward"
            const num_positions = { 'GK': 0, 'DEF': 0, 'MID': 0, 'FWD': 0};
            firstXI.forEach(player => num_positions[player.position]++);
            const verification = num_positions.GK === 1 && num_positions.DEF >= 3 && num_positions.FWD >= 1;
            return verification;
        }
    
        league_squads_dict = this.add_did_play_property_to_squads(league_squads_dict);
        for (const manager_id in league_squads_dict) {
            let firstXI = league_squads_dict[manager_id].squad.filter(x => x.on_bench === false);
            const subs  = league_squads_dict[manager_id].squad.filter(x => x.on_bench === true);
            const firstXI_player_ids_set = new Set();
            firstXI.forEach(x => firstXI_player_ids_set.add(x.player_id));
            let num_subs_points = 0;
            for (let i=0; i<firstXI.length; i++) {
                if (firstXI[i].did_play === false) {
                    for (let j=0; j<subs.length; j++) {
                        if (subs[j].did_play === true) {
                            const new_firstXI = [...firstXI];
                            if (firstXI[i].on_bench === true) {
                                continue;   // player in firstXI was a sub so must've been added already, so don't remove                  
                            }
                            if (firstXI_player_ids_set.has(subs[j].player_id)) {
                                continue;   // player_id already in player_ids_set => avoids adding the same sub multiple times
                            }
                            new_firstXI[i] = subs[j];
                            if(check_team_meets_squad_criteria(new_firstXI)) {
                                firstXI = [...new_firstXI];
                                firstXI_player_ids_set.clear();
                                firstXI.forEach(x => firstXI_player_ids_set.add(x.player_id));
                                num_subs_points += subs[j].stats.total_points;
                            }
                        }
                    }
                }
            }
            league_table_dict[manager_id].sub_pts = num_subs_points;
            league_squads_dict[manager_id].final_firstXI = firstXI;
        }
        return {
            league_table_dict: league_table_dict,
            league_squads_dict: league_squads_dict
        };
    }
    
    
    sort_manager_ids_by_total_pts(league_table_dict) {
        const manager_ids = Object.keys(league_table_dict);
        let manager_ids_points = [];
        for (const manager_id of manager_ids) {
            const d = {}
            d.manager_id = manager_id;
            d.total_points = league_table_dict[manager_id].total_pts; 
            manager_ids_points.push(d);
        }
        manager_ids_points = sort_LOD_by_key(manager_ids_points, 'total_points', false);
        const new_manager_ids = manager_ids_points.map(x => x.manager_id);
        return new_manager_ids
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    render() {
        return (
            <div className="page-container">
                <Switch>
                    <Route exact path="/leagues/:league_id">
                        <LeagueTable 
                            curr_gw={this.state.curr_gw}
                            league_id={this.state.league_id}
                            manager_ids={this.state.manager_ids}
                            league_table_dict={this.state.league_table_dict}
                            league_name={this.state.league_name}
                        />
                    </Route>
                    <Route path="/leagues/:league_id/:manager_id">
                        <Squad 
                            curr_gw={this.state.curr_gw}
                            league_id={this.state.league_id}
                            league_name={this.state.league_name}
                            squads_dict={this.state.league_squads_dict} 
                            league_table_dict={this.state.league_table_dict}
                            teams={this.props.teams}
                        />
                    </Route>
                </Switch>
            </div>
        );
    }
}
 
export default connect(mapStateToProps, mapDispatchToProps)(LeaguesContainer);