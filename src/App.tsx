import React from 'react';
import { Route, Switch } from 'react-router-dom';
import  Header from './application/view/Header';
import Footer from './application/view/Footer';
import './App.css';
import Home from './application/view/Home';

interface Props{
}

interface InternalState{
}

class App extends React.Component<Props, InternalState> {

    public render() {
        return (
            <div className="App">
				<Header/>
                <Switch>
                    <Route path='/' component={Home}/>
                </Switch>
				
            </div>
        );
    }

}


export default App;