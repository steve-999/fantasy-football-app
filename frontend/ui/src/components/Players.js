import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PlayersForm from './PlayersForm';
import { query_string_to_query_dict, sort_LOD_by_key, debounce } from '../misc_functions';
import './Players.css';

import { connect } from 'react-redux';
import { fetchPlayers, set_show_players_form_val } from '../redux/actionCreators';

const mapStateToProps = state => {
    return {
        players_data: state.players_data,
        teams: state.team_ids_data,
        show_players_form: state.show_players_form,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPlayers: (num_players) => dispatch(fetchPlayers(num_players)),
        set_show_players_form_val: (val) => dispatch(set_show_players_form_val(val))
    };
}


const INITIAL_NUM_TOP_PLAYERS = 50;
const RERENDER_DELAY_MS = 50;
//const MOBILE_MAX_WIDTH = 575;

const keys_list = [
    { displayName: 'rank',          arrayKey: 'rank',           type: 'int',    sortDirection: 'asc'},
    { displayName: 'player',        arrayKey: 'web_name',       type: 'string', sortDirection: 'asc'}, 
    { displayName: 'team',          arrayKey: 'team_name',      type: 'string', sortDirection: 'asc'}, 
    { displayName: 'pos',           arrayKey: 'position',       type: 'string', sortDirection: 'asc'}, 
    { displayName: 'price',         arrayKey: 'price',          type: 'float',  sortDirection: 'desc'}, 
    { displayName: 'points',        arrayKey: 'total_points',   type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'G',             arrayKey: 'goals_scored',   type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'A',             arrayKey: 'assists',        type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'CS',            arrayKey: 'clean_sheets',   type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'GC',            arrayKey: 'goals_conceded', type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'bonus',         arrayKey: 'bonus',          type: 'int',    sortDirection: 'desc'}, 
    { displayName: 'form pts',      arrayKey: 'form_pts',       type: 'string', sortDirection: 'desc'}, 
    { displayName: 'ma(Pts,L)',     arrayKey: 'pts_ma_L',       type: 'float',  sortDirection: 'desc'}, 
    { displayName: 'ma(Pts,S)',     arrayKey: 'pts_ma_S',       type: 'float',  sortDirection: 'desc'},
    { displayName: 'difficulty',    arrayKey: 'difficulty',     type: 'string', sortDirection: 'desc'}, 
    { displayName: 'form mins',     arrayKey: 'form_mins',      type: 'string', sortDirection: 'desc'},
    { displayName: 'mins',          arrayKey: 'minutes',        type: 'int',    sortDirection: 'desc'},  
];

const excluded_columns = [
    {
        max_width: 350,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes', 'bonus', 'goals_conceded', 'clean_sheets', 'pts_ma_L']
    },
    {
        max_width: 370,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes', 'bonus', 'goals_conceded', 'clean_sheets']
    },
    {
        max_width: 395,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes', 'bonus', 'goals_conceded']
    }, 
    {
        max_width: 440,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes', 'bonus']
    }, 
    {
        max_width: 470,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes']
    }, 
    {
        max_width: 575,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S']
    },   
    {
        max_width: 650,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S', 'minutes']
    }, 
    {
        max_width: 710,
        cols: ['form_pts', 'form_mins', 'difficulty', 'pts_ma_S']
    },  
    {
        max_width: 810,
        cols: ['form_pts', 'form_mins', 'difficulty']
    },  
    {
        max_width: 1250,
        cols: ['form_pts', 'form_mins']
    },    
    {
        max_width: 99999,
        cols: []
    },
];

function get_filtered_keys_list(cols_list, excluded_cols) {
    const window_width = window.innerWidth;
    const excluded_cols_item = excluded_cols.find(x => x.max_width > window_width);
    const excluded_cols_list = excluded_cols_item.cols;
    const filtered_keys_list = cols_list.filter(x => !excluded_cols_list.includes(x.arrayKey));
    return filtered_keys_list
}

class Players extends Component {

    constructor(props) {
        super(props);
        this.state = {
            players: [],
            filteredPlayers: [],
            teams: [],
            sortByKey: 'total_points',
            selectedTeam: 'All',
            selectedPosition: 'All',
            topPlayersCheckboxChecked: true,
            numTopPlayers: INITIAL_NUM_TOP_PLAYERS,
            filtered_keys_list: undefined,
            window_width: undefined,
        };
        this.handleHeadingClick = this.handleHeadingClick.bind(this);
        this.getDefaultSortDirection = this.getDefaultSortDirection.bind(this);
        this.filter_and_sort_players_table = this.filter_and_sort_players_table.bind(this);
        this.handleQueryParams = this.handleQueryParams.bind(this);
        this.playersFormContainer_ref = React.createRef();
    }

    componentDidMount() {
        document.title = `Fantasy Football Stats | Players Statistics`;
        this._ismounted = true;
        this.handleQueryParams();
        this.props.fetchPlayers(25);
        this.props.fetchPlayers();
        const filtered_keys_list = get_filtered_keys_list(keys_list, excluded_columns);
        window.addEventListener('resize', debounce(this.handleResize, RERENDER_DELAY_MS));

        if (this.props.teams) {
            const team_names = this.props.teams.map(x => x.name);
            const short_team_name_lookup = {};
            this.props.teams.forEach(team_dict => short_team_name_lookup[team_dict.name] = team_dict.short_name);
            this.setState({
                teams: team_names,
                short_team_name_lookup: short_team_name_lookup,
                filtered_keys_list
            });
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.location.search !== this.props.location.search) {
            this.handleQueryParams();
        }

        if (prevProps.players_data !== this.props.players_data) {
            this.processPlayersData(this.props.players_data);
        }

        if (this.props.teams && prevProps.teams !== this.props.teams) {
            const team_names = this.props.teams.map(x => x.name);
            const short_team_name_lookup = {};
            this.props.teams.forEach(team_dict => short_team_name_lookup[team_dict.name] = team_dict.short_name);
            this.setState({
                teams: team_names,
                short_team_name_lookup: short_team_name_lookup
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', debounce(this.handleResize, RERENDER_DELAY_MS));
        this._ismounted = false;
    }

    handleResize = () => {
        if (!this._ismounted) 
            return;
        const filtered_keys_list = get_filtered_keys_list(keys_list, excluded_columns);
        this.setState({
            window_width: window.innerWidth,
            filtered_keys_list          
        });
        this.props.set_show_players_form_val(false);
    }

    processPlayersData(data) {
        const convertedData = data.map(x => {
            let a = {...x};
            for(let i=0; i<keys_list.length; i++) {
                const key = keys_list[i].arrayKey;
                if(keys_list[i].type === 'int') {
                    a[key] = parseInt(x[key]);
                }
                else if (keys_list[i].type === 'float') {
                    a[key] = parseFloat(x[key]);
                }  
                
                if(key.includes('ppm')) {
                    a[key] = parseFloat(x[key]).toFixed(4);
                }                     
            }
            return a;
        })
        this.setState({
            players: convertedData,
            filteredPlayers: convertedData
        }, () => {
            this.filter_and_sort_players_table();
        })
    }

    handleQueryParams() {
        const query_dict = query_string_to_query_dict(this.props.location.search)

        const state_update_obj = {}
        state_update_obj.sortByKey = 'sortByKey' in query_dict ? query_dict.sortByKey : 'total_points';
        state_update_obj.selectedTeam = 'team' in query_dict ? query_dict.team.replace('_', ' ') : 'All';
        state_update_obj.selectedPosition = 'position' in query_dict ? query_dict.position : 'All';
        state_update_obj.topPlayersCheckboxChecked = 'num_top_rank' in query_dict && query_dict.num_top_rank < 0 ? false : true;
        state_update_obj.numTopPlayers = 'num_top_rank' in query_dict ? query_dict.num_top_rank : INITIAL_NUM_TOP_PLAYERS;

        this.setState({
            sortByKey: state_update_obj.sortByKey,
            selectedTeam: state_update_obj.selectedTeam,
            selectedPosition: state_update_obj.selectedPosition,
            topPlayersCheckboxChecked: state_update_obj.topPlayersCheckboxChecked,
            numTopPlayers: state_update_obj.numTopPlayers
        }, () => {
            this.filter_and_sort_players_table();
        });
    }

    create_query_string(newSortByKey) {
        const position = this.state.selectedPosition;
        const team = this.state.selectedTeam.replace(' ', '_');
        const num_top_rank = this.state.topPlayersCheckboxChecked ? this.state.numTopPlayers : -1;
        return `&position=${position}&team=${team}&num_top_rank=${num_top_rank}&sortByKey=${newSortByKey}`;
    }

    handleHeadingClick(e) {
        e.preventDefault();
        const sortByKey = e.target.dataset.arraykey;   
        const newUrl = `/players?${this.create_query_string(sortByKey)}`;
        window.history.replaceState(null, '', newUrl);
        this.setState({
            sortByKey: sortByKey
        }, () => {
            this.filter_and_sort_players_table();
        });
    }

    getDefaultSortDirection(sortByKey) {
        const info = keys_list.find(x => x.arrayKey === sortByKey);
        return info.sortDirection;
    }

    filter_and_sort_players_table() {
        if (!['players', 'sortByKey'].every(key => this.state[key])) {
            return;
        }
        let tempPlayers = [...this.state.players];
        if(this.state.selectedTeam !== 'All') {        
            tempPlayers = tempPlayers.filter(obj => obj.team_name === this.state.selectedTeam);           
        }
        if(this.state.selectedPosition !== 'All') {
            tempPlayers = tempPlayers.filter(obj => obj.position === this.state.selectedPosition);          
        }
        const arrayKey = this.state.sortByKey;
        const sort_direction = this.getDefaultSortDirection(arrayKey) === 'asc' ? true : false;
        tempPlayers = sort_LOD_by_key(tempPlayers, arrayKey, sort_direction);
        this.setState({
            filteredPlayers: [...tempPlayers],
        }, () => this.forceUpdate());
    }

    handleAnimationEnd = (e) => {
        e.target.classList.remove('animation-slide-out');
    }

    handleClosePlayersFormClick = (e) => {
        const playersFormDivElement = this.playersFormContainer_ref.current; 
        if (playersFormDivElement.classList.value.includes('animation-slide-in')) {
            playersFormDivElement.classList.remove('animation-slide-in');
            playersFormDivElement.classList.add('animation-slide-out');
            this.props.set_show_players_form_val(false); 
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getPlayersTableHeadingsRow() {
        if (!this.state.filtered_keys_list)
            return null;
        const row = this.state.filtered_keys_list.map(x => {
            return(
                <th 
                    key={x.displayName} 
                    className={this.state.sortByKey === x.arrayKey ? 'sortByKey' : 'normalHeadingCell'} 
                    data-arraykey={x.arrayKey}
                    onClick={this.handleHeadingClick}
                    >{ x.displayName }
                </th>
            );
        });
        return row;
    }

    getPlayersTableRow(data, idx) {
        if (!this.state.filtered_keys_list)
            return null;
        const row = this.state.filtered_keys_list.map(x => {
            let val;
            if (x.arrayKey === 'rank') {
                val = idx;
            }
            else {
                val = data[x.arrayKey];
            }
            if (x.arrayKey === 'web_name') {
                val = <Link to={`/players/${data.web_name_id.replace(' ', '_')}`}>{data.web_name}</Link>;
                return <td key={x.arrayKey} className="bold-td">{ val }</td>;
            }
            else if (x.arrayKey === 'team_name') {
                val = <Link to={`/teams/${data.team_name.replace(' ', '_')}`}>{this.state.short_team_name_lookup[data.team_name]}</Link>;
                return <td key={x.arrayKey} className="bold-td short-team-name">{ val }</td>;
            }
            else {
                return <td key={x.arrayKey}>{ val }</td>;
            }
        });
        return row;
    }

    createPlayersTableRows() {
        let Nplayers = this.state.topPlayersCheckboxChecked ? this.state.numTopPlayers : this.state.players.length;
        const rows = this.state.filteredPlayers.slice(0, Nplayers).map((data, i) => {
            return(
                <tr key={i}>
                    { this.getPlayersTableRow(data, i+1) }
                </tr>
            );
        });
        return rows;
    }

    render() {
        return (
            <div className="players-page-container" onClick={this.handleClosePlayersFormClick}>
                <div 
                    className="players-form-container"
                    onAnimationEnd={this.handleAnimationEnd}
                    ref={this.playersFormContainer_ref}
                    >
                    <PlayersForm 
                        teams={this.state.teams} 
                        selectedTeam={this.state.selectedTeam}
                        selectedPosition={this.state.selectedPosition}
                        updateFormState={this.updateFormState}
                        initialNumTopPlayers={INITIAL_NUM_TOP_PLAYERS}
                        sortByKey={this.state.sortByKey}
                        playersFormRef={this.playersFormContainer_ref}
                        />
                </div> 
                <div className="players-table-container">
                    <table className="styled-table">
                        <thead><tr>{ this.getPlayersTableHeadingsRow() }</tr></thead>
                        <tbody>
                            { this.state.short_team_name_lookup && this.createPlayersTableRows() }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Players);


