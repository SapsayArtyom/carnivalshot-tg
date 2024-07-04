import React from 'react'
import './ScorePage.css'
import '../../util/analytics';

export default class ScorePage extends React.Component {
    constructor(props) {
        super(props)
     
        this.state = {
            scores: props.scores,
            userScore: props.userScore,
            showButton: false
        }
    }

    truncateName(value) {
        const MAX_LENGTH = 15;
        const name = String(value);

        let trimmedString = name.length > MAX_LENGTH
            ? name.substring(0, MAX_LENGTH - 3) + "..."
            : name;
        return trimmedString
    }

    render() {
        return (
            <div>
                <div className="score-picker-container">
                    <div className="top-header">
                        <p className="orange-big-text" style={{display:"none"}}>LEADERBOARD</p>
                    </div>
                    <div className="column-header-container">
                        <p className="column-header-text">RANK</p>
                        <p className="column-header-text">NAME</p>
                        <p className="column-header-text">SCORE</p>
                    </div>
                    <div className="score-button-container">
                        {
                            this.props.scores.map((score, index) => {
                                return <div key={index} className={`individual-score-container ${index % 2 == 0 ? 'odd-back' : 'even-back'}`} >
                                            <div className="individual-score-container-inner">
                                                <p className={`score-text position-text ${score.userId == this.props.nickname ? 'blue-text' : '' }`}>{index + 1}</p>
                                                <p className={`name-text ${score.nickname == this.props.nickname ? 'blue-text' : '' }`}>{this.truncateName(score.nickname)}</p>
                                                <p className={`score-text score-label ${score.nickname == this.props.nickname ? 'blue-text' : '' }`}>{score.score}</p>
                                                {/* <p className={`score-text ${score.nickname == this.props.nickname ? 'blue-text' : '' }`} style={{ marginRight: '0.8rem' }}>{score.score}</p> */}
                                            </div>
                                        </div>
                            })
                        }
                    </div>
                </div>
                <div className="countdown-overlay" style={{background: 'transparent'}}>

                </div>
                <div className="countdown-overlay-background" style={{background: 'transparent'}}>
                 
                </div>
                <div id="smallLogoContainer">
                    <img id="smallLogo" src="assets_full/logo300.png" />
                </div>
                <div id="myScoreContainer">
                    <p className="score-text">Your score: {this.props.userScore}</p>
                </div>
            </div>
        )
    }

}

