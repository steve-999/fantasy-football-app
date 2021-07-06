import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/configureStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Players from './components/Players';
import PlayerInfo from './components/PlayerInfo';
import TeamsContainer from './components/TeamsContainer';
import Fixtures from './components/Fixtures';
import FileNotFound from './components/FileNotFound';
import LeaguesContainer from './components/LeaguesContainer';
import Glossary from './components/Glossary';
import Test from './components/Test';
import { debounce } from './misc_functions';
import './App.css';

import { fetch_curr_gw, fetch_team_ids } from './redux/actionCreators';

const RERENDER_DELAY_MS = 250;

store.dispatch(fetch_curr_gw());
store.dispatch(fetch_team_ids());


function App() {
  const [window_width, set_window_width] = useState();
  useEffect(() => {
    window.addEventListener('resize', debounce(handleResize, RERENDER_DELAY_MS));
    return () => window.removeEventListener('resize', debounce(handleResize, RERENDER_DELAY_MS));
  }, []);
  const handleResize = () => set_window_width(window.innerWidth);
  useEffect(() => console.log('window_width', window_width), [window_width]);

  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
            <Navbar />
            <main>
              <Switch>
                  <Route exact path="/">
                    <Redirect to="/players" />
                  </Route>
                  <Route path="/players/:web_name_id"           component={PlayerInfo} />
                  <Route path="/players"                        component={Players} />
                  <Route path="/teams/:team_name?"              component={TeamsContainer} />
                  <Route path="/fixtures"                       component={Fixtures} />
                  <Route path="/leagues/:league_id"             component={LeaguesContainer} />
                  <Route path="/glossary"                       component={Glossary} />
                  <Route path="/test"                           component={Test} />
                  <Route path="*"                               component={FileNotFound} />
              </Switch>
            </main>      
            <Footer />
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
