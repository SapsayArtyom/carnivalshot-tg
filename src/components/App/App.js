import React from 'react';
import "@babel/polyfill";
// import moment from 'moment';
// import PubNub from 'pubnub';
// import jwt from 'jsonwebtoken';

// import Authentication from '../../util/Authentication/Authentication';
import Lane from '../Games/Lane/Lane';
import ScorePage from '../ScorePage/ScorePage';
import './App.css'


let pubnub = null;

export default class App extends React.Component {
    constructor(props) {
        super(props)
        // this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        // this.twitch = window.Twitch ? window.Twitch.ext : null
        this.twitch = false;
        this.state = {
            extensionId: '5f042f86828b8308ded5d0e4',
            isAuth: false,
            channelId: null,
            userId: null,
            username: '', // official name
            nickname: '', // random name
            gameId: null,
            isAuth: false,
            state: null,
            deadlineAt: 0,
            waitAt: 0,
            score: 0,
            scores: [],
            isVisible: true,
        }
    }

    componentDidMount() {
        this.setState({ 
            gameId: '6464684646846', 
            username: 'Qwe Qweqwe', 
            nickname: 'Alex', 
            state: 'game', 
            deadlineAt: 5000, 
            waitAt: 3, 
            scores: 0,
            isAuth: false
        })
    }

    updateStateGame({ score, nickname }) {
        this.setState({ score, nickname });
    }

    render() {
        let { state, scores, nickname, username, isAuth, waitAt, deadlineAt } = this.state;
        // game status is coming from firestore, either running or not, where game state is the local state of play
        if(!this.state.isVisible) return null;

        const myName = isAuth ? username : nickname;
        const myScore = { score: 0, nickname: '' };
        switch(state) {
            case 'game': 
                return (
                    <div className="main-wrapper">
                        <div className="App">
                            <Lane style="height: 100vh; width: 100vw" 
                                updateStateGame={this.updateStateGame.bind(this)} 
                                endTime={ deadlineAt}
                                waitAt={ waitAt }
                                isAuth={ isAuth }
                                username={ myName }
                                isMobile={false}
                            >      
                            </Lane>
                        </div>
                    </div>
                )
            case 'board':
                return (
                    <div className="main-wrapper">
                        <div className="App">
                            <ScorePage scores={scores} userScore={ myScore.score } nickname={ myScore.nickname }/>
                        </div>
                    </div>
                )
            default:
                return (<div />)
        }

    }
}