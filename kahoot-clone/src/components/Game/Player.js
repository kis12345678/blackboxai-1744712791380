import React, { Component } from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import PlayerQuestions from "./Player_Questions";
import PlayerQuestionOver from "./Player_Question_Over";
import "./Game.css";
import load from "../../Assests/load-circle-outline.svg";
import { selectedPin } from "../../Ducks/Reducer";

class Player extends Component {
    constructor() {
        super();
        this.state = {
            pinCorrect: false,
            gameStarted: false,
            questionOver: false,
            answerSubmitted: false,
            answeredCorrect: false,
            score: 0
        };
        this.submitAnswer = this.submitAnswer.bind(this);
    }
    componentDidMount() {
        this.socket = io("/");
        const pin = (this.props.match && this.props.match.params && this.props.match.params.pin) || this.props.selectedPin || 0;
        if (pin) {
            this.props.dispatch(selectedPin(pin));
            this.socket.emit("player-joined", pin);
            this.socket.emit("player-add", { ...this.props, selectedPin: pin });
        }
        this.socket.on("room-joined", (data) => { console.log("Quiz data: " + data); });
        this.socket.on("question-over", () => {
            this.setState({
                questionOver: true
            });
        });
        this.socket.on("next-question", () => {
            console.log("hit");
            this.setState({
                gameStarted: true,
                questionOver: false,
                answerSubmitted: false,
                answeredCorrect: false
            });
        });
        this.socket.on("sent-info", data => {
            this.setState({
                answeredCorrect: data.answeredCorrect,
                score: this.state.score + data.score
            });
        });
    }
    submitAnswer(num) {
        this.socket.emit("question-answered", {name: this.props.nickname, answer: num, pin: this.props.selectedPin});
        this.setState({
            answerSubmitted: true
        });
    }
    render() {
        console.log(this.props);
        let { gameStarted, questionOver, answerSubmitted } = this.state;
        const pin = (this.props.match && this.props.match.params && this.props.match.params.pin) || this.props.selectedPin || 0;
        return (
            <div className="player-container">
                <div className="status-bar">
                    <p className="player-info" id="pin">PIN: {pin}</p>
                </div>
                {
                    !gameStarted && !questionOver
                    ?
                    <div>
                        <p>You're in!
                            <br />
                            Do you see your nickname on the screen?
                        </p>
                        <div className="answer-container">
                            <div className="q-blank q"></div>
                            <div className="q-blank q"></div>
                            <div className="q-blank q"></div>
                            <div className="q-blank q"></div>
                        </div>
                    </div>
                    :
                    gameStarted && !questionOver && !answerSubmitted
                    ?
                    <PlayerQuestions submitAnswer={this.submitAnswer} />
                    :
                    gameStarted && !questionOver && answerSubmitted
                    ?
                    <div className="waiting-for-results">
                        <p className="answer-indicator" id="too-fast">Did You answer too fast????</p>
                        <img src={load} alt="" className="load-circle" />
                    </div>
                    :
                    <PlayerQuestionOver answeredCorrect={this.state.answeredCorrect} />
                }
                <div className="status-bar">
                    <p className="player-info">{this.props.nickname}</p>
                    <div className={gameStarted && !questionOver && answerSubmitted ? "status-bar-hidden" : "status-bar-score"}>
                        {this.state.score}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        selectedPin: state.selectedPin,
        nickname: state.nickname
    };
}

export default connect(mapStateToProps)(Player);
