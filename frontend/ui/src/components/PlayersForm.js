import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { set_show_players_form_val } from '../redux/actionCreators';
import './PlayersForm.css';

const NUM_TOP_PLAYERS_OPTIONS = ['25', '50', '100', '200', 'All'];

const mapStateToProps = state => {
    return {
        show_players_form: state.show_players_form,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        set_show_players_form_val: (val) => dispatch(set_show_players_form_val(val))
    };
}

class PlayersForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedTeam: props.selectedTeam,
            selectedPosition: props.selectedTeam,
            topPlayersCheckboxChecked: true,
            numTopPlayers: props.initialNumTopPlayers,
            sortByKey: props.sortByKey
        }

        this.handleClickTeam = this.handleClickTeam.bind(this);
        this.handleClickPosition = this.handleClickPosition.bind(this);
        this.handleTopPlayersSelectChange = this.handleTopPlayersSelectChange.bind(this);
    }

    componentDidMount() {
        this.setState({
            selectedTeam: this.props.selectedTeam,
            selectedPosition: this.props.selectedTeam,
        });      
    }

    componentDidUpdate(prevProps) {
        if(prevProps.selectedTeam !== this.props.selectedTeam
        || prevProps.selectedPosition !== this.props.selectedPosition
        || prevProps.sortByKey !== this.props.sortByKey) {
            this.setState({ 
                selectedTeam: this.props.selectedTeam,
                selectedPosition: this.props.selectedPosition,
                sortByKey: this.props.sortByKey
            });      
        }
    }

    handleClickTeam(e) {
        this.dismissPlayersForm();
        this.setState({
            selectedTeam: e.target.innerText
        });
    }


    handleClickPosition(e) {
        this.dismissPlayersForm();
        this.setState({
            selectedPosition: e.target.innerText
        });
    }

    handleTopPlayersSelectChange(e) {
        this.setState({
            numTopPlayers: e.target.value
        }, () => {
            this.dismissPlayersForm();
            const url = this.create_query_string(null, null);
            this.props.history.push(`/players?${url}`);
        });
    }

    dismissPlayersForm() {
        const playersFormDivElement = this.props.playersFormRef.current;
        if (this.props.show_players_form) {
            playersFormDivElement.classList = 
                        `${playersFormDivElement.classList.value.replace('animation-slide-in', '')} animation-slide-out`; 
        }
        this.props.set_show_players_form_val(false);
    }

    create_query_string(key, value) {
        const position = `position=${ key === 'position' ? value : this.state.selectedPosition}`;
        const team = `team=${ key === 'team' ? value.replace(' ', '_') : this.state.selectedTeam.replace(' ', '_')}`;
        const num_top_rank = `num_top_rank=${ this.state.topPlayersCheckboxChecked ? this.state.numTopPlayers : -1}`;
        const sort_by_key = `sortByKey=${this.state.sortByKey}`;
        return `&${position}&${team}&${num_top_rank}&${sort_by_key}`;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    get_positions_JSX() {
        const JSX = ['All', 'GK', 'DEF', 'MID', 'FWD'].map(position => {
            const bgColor = position === this.state.selectedPosition ? 'crimson' : 'DarkSlateBlue';
            return <li 
                    className="positions-li" 
                    key={position}
                    name={position}
                    onClick={this.handleClickPosition}
                    style={{backgroundColor: bgColor}}
                    >
                        <NavLink to={`/players?${this.create_query_string('position', position)}`}>{ position }</NavLink>
                    </li>;
        });
        return <ul className="positions-ul">{ JSX }</ul>
    }

    get_teams_JSX() {
        const teams_list = ['All', ...this.props.teams];
        const JSX = teams_list.map(team => {
            const bgColor = team === this.state.selectedTeam ? 'crimson' : 'DarkSlateBlue';
            return <li 
                    className="teams-li" 
                    key={team}
                    name={team}
                    onClick={this.handleClickTeam}
                    style={{backgroundColor: bgColor}}
                    >
                        <NavLink to={`/players?${this.create_query_string('team', team)}`}>{ team }</NavLink>
                    </li>;
        });
        return <ul className="teams-ul">{ JSX }</ul>
    }

    render() {
        return (
            <form className="players-form">
                <label htmlFor="select-position">Position</label>
                <div className="positions-list-container">
                    { this.get_positions_JSX() }
                </div>

                <label htmlFor="select-teams">Team</label>
                <div className="teams-list-container">
                    { this.get_teams_JSX() }
                </div>

                <div className="num-top-players-table">
                        <div className="textbox-top-players-row">
                            <span className="num-top-players-1st-col"> 
                                <label className="label-num-top-players" htmlFor="textbox-num-top-players">Top ranked:</label>
                            </span>
                            <span className="num-top-players-2nd-col">
                                <select className="num-top-players-select" name="num-top-players-select"
                                        onChange={this.handleTopPlayersSelectChange}
                                        disabled={!this.state.topPlayersCheckboxChecked}
                                        defaultValue="50"
                                >
                                    { 
                                        NUM_TOP_PLAYERS_OPTIONS.map(num => {
                                            switch(num) {
                                                case '50':
                                                    return <option key={num} value={num}>{num}</option>;
                                                case 'All':
                                                    return <option key={num} value={'9999'}>{num}</option>;
                                                default:
                                                    return <option key={num} value={num}>{num}</option>;
                                            }
                                        }) 
                                    }
                                </select>
                            </span>
                        </div>
                    </div>
            </form>
        );
    }

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlayersForm));




