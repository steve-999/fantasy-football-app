import * as ActionTypes from './actionTypes';
import { API_BASE_URL } from '../environment/environment'

export const fetchPlayers = (num_players=9999) => {
    return async dispatch => {
        dispatch({  type: ActionTypes.LOADING_PLAYERS });
        const url = `${API_BASE_URL}/players/num_players=${num_players}`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_PLAYERS, payload: data });
        }
        catch(err) {
            console.log('Error:', err);
        }
    }
}


export const fetch_fixture_difficulty = () => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_FIXTURE_DIFFICULTY });
        const url = `${API_BASE_URL}/fixture_difficulty/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_FIXTURE_DIFFICULTY, payload: data })            
        }
        catch(err) {
            console.log('Error:', err);
        }
    }
}


export const fetch_fixture_list = () => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_FIXTURE_LIST });
        const url = `${API_BASE_URL}/fixture_list/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_FIXTURE_LIST, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }
}


export const fetch_team_ids = () => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_TEAM_IDS });
        const url = `${API_BASE_URL}/team_ids/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_TEAM_IDS, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }
}


export const fetch_teams_stats = () => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_TEAMS_STATS });
        const url = `${API_BASE_URL}/teams_stats/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_TEAMS_STATS, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }
}

export const fetch_team_fixture_list = (team_name) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_TEAM_FIXTURE_LIST });
        const url = `${API_BASE_URL}/team_fixture_lists/${team_name}`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_TEAM_FIXTURE_LIST, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }
}

export const fetch_squad_for_manager_id = (manager_id, curr_gw) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_SQUAD_FOR_MANAGER_ID });
        const url = `${API_BASE_URL}/squad_for_manager_id/${manager_id}/${curr_gw}/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_SQUAD_FOR_MANAGER_ID, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_manager_curr_season = (manager_id) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_MANAGER_CURR_SEASON });
        const url = `${API_BASE_URL}/manager_curr_season/${manager_id}/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_MANAGER_CURR_SEASON, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_player_season_stats = (web_name_id) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_PLAYER_SEASON_STATS });
        const url = `${API_BASE_URL}/player_season_stats/${web_name_id}/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_PLAYER_SEASON_STATS, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_player_gw_stats = (web_name_id) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_PLAYER_GW_STATS });
        const url = `${API_BASE_URL}/player_gw_stats/${web_name_id}/`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_PLAYER_GW_STATS, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_league_info = (league_id) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_LEAGUE_INFO });  
        const url = `${API_BASE_URL}/leagues/${league_id}/`;  
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_LEAGUE_INFO, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_league_points_for_gw = (league_id, curr_gw) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_LEAGUE_POINTS_FOR_GW });  
        const url = `${API_BASE_URL}/league_points_for_gw/${league_id}/${parseInt(curr_gw)}/`; 
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_LEAGUE_POINTS_FOR_GW, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_live_data = curr_gw => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_LIVE_DATA });  
        const url = `${API_BASE_URL}/live_data/${curr_gw}/`; 
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_LIVE_DATA, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_squads_for_league_id = (league_id, curr_gw) => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_SQUADS_FOR_LEAGUE_ID });  
        const url = `${API_BASE_URL}/squads_for_league_id/${league_id}/${curr_gw}`; 
        console.log('fetch_squads_for_league_id > url', url)
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_SQUADS_FOR_LEAGUE_ID, payload: data })            
        }
        catch(err) {
            console.log('Error:', err)
        }
    }    
}


export const fetch_curr_gw = () => {
    return async dispatch => {
        dispatch({ type: ActionTypes.LOADING_CURR_GW });  
        const url = `${API_BASE_URL}/current_gw`; 
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            dispatch({ type: ActionTypes.ADD_CURR_GW, payload: data.curr_gw });           
        }
        catch(err) {
            console.log('Error:', err);
        }
    } 
}


export const toggle_show_players_form = () =>  {
    return { type: ActionTypes.TOGGLE_SHOW_PLAYERS_FORM };
}


export const set_show_players_form_val = (val) => {
    return { type: ActionTypes.SET_SHOW_PLAYERS_FORM_VAL, payload: val};
}

