import React from 'react'
import "@babel/polyfill";
import moment from 'moment';
import jwt from 'jsonwebtoken';
import PubNub from 'pubnub';

import Slider from 'react-rangeslider';
import Authentication from '../../util/Authentication/Authentication'

import './LiveConfigPage.css'
import 'react-rangeslider/lib/index.css';


let intervalID = null;
let pubnub = null;

export default class LiveConfigPage extends React.Component {
    constructor(props) {
        super(props);
        this.Authentication = new Authentication()
      
        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state = {
            extensionId: '5f042f86828b8308ded5d0e4',
            channelId: null,
            userId: null,
            gameId: null,
            deadlineAt: 0,
            waitAt: 1,
            state: null,
            gameTime: 1,
            timer: '',
            scores: [],
        }
    }

    componentDidMount() {
        if (this.twitch) {
            this.twitch.onAuthorized((auth) => {
                
                // this.Authentication.setToken(auth.token, auth.userId);
                // const userId = this.Authentication.getUserId();
                // const channelId = jwt.decode(auth.token).channel_id;
                const payload = jwt.decode(auth.token);

                const channelId = payload.channel_id;
                const userId = payload.user_id;

                this.setState({ userId, channelId });

                pubnub = new PubNub({
                    subscribeKey: "sub-c-d846e9d6-c1ef-11ea-8089-3ec3506d555b",
                    publishKey: "pub-c-3ccd7481-7e33-4e2b-b950-9d4d231c7de7",
                    // secretKey: "secretKey",
                    uuid: `admin-${userId}`,
                    ssl: true
                });

                const ON_CHANGE_STATUS_EVENT = `${channelId}:onChangeStatus`;
                const INIT_ME_EVENT = `${userId}`;

                pubnub.unsubscribeAll();
                pubnub.subscribe({ channels: [ INIT_ME_EVENT, ON_CHANGE_STATUS_EVENT ] });
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
                                    // waitAt: data.waitAt, 
                                    scores: data.scores,
                                });
                                console.log("INIT STREAMER", this.state);
                              break;
                            
                            case ON_CHANGE_STATUS_EVENT: 
                                this.setState({ 
                                    gameId: data.gameId, 
                                    username: data.username, 
                                    nickname: data.nickname, 
                                    state: data.state, 
                                    deadlineAt: data.deadlineAt, 
                                    // waitAt: data.waitAt,
                                    scores: data.scores,
                                });
                                console.log("ON_CHANGE_STATUS_EVENT", this.state);
                                if(data.status === 'board') {
                                    ga('send', 'event', 'Game', 'streamer_game_stopped', 'stopped', this.state.channelId);
                                }
                                break;
                        }
                    },
                });


                if(pubnub) {
                    pubnub.publish({
                        channel: 'initState',
                        message: {
                            extensionId: this.state.extensionId,
                            channelId: this.state.channelId,
                            userId: this.state.userId,
                            isAuth: true
                        }
                    });
                }

            });
        }
    }

    setGameTimeSlider(value) {
        this.setState({
            gameTime: value
        })
    }

    setCountdownTimeSlider(value) {
        this.setState({
            waitAt: value
        })
    }

    startGame() {
        pubnub.publish({
            channel: 'onSetStatus',
            message: {
                state: 'game', 
                extensionId: this.state.extensionId, 
                channelId: this.state.channelId,
                deadlineAt: moment().add( this.state.gameTime, 'minutes').valueOf(), 
                waitAt: this.state.waitAt, 
                gameId: this.state.gameId,
                userId: this.state.userId
            }
        });

        this.onTimer();
        ga('send', 'event', 'Game', 'streamer_game_started', 'started', this.state.channelId);
    }

    officialStop() {
        pubnub.publish({
            channel: 'onSetStatus',
            message: {
                state: 'settings', 
                extensionId: this.state.extensionId, 
                channelId: this.state.channelId,
                gameId: this.state.gameId,
                userId: this.state.userId
            }
        });
        clearInterval(intervalID);
    }
    

    onTimer() {
        intervalID = setInterval(() => {
            const { deadlineAt, waitAt, timer } = this.state;
            let time = +Number((deadlineAt - Date.now()) / 1000).toFixed(0); // seconds
            if(time < 0) {
                clearInterval(intervalID);
                ga('send', 'event', 'Game', 'streamer_game_natural_stop', 'natural_stop', this.state.channelId);
                return;
            }

            // time = time + waitAt;
            const minutes = Math.floor(time / 60);
            const seconds = (time - (minutes * 60));

            const minutesText =  minutes < 10 ? `0${minutes}` : minutes;
            const secondsText = seconds < 10 ? `0${seconds}` : seconds;

            this.setState({ timer: `${minutesText}:${secondsText}` });

        } ,1000);
    }


    _forceStop() {
        pubnub.publish({
            channel: 'onSetStatus',
            message: {
                state: 'board', 
                extensionId: this.state.extensionId, 
                channelId: this.state.channelId,
                gameId: this.state.gameId,
                userId: this.state.userId
            }
        });
        clearInterval(intervalID);
        ga('send', 'event', 'Game', 'streamer_game_manual_stop', 'manual_stop', this.state.channelId);
    }


    render() {

        const { state, scores, gameTime, waitAt } = this.state;
        console.log('LiveConfig', this.state);

        if(!intervalID && state == 'game') this.onTimer();

        switch(state) {
            case 'game':
                return (
                    <div className="LiveConfigPage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <img className="logo" src="assets_full/logo300.png" />
                        <p className="timer-text">{ this.state.timer }</p>
                        <div onClick={ this._forceStop.bind(this) } className="play-button">
                            <p className="play-button-text">HIGH SCORES</p>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="LiveConfigPage">
                        <img className="logo" src="assets_full/logo300.png" />
                        <div className="time-container">
                            <p className="time-text">Game time: {gameTime} min.</p>
                            <Slider
                                min={1}
                                max={60}
                                value={gameTime}
                                orientation="horizontal"
                                onChange={ this.setGameTimeSlider.bind(this) }
                            />
                        </div>
                        <div className="time-container">
                            <p className="time-text">Countdown time: {waitAt} sec.</p>
                            <Slider
                                min={1}
                                max={30}
                                value={waitAt}
                                orientation="horizontal"
                                onChange={ this.setCountdownTimeSlider.bind(this) }
                            />
                        </div>
                        <div onClick={ this.startGame.bind(this) } className="play-button">
                            <p className="play-button-text">START</p>
                        </div>
                    </div>
                );
            case 'board':
                return (
                    <div className="LiveConfigPage high-score-container">
                        <img className="logo" src="assets_full/logo300.png" />
                        <p className="high-score-text">SHOWING <br />HIGH SCORES</p>
                        { scores.map((score, index) => {
                            return (
                                <div key={index} className="score-container">
                                    <p className="score-text">{index + 1})</p>
                                    <p className="score-text">{score.nickname}</p>
                                    <p className="score-text">{score.score}</p>
                                </div>
                            )
                        })}
                        <div onClick={ this.officialStop.bind(this) } className="play-button">
                            <p className="play-button-text">STOP</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="LiveConfigPage">
                        <div className="loader-container">
                            <div className="loader">LOADING...</div>
                        </div>
                    </div>
                );
        }

    }
}