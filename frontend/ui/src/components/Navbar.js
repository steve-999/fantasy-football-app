import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggle_show_players_form } from '../redux/actionCreators';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const LEAGUE_ID = '1437093';
const SHOW_HAMBURGER_BARS_MAX_WIDTH = 575;

const Navbar = (props) => {
    const show_players_form = useSelector(state => state.show_players_form);
    const dispatch = useDispatch();

    let page_name = 'Players';
    let show_hamburger_bars = false;
    const path = props.location.pathname;
    if (path.match(/^\/players(\/)?$/)) {
        page_name = 'Players';
        show_hamburger_bars = window.innerWidth < SHOW_HAMBURGER_BARS_MAX_WIDTH ? true : false;
    }
    else if (path.includes('leagues')) {
        page_name = 'Leagues';
    }
    else if (path.includes('teams')) {
        page_name = 'Teams';
    }
    else if (path.includes('fixtures')) {
        page_name = 'Fixtures';
    }
    else if (path.includes('glossary')) {
        page_name = 'Glossary';
    }

    const handleToggleShowPlayersForm = () => {
        const playersFormDivElement = document.querySelector('.players-form-container'); 
        if (show_players_form && playersFormDivElement) {
            playersFormDivElement.classList.remove('animation-slide-in');
            playersFormDivElement.classList.add('animation-slide-out');
        }
        else {
            playersFormDivElement.classList.remove('animation-slide-out');
            playersFormDivElement.classList.add('animation-slide-in');
        }
        dispatch(toggle_show_players_form());
    };

    return (
        <nav className="nav-container">
            <Link to="/" className="logo">MERN Stack Fantasy Football App</Link>
            <ul className="nav-ul">
                <li className={`nav-li ${page_name === 'Players' ? ' active-tab': ''}`}>
                    <NavLink to="/players" activeClassName="active-class">Players</NavLink>
                </li>
                <li className={`nav-li ${page_name === 'Leagues' ? ' active-tab': ''}`}>
                    <NavLink to={`/leagues/${LEAGUE_ID}`}  activeClassName="active-class">Leagues</NavLink>
                </li>
                <li className={`nav-li ${page_name === 'Teams' ? ' active-tab': ''}`}>
                    <NavLink to="/teams" activeClassName="active-class">PL</NavLink>
                </li>
                <li className={`nav-li ${page_name === 'Fixtures' ? ' active-tab': ''}`}>
                    <NavLink to="/fixtures" activeClassName="active-class">Fixtures</NavLink>
                </li>
            </ul>
            <FontAwesomeIcon 
                className="menu-hamburger" 
                icon={faBars} 
                onClick={handleToggleShowPlayersForm} 
                style={{display: show_hamburger_bars ? 'inline' : 'none'}}    
            />
            <Link to='/glossary'>
                <FontAwesomeIcon className="help-button" icon={faInfoCircle} />
            </Link>
        </nav>
    );
  }
   
  export default withRouter(Navbar);