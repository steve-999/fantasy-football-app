import * as ActionTypes from './actionTypes';

const initialState = {
    loading_players: false,
    players_data: [],
    loading_fixture_difficulty: false,
    fixture_difficulty_data: [],
    loading_fixture_list: false,
    fixture_list_data: [],
    loading_team_ids: false,
    team_ids_data: [],
    loading_teams_stats: false,
    teams_stats: undefined,
    loading_text_fixture_list: false,
    team_fixture_list: undefined,
    loading_squad_for_manager_id: false,
    squad_for_manager_id_data: [],
    loading_manager_curr_season: false,
    manager_curr_season_data: [],
    loading_player_season_stats: false,
    player_season_stats_data: undefined,
    loading_player_gw_stats: false,
    player_gw_stats_data: undefined,
    loading_league_info: false,
    league_info_data: undefined,
    loading_league_points_for_gw: false,
    league_points_for_gw_data: undefined,
    loading_live_data: false,
    live_data: undefined,
    loading_squads_for_league_id: false,
    squads_for_league_id_data: undefined,
    loading_curr_gw: false,
    curr_gw: undefined,
    show_players_form: false,
}

export const rootReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.LOADING_PLAYERS:
            return { ...state, loading_players: true};

        case ActionTypes.ADD_PLAYERS:
            return { ...state, loading_players: false, players_data: action.payload};
            
        case ActionTypes.LOADING_FIXTURE_DIFFICULTY:
            return { ...state, loading_fixture_difficulty: true};

        case ActionTypes.ADD_FIXTURE_DIFFICULTY:
            return { ...state, loading_fixture_difficulty: false, fixture_difficulty_data: action.payload};

        case ActionTypes.LOADING_FIXTURE_LIST:
            return { ...state, loading_fixture_list: true};

        case ActionTypes.ADD_FIXTURE_LIST:
                return { ...state, loading_fixture_list: false, fixture_list_data: action.payload};

        case ActionTypes.LOADING_TEAM_IDS:
            return { ...state, loading_team_ids: true};

        case ActionTypes.ADD_TEAM_IDS:
            return { ...state, loading_team_ids: false, team_ids_data: action.payload};

        case ActionTypes.LOADING_TEAMS_STATS:
            return { ...state, loading_teams_stats: true};

        case ActionTypes.ADD_TEAMS_STATS:
            return { ...state, loading_teams_stats: false, teams_stats: action.payload};

        case ActionTypes.LOADING_TEAM_FIXTURE_LIST:
            return { ...state, loading_team_fixture_list: true};

        case ActionTypes.ADD_TEAM_FIXTURE_LIST:
            return { ...state, loading_team_fixture_list: false, team_fixture_list: action.payload};

        case ActionTypes.LOADING_SQUAD_FOR_MANAGER_ID:
            return { ...state, loading_squad_for_manager_id: true};

        case ActionTypes.ADD_SQUAD_FOR_MANAGER_ID:
            return { ...state, loading_squad_for_manager_id: false, squad_for_manager_id_data: action.payload};

        case ActionTypes.LOADING_MANAGER_CURR_SEASON:
            return { ...state, loading_manager_curr_season: true};

        case ActionTypes.ADD_MANAGER_CURR_SEASON:
            return { ...state, loading_manager_curr_season: false, manager_curr_season_data: action.payload};

        case ActionTypes.LOADING_PLAYER_SEASON_STATS:
            return { ...state, loading_player_season_stats: true};
        
        case ActionTypes.ADD_PLAYER_SEASON_STATS:
            return { ...state, loading_player_season_stats: false, player_season_stats_data: action.payload};

        case ActionTypes.LOADING_PLAYER_GW_STATS:
            return { ...state, loading_player_gw_stats: true};

        case ActionTypes.ADD_PLAYER_GW_STATS:
            return { ...state, loading_player_gw_stats: false, player_gw_stats_data: action.payload};

        case ActionTypes.LOADING_LEAGUE_INFO:
            return { ...state, loading_league_info: true};

        case ActionTypes.ADD_LEAGUE_INFO:
            return { ...state, loading_league_info: false, league_info_data: action.payload};
            
        case ActionTypes.LOADING_LEAGUE_POINTS_FOR_GW:
            return { ...state, loading_league_points_for_gw: true};

        case ActionTypes.ADD_LEAGUE_POINTS_FOR_GW:
            return { ...state, loading_league_points_for_gw: false, league_points_for_gw_data: action.payload};
            
        case ActionTypes.LOADING_LIVE_DATA:
            return { ...state, loading_live_data: true};

        case ActionTypes.ADD_LIVE_DATA:
            return { ...state, loading_live_data: false, live_data: action.payload};

        case ActionTypes.LOADING_SQUADS_FOR_LEAGUE_ID:
            return { ...state, loading_squads_for_league_id: true}; 

        case ActionTypes.ADD_SQUADS_FOR_LEAGUE_ID:
            return { ...state, loading_squads_for_league_id: false, squads_for_league_id_data: action.payload}; 
            
        case ActionTypes.LOADING_CURR_GW:
            return { ...state, loading_curr_gw: true}; 

        case ActionTypes.ADD_CURR_GW:
            return { ...state, loading_curr_gw: false, curr_gw: action.payload};  
            
        case ActionTypes.TOGGLE_SHOW_PLAYERS_FORM:
            return { ...state, show_players_form: !state.show_players_form};  

        case ActionTypes.SET_SHOW_PLAYERS_FORM_VAL:
            return { ...state, show_players_form: action.payload};

        default:
            return state;
    }
}