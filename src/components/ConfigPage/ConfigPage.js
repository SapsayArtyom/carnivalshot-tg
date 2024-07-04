import React from 'react'
import './Config.css'

export default class ConfigPage extends React.Component {

    render(){
        return  (
            <div className="LiveConfigPage" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img className="logo" src="assets_full/logo300.png" />
                <p className="config-title-text">Carnival Shot</p>
                <p className="timer-text">
                    Go to live config to control the extension <br/>
                    Pick the amount of minutes that the game should run <br/>
                    Once start is pressed a 30 second countdown will appear for the viewers <br/>
                    If you stop the game or the time runs out the viewers will see the high scores
                </p>
            </div>
        )
    }
}