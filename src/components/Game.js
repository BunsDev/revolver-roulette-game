import "../css//App.css";
import "../css/game.css";
import React from "react";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import {
  Container,
  Button,
  Segment,
  GridRow,
  GridColumn,
  Grid,
} from "semantic-ui-react";

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      showError: false,
      fadeOut: false,
      display: false,
      gameContract: null,
      linkContract: null,
      user: null,
      player1: null,
      player2: null,
      turn: "0x0",
      winner: "0xf71A5fBD7c0bF8E16a7975dD86596a83A6259E2e",
      pot: 0,
      wagerPlayer1: 0,
      wagerPlayer2: 0,
      sessionId: null,
    };
  }

  displayError = (error) => {
    const errorMessage = error.message;
    const reasonMatch = errorMessage.match(/reason="([^"]+)"/);
    const extractedReason = reasonMatch ? reasonMatch[1] : "Unknown error";
    this.setState({
      error: extractedReason,
      showError: true,
      fadeOut: false,
    });

    setTimeout(() => {
      this.setState({ fadeOut: true });

      setTimeout(() => {
        this.setState({ showError: false });
      }, 5000);
    }, 5000);
  };

  spinCylinder = async () => {
    try {
      await this.props.gameContract.spinCylinder(this.props.sessionId);
    } catch (error) {
      this.displayError(error);
    }
  };

  fireRevolver = async () => {
    try {
      await this.props.gameContract.fireRevolver(this.props.sessionId);
    } catch (error) {
      this.displayError(error);
    }
  };

  withdrawPot = async () => {
    try {
      await this.props.gameContract.withdrawPot(this.props.sessionId);
    } catch (error) {
      this.displayError(error);
    }
  };

  getGameInfo = async () => {
    try {
      const gameStruct = await this.props.gameContract.gameSessions(
        this.props.sessionId
      );

      const wagerPlayer1 = await this.props.gameContract.wagers(
        this.props.sessionId,
        gameStruct[1]
      );
      const wagerPlayer2 = await this.props.gameContract.wagers(
        this.props.sessionId,
        gameStruct[2]
      );

      this.setState({ player1: gameStruct[1] });
      this.setState({ player2: gameStruct[2] });
      this.setState({ turn: gameStruct[4] });
      this.setState({ pot: gameStruct[8] });
      this.setState({ wagerPlayer1: ethers.utils.formatEther(wagerPlayer1) });
      this.setState({ wagerPlayer2: ethers.utils.formatEther(wagerPlayer2) });
      if (gameStruct[3] != "0x0000000000000000000000000000000000000000") {
        this.setState({ winner: gameStruct[3] });
      }
      console.log(gameStruct);
      console.log("game updated");
    } catch (error) {
      this.displayError(error);
    }
  };

  displayWinner = () => {
    console.log("Winner:", this.state.winner, "Account:", this.props.account);
    console.log("Types:", typeof this.state.winner, typeof this.props.account);

    let winnerMessage = null;
    if (this.state.player1 === this.state.winner) {
      winnerMessage = <h1>Player1 wins!</h1>;
    } else if (this.state.player2 === this.state.winner) {
      winnerMessage = <h1>Player2 wins!</h1>;
    }

    return (
      <div>
        {winnerMessage}
        {this.props.account === this.state.winner ? (
          <Button color="blue" onClick={this.withdrawPot}>
            Withdraw Pot!
          </Button>
        ) : null}
      </div>
    );
  };

  // async componentDidMount() {
  //   console.log("game mounted");
  //   try {
  //     const accounts = await provider.send("eth_requestAccounts", []);
  //     console.log("from game: ", accounts[0]);
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // }

  displayGame = () => {
    if (
      (this.props.sessionId && !this.state.display) ||
      this.props.sessionId !== this.state.sessionId
    ) {
      this.setState({ sessionId: this.props.sessionId });
      this.getGameInfo();
      this.setState({ display: true });
      this.createEventListeners();
    }
    if (this.props.sessionId) {
      return (
        <Segment textAlign="center">
          {this.props.sessionId}
          <br />
          {`Pot: ${Number(this.state.pot)} LINK`}
          <Grid divided="vertically">
            <GridRow columns={2}>
              <GridColumn
                style={
                  this.state.turn == this.state.player1
                    ? { color: "green" }
                    : {}
                }
              >{`Player1: ${this.state.player1}`}</GridColumn>
              <GridColumn
                style={
                  this.state.turn == this.state.player2
                    ? { color: "green" }
                    : {}
                }
              >{`Player2: ${this.state.player2}`}</GridColumn>
              {console.log(this.props.sessionId)}
            </GridRow>
          </Grid>
          <br />
          {this.displayWinner()}
          <Button color="blue" onClick={this.spinCylinder}>
            Spin Cylinder!
          </Button>
          <Button color="blue" onClick={this.fireRevolver}>
            Fire!
          </Button>
        </Segment>
      );
    }
  };

  async createEventListeners() {
    const filterFire = this.props.gameContract.filters.RevolverFired(
      null,
      this.props.sessionId
    );
    const filterSpin = this.props.gameContract.filters.SpinCylinder(
      this.props.sessionId
    );

    const filterJoined = this.props.gameContract.filters.GameJoined(
      this.props.sessionId
    );

    this.props.gameContract.on(filterSpin, async (player, sessionId) => {
      console.log("cylinder spun: ", player, sessionId);
      await this.getGameInfo();
    });
    this.props.gameContract.on(
      filterFire,
      async (player, sessionId, randomNumber) => {
        console.log("revolver fired: ", player, sessionId, randomNumber);
        await this.getGameInfo();
      }
    );

    this.props.gameContract.on(filterJoined, async (sessionId) => {
      console.log("player 2 joined: ", sessionId);
      await this.getGameInfo();
    });
    provider.on("error", (error) => {
      console.error("Provider error:", error);
    });
  }

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          {this.displayGame()}
          <button onClick={() => this.getGameInfo()}>refresh</button>
          <div className={`error ${this.state.fadeOut ? "fade-out" : ""}`}>
            {this.state.error}
          </div>
        </Container>
      </div>
    );
  }
}
export default Game;
