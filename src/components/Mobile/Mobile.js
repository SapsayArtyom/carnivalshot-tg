import React from 'react';
import "@babel/polyfill";
import moment from 'moment';
import PubNub from 'pubnub';
import jwt from 'jsonwebtoken';

import Authentication from '../../util/Authentication/Authentication';
import Lane from '../Games/Lane/Lane';
import ScorePage from '../ScorePage/ScorePage';
import './Mobile.css';


let pubnub = null;

export default class Mobile extends React.Component {
    constructor(props) {
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state = {
            extensionId: '5f042f86828b8308ded5d0e4',
            isAuth: false,
            channelId: null,
            userId: null,
            username: '', // official name
            nickname: '', // random name
            gameId: null,
            state: null,
            deadlineAt: 0,
            waitAt: 0,
            score: 0,
            scores: [],
            isVisible: true,
        }
    }

    componentDidMount() {
        if (this.twitch) {
            this.twitch.onAuthorized((auth) => {
                // const channelId = jwt.decode(auth.token).channel_id;
                // this.Authentication.setToken(auth.token, auth.userId);
                // const userId = this.Authentication.getUserId();
                console.log('auth mobile', auth);
                const payload = jwt.decode(auth.token);

                const channelId = payload.channel_id;
                let userId = `random-${moment().unix()}`;
                const isAuth = !!payload.user_id || !payload.is_unlinked;
                
                if(isAuth) userId = payload.user_id;
                
                pubnub = new PubNub({
                    subscribeKey: "",
                    publishKey: "",
                    uuid: `mobile-${userId}`,
                    ssl: true
                })

                this.setState({
                    isAuth,
                    userId,
                    channelId
                }, () => {
                    if(pubnub) {
                        pubnub.publish({
                            channel: 'initState',
                            message: {
                                extensionId: this.state.extensionId,
                                channelId: channelId,
                                userId: userId,
                                isAuth: isAuth,
                            }
                        });
                    }
                });

                const ON_CHANGE_STATUS_EVENT = `${channelId}:onChangeStatus`;
                const ON_GET_SCORE_EVENT = `${channelId}:onGetScore`;
                const INIT_ME_EVENT = `${userId}`;
                
                pubnub.unsubscribeAll();
                pubnub.subscribe({ channels: [ ON_CHANGE_STATUS_EVENT, ON_GET_SCORE_EVENT, INIT_ME_EVENT ] });
                pubnub.addListener({
                    message: (event) => {
                        const data = event.message;
                        switch(event.channel) {
                            case INIT_ME_EVENT:
                                this.setState({
                                    gameId: data.gameId, 
                                    username: data.username, 
                                    nickname: data.nickname, 
                                    state: data.state, 
                                    deadlineAt: data.deadlineAt, 
                                    waitAt: data.waitAt, 
                                    scores: data.scores,
                                }, () => console.log('INIT MOBILE CLIENT', this.state));
                                break;
                            
                            case ON_CHANGE_STATUS_EVENT: 
                                this.setState({ 
                                    gameId: data.gameId, 
                                    state: data.state, 
                                    deadlineAt: data.deadlineAt, 
                                    waitAt: data.waitAt, 
                                    scores: data.scores,
                                });
                                if(data.state === 'game'){
                                    ga('send', 'event', 'Game', 'user_started_game', 'started_game');
                                }
                                if(data.state === 'board') {
                                    ga('send', 'event', 'Game', 'user_finished_game', this.state.score, this.state.channelId);
                                }
                                break;
                            case ON_GET_SCORE_EVENT: 
                                pubnub.publish({
                                    channel: 'onSetScore',
                                    message: {
                                        userId: this.state.userId,
                                        extensionId: this.state.extensionId,
                                        channelId: this.state.channelId,
                                        gameId: this.state.gameId,
                                        score: this.state.score,
                                        nickname: this.state.nickname
                                    }
                                });
                                if(payload.username === this.state.username) {
                                    ga('send', 'event', 'Game', 'user_played_with_real_name', 'real_name');
                                } else {
                                    ga('send', 'event', 'Game', 'user_updated_name', 'updated_name');
                                }
                                break;
                        }
                    },
                });
                
            });

            this.twitch.onVisibilityChanged((isVisible, _c) => {
                this.setState({ "isVisible": isVisible });
            });
        }
    }

    updateStateGame({ score, nickname }) {
        this.setState({ score, nickname });
    }

    render() {
        let { state, scores, nickname, username, isAuth, waitAt, deadlineAt } = this.state;
        // game status is coming from firestore, either running or not, where game state is the local state of play
        if(!this.state.isVisible) return null;
        
        console.log('MOBILEEEEE', this.state);

        const myName = isAuth ? username : nickname;
        const myScore = scores.find( s => s.nickname === myName ) || { score: 0, nickname: '' };

        switch(state) {
            case 'game': 
                return (
                    <div className="main-wrapper">
                        <div className="App">
                            <Lane style="height: 100vh; width: 100vw" 
                                updateStateGame={this.updateStateGame.bind(this)} 
                                endTime={ deadlineAt}
                                waitAt={ waitAt }
                                isAuth={ true }
                                username={ myName }
                                isMobile={true}
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