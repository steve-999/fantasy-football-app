import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { fetch_team_fixture_list } from '../redux/actionCreators';

import './Teams.css';

const headings = ['Date', 'GW', 'Team', 'H/A', 'GF', 'GA'];
const keys_list = ['datetime', 'gw', 'team_name', 'home_away', 'GF', 'GA'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOBILE_WIDTH_MAT = 700;

const Teams = (props) => {
    const [team_name, set_team_name] = useState();
    const [team_code, set_team_code] = useState();
    const fixture_list = useSelector(state => state.team_fixture_list);
    const dispatch = useDispatch();

    useEffect(() => {
        const team_name_val = props.match.params.team_name;
        document.title = `Fantasy Football Stats | ${team_name_val.replace('_', ' ')} Fixtures`;
        if(team_name_val) {
            set_team_name(team_name_val);
            dispatch(fetch_team_fixture_list(team_name_val));
        }           
    }, [dispatch, props.match.params.team_name]);

    useEffect(() => {
        if (props.team_ids && team_name) {
            const team_id_obj = props.team_ids.find(team_id_dict => team_id_dict.name === team_name.replace('_', ' '));
            if(team_id_obj)
                set_team_code(team_id_obj.code);
        }
    }, [team_name, props.team_ids]);

    const get_fixture_lists = () => {
        if (!fixture_list) {
            return null;
        }
        else if (window.innerWidth > MOBILE_WIDTH_MAT) {
            return (
                <div className="fixture-tables-container">
                    <FixturesTable fixture_list={fixture_list.slice(0, 19)} />
                    <FixturesTable fixture_list={fixture_list.slice(19, fixture_list.length)} />
                </div>
            );
        }
        else {
            return (
                <div className="fixture-tables-container">
                    <FixturesTable fixture_list={fixture_list} />
                </div>
            );
        }
    }

    return (  
        <div className="teams-container">
            <h3>{ team_code && <img src={`https://resources.premierleague.com/premierleague/badges/50/t${team_code}.png`} alt={team_name} />}
                { team_name && team_name.replace('_', ' ') } fixtures
            </h3>
                { get_fixture_lists() } 
        </div>
    );
}
 

const FixturesTable = ({fixture_list}) => {
    function get_headings_row() {
        const row_cells = headings.map(key => <th key={key}>{ key }</th>);
        return <tr>{row_cells}</tr>;
    }

    function get_table_rows() {
        const table_rows = fixture_list.map(fixture => {
            const row_cells = keys_list.map(key => {
                let val = fixture[key];
                if (key === 'datetime') {
                    const dt = new Date(fixture.datetime);
                    val = `${dt.getDate().toString().padStart(2, '0')} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
                }
                else if (key === 'team_name') {
                    val = <Link to={`/teams/${fixture.team_name.replace(' ', '_')}`}>{fixture.team_name}</Link>
                }
                else if (key === 'home_away') {
                    val = fixture.home_away.toUpperCase();
                }
                return <td key={key}>{ val }</td>; 
            });
            return <tr key={fixture.game_id}>{ row_cells }</tr>
        });
        return table_rows;
    }

    return (  
        <div className="fixture-list-container">
            <table className="styled-table">
                <thead>
                    { get_headings_row() }
                </thead>
                <tbody>
                    { fixture_list && get_table_rows() }
                </tbody>
            </table>
        </div>
    );
}


export default withRouter(Teams);