import React, { Component } from 'react';
import './Fixtures.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetch_fixture_difficulty, fetch_team_ids } from '../redux/actionCreators';

const DEFAULT_TRANSPARENCY = 0.65;
const MAX_GW_COLUMNS = 10;

const mapStateToProps = state => {
    return {
        fixture_difficulty_data: state.fixture_difficulty_data,
        teams_data: state.team_ids_data
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetch_fixture_difficulty: () => dispatch(fetch_fixture_difficulty()),
        fetch_team_ids: () => dispatch(fetch_team_ids())
    };
}


function unique(arr) {
    const set_var = new Set();
    arr.map(x => set_var.add(x));
    return [...set_var].sort();
}


function sort_unique_gws(arr) {
    const set_var = new Set();
    arr.map(x => set_var.add(x));
    return [...set_var].sort((a, b) => {
        if (parseInt(a) < parseInt(b)) return -1;
        if (parseInt(a) > parseInt(b)) return 1;
        return 0;
    });;
}


function get_colour_gradient_rgb(x, a=DEFAULT_TRANSPARENCY) {
    let r, g, b;
    if (x >= 0 && x <= 5) {
        r = Math.round((x / 5) * 255);
        g = 255;
        b = 0;
    }
    else {
        r = 255;
        g = Math.round(255 * (1 - ((x - 5) / 5)));
        b = 0;
    }
    return `rgb(${r}, ${g}, ${b}, ${a})`;
}

class Fixtures extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fixture_list: [],
            fixtures_dict: {},
            gws_remaining: [],
            teams: [],
            teams_info: [],
            Nmax_games: 0
        };
    }
    
    componentDidMount() {
        document.title = 'Fantasy Football Stats | Fixtures';
        this.props.fetch_fixture_difficulty();
        this.props.fetch_team_ids();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.fixture_difficulty_data && prevProps.fixture_difficulty_data !== this.props.fixture_difficulty_data) {
            this.process_fixture_difficulty_data(this.props.fixture_difficulty_data);
        }

        if (this.props.teams_data && prevProps.teams_data !== this.props.teams_data) {
            this.process_teams_data(this.props.teams_data);
        }
    }

    process_fixture_difficulty_data(fixtures) {
        const all_gws_list = fixtures
                                .map(x => x.datetime > (new Date()).toISOString() ? x.gw : false)
                                .filter(x => x !== false);                
        const gws_remaining = sort_unique_gws(all_gws_list);

        const home_teams = fixtures.map(x => x.team_h_name);
        const away_teams = fixtures.map(x => x.team_a_name);
        const teams = unique(home_teams.concat(away_teams));

        const fixtures_dict = {};
        teams.forEach(team => {
            fixtures_dict[team] = {};
            gws_remaining.forEach(gw => fixtures_dict[team][gw] = []);
        });
        let Nmax_games = 0;
        fixtures.forEach(game => {
            if (game.datetime > new Date().toISOString()) {              
                const home_team = {}
                home_team.team = game.team_h_name;
                home_team.opponent = game.team_a_name;
                home_team.difficulty_defence = game.difficulty_GF_A;
                home_team.difficulty_attack = game.difficulty_GA_A;
                home_team.difficulty_defence_color = get_colour_gradient_rgb(game.difficulty_GF_A);
                home_team.difficulty_attack_color = get_colour_gradient_rgb(game.difficulty_GA_A);
                home_team.game_id = game.game_id;
                home_team.home_away = 'H';
                const away_team = {}
                away_team.team = game.team_a_name;
                away_team.opponent = game.team_h_name;
                away_team.difficulty_defence = game.difficulty_GF_H;
                away_team.difficulty_attack = game.difficulty_GA_H;
                away_team.difficulty_defence_color = get_colour_gradient_rgb(game.difficulty_GF_H);
                away_team.difficulty_attack_color = get_colour_gradient_rgb(game.difficulty_GA_H);
                away_team.home_away = 'A';
                away_team.game_id = game.game_id;
                fixtures_dict[game.team_h_name][game.gw].push(home_team);
                fixtures_dict[game.team_a_name][game.gw].push(away_team);
                Nmax_games = Math.max(Nmax_games, fixtures_dict[game.team_h_name][game.gw].length, 
                                                  fixtures_dict[game.team_a_name][game.gw].length);
            }
        });

        this.setState({
            fixture_list: fixtures,
            fixtures_dict: fixtures_dict,
            gws_remaining: gws_remaining.slice(0, MAX_GW_COLUMNS),
            teams: teams,
            Nmax_games: Nmax_games
        });
    }

    process_teams_data(teams_info) {
        const short_team_name_lookup = {};
        teams_info.forEach(team => {
            short_team_name_lookup[team.name] = team.short_name;
        });

        this.setState({ 
            teams_info: teams_info,
            short_team_name_lookup: short_team_name_lookup
        })
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    getGameJSX(key, short_team_name, suffix, difficulty_score, backgroundColor, div_height) {
        return (
            <div key={key} className="table-cell-div" style={{ backgroundColor: `${backgroundColor}`, height: `${div_height}px`}}>
                <div className="table-cell-inner-div">
                    <span className="short_team_name">{ short_team_name }</span> 
                    <span className="game_suffix"> { suffix }</span>
                    <span className="game_suffix"> {difficulty_score}</span>
                </div>
            </div>
        );
    }

    getTableRows(attack_defence) {
        const rows = this.state.teams.map(team => {
            const row = this.state.gws_remaining.map(gw => {
                let key;
                let short_team_name;
                let suffix;
                let backgroundColor;
                let difficulty_score;
                let div_height;
                const row_height = this.state.Nmax_games === 1 ? 32 : 25 * this.state.Nmax_games;
                let JSX;
                if (this.state.short_team_name_lookup === undefined) {
                    key = 0;
                    short_team_name = 'error';
                    suffix = '';
                    difficulty_score = '';
                    backgroundColor = 'black';
                    div_height = row_height;
                    JSX = this.getGameJSX(key, short_team_name, suffix, difficulty_score, backgroundColor, div_height);
                }
                else if (this.state.fixtures_dict[team][gw].length === 0) {
                    key = 0;
                    short_team_name = '-';
                    suffix = '';
                    difficulty_score = '';
                    backgroundColor = 'lightgrey';
                    div_height = row_height;
                    JSX = this.getGameJSX(key, short_team_name, suffix, difficulty_score, backgroundColor, div_height);
                }
                else if(this.state.fixtures_dict[team][gw].length >= 1) {
                    const Ngames = this.state.fixtures_dict[team][gw].length;
                    JSX = [];
                    for (let i=0; i<Ngames; i++) {
                        const game = this.state.fixtures_dict[team][gw][i];
                        key = i;
                        short_team_name = this.state.short_team_name_lookup[game.opponent];
                        suffix = `(${game.home_away})`;
                        difficulty_score = game[`difficulty_${attack_defence}`];
                        backgroundColor = game[`difficulty_${attack_defence}_color`];
                        div_height = Math.round(row_height / Ngames);

                        const temp = this.getGameJSX(key, short_team_name, suffix, difficulty_score, backgroundColor, div_height);
                        JSX.push(temp);
                    }
                }
                return (
                    <td key={ gw } style={{ backgroundColor: 'white'}}>
                        { JSX }
                    </td>
                );
            });
            row.unshift(
                <td key={team} className="team_column"><Link to={`/teams/${team.replace(' ', '_')}`}>{ team }</Link></td>);  
            return (
                <tr key={team}>{ row }</tr>
            )
        });
        return rows;
    }

    create_fixtures_table(attack_defence) {
        return (
            <table className="styled-table">
                <thead>
                    <tr key="headings_row">
                        <th key="team">Team</th>
                        { this.state.fixture_list.length > 0 && this.state.gws_remaining.map(gw => <th key={gw}>GW{ gw }</th>) }
                    </tr>
                </thead>
                <tbody>
                    { this.state.fixture_list.length > 0 && this.getTableRows(attack_defence) }  
                </tbody>
            </table>
        );
    }

    render() {
        if (this.state.fixture_list.length > 0) {
            return (
                <div className="fixtures_tables_container">
                    <div className="fixtures_table">
                        <h3>Fixture Difficulty for Midfielders &amp; Forwards</h3>
                        { this.create_fixtures_table('attack') }
                    </div>                    
                    <div className="fixtures_table">
                        <h3>Fixture Difficulty for Goalkeepers &amp; Defenders</h3>
                        { this.create_fixtures_table('defence') }
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="fixtures_tables_container">
                    <div className="fixtures_table no_fixtures_remaining">
                        <h3>There are no fixtures left this season.</h3>
                    </div>
                </div>
            );
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Fixtures);


