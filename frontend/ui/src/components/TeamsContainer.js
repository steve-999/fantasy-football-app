import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import TeamsStatsTable from './TeamsStatsTable';
import Teams from './Teams';

import { connect } from 'react-redux';
import { fetch_teams_stats } from '../redux/actionCreators';

const mapStateToProps = state => {
    return {
        team_ids: state.team_ids_data,
        teams_stats: state.teams_stats,
        team_fixture_list: state.team_fixture_list
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetch_teams_stats: () => dispatch(fetch_teams_stats()),
    };
}


class TeamsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            team_name: undefined,
        }
    }

    componentDidMount() {
        const team_name = this.props.match.params.team_name;
        if (team_name !== undefined) {
            this.setState({
                team_name: team_name.replace('_', ' ')
            });
        }
        this.props.fetch_teams_stats();
    }

    render() {
        return (
            <div className="teams-page-container">
                <Switch>
                    <Route path="/teams/:team_name">
                        <Teams team_ids={this.props.team_ids} />
                    </Route>
                    <Route path="/teams">
                        <TeamsStatsTable teams_stats={this.props.teams_stats} />
                    </Route>
                </Switch>
            </div>
        );
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(TeamsContainer);