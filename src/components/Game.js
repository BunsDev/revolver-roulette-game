import "../css//App.css";
import "../css/game.css";
import React from "react";
import { signer, provider } from "../web3";
import { ethers, BigNumber } from "ethers";
import {
  Container,
  Button,
  Segment,
  GridRow,
  GridColumn,
  Grid,
  Icon,
} from "semantic-ui-react";

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      showError: false,
      fadeOut: false,
      display: false,

      user: undefined,
      player1: undefined,
      player2: undefined,
      turn: "0x0",
      winner: "0x0000000000000000000000000000000000000000",
      pot: 0,
      wagerPlayer1: 0,
      wagerPlayer2: 0,
      sessionId: undefined,
      player1Status: null,
      player2Status: null,
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

  displayTurn = () => {
    if (this.state.winner !== "0x0000000000000000000000000000000000000000") {
      return <div>Game Over!</div>;
    }
    if (this.state.turn === this.props.account) {
      return <div style={{ color: "green" }}>Your turn!</div>;
    } else {
      return <div>Waiting for opponent...</div>;
    }
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
    if (this.props.sessionId) {
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
        this.setState({ pot: ethers.utils.formatEther(gameStruct[8]) });
        this.setState({ wagerPlayer1: ethers.utils.formatEther(wagerPlayer1) });
        this.setState({ wagerPlayer2: ethers.utils.formatEther(wagerPlayer2) });

        this.setState({ winner: gameStruct[3] });

        console.log(gameStruct);
        console.log("game updated");
      } catch (error) {
        this.displayError(error);
      }
    }
  };

  displayWinner = () => {
    let winnerMessage = null;
    if (this.state.player1 === this.state.winner) {
      winnerMessage = <h1>Player1 wins!</h1>;
    } else if (
      this.state.player2 === this.state.winner &&
      this.state.player2 !== "0x0000000000000000000000000000000000000000"
    ) {
      winnerMessage = <h1>Player2 wins!</h1>;
    }

    return (
      <div>
        {winnerMessage}
        {this.props.account === this.state.winner ? (
          <Button
            style={{ marginBottom: "3px" }}
            color="blue"
            onClick={this.withdrawPot}
          >
            Withdraw Pot!
          </Button>
        ) : null}
      </div>
    );
  };

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
        <Segment style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            <Button
              icon
              labelPosition="right"
              color="blue"
              onClick={() => this.getGameInfo()}
            >
              <Icon name="refresh" />
              Refresh
            </Button>
          </div>

          <div style={{ textAlign: "center" }}>
            {this.props.sessionId}
            <br />
            {`Pot: ${Number(this.state.pot)} LINK`}
            {this.displayTurn()}
          </div>

          <Grid divided="vertically">
            <GridRow columns={2}>
              <GridColumn
                style={{
                  border:
                    this.state.player1 === this.props.account
                      ? "1px solid blue"
                      : "none",
                }}
              >
                <div>Player1: {this.state.player1}</div>
                <div>Status: {this.state.player1Status}</div>
              </GridColumn>
              <GridColumn
                style={{
                  border:
                    this.state.player2 === this.props.account
                      ? "1px solid blue"
                      : "none",
                }}
              >
                <div>Player2: {this.state.player2}</div>
                <div>Status: {this.state.player2Status}</div>
              </GridColumn>
              {console.log(this.props.sessionId)}
            </GridRow>
          </Grid>
          <br />
          <div style={{ textAlign: "center" }}>
            {this.displayWinner()}
            <Button color="blue" onClick={this.spinCylinder}>
              Spin Cylinder!
            </Button>
            <Button color="blue" onClick={this.fireRevolver}>
              Fire!
            </Button>
          </div>
        </Segment>
      );
    }
  };

  async createEventListeners() {
    if (this.props.sessionId) {
      const filterFire = this.props.gameContract.filters.RevolverFired(
        this.props.sessionId
      );
      const filterSpin = this.props.gameContract.filters.SpinCylinder(
        this.props.sessionId
      );

      const filterJoined = this.props.gameContract.filters.GameJoined(
        this.props.sessionId
      );

      this.props.gameContract.on(filterSpin, async (sessionId, player) => {
        console.log("cylinder spun: ", player, sessionId);

        if (ethers.utils.getAddress(player) === this.state.player1) {
          this.setState({ player1Status: "Cylinder Spun, waiting to fire..." });
        } else if (ethers.utils.getAddress(player) === this.state.player2) {
          this.setState({ player2Status: "Cylinder Spun, waiting to fire..." });
        }

        await this.getGameInfo();
      });
      this.props.gameContract.on(
        filterFire,
        async (sessionId, player, randomNumber) => {
          console.log(
            "revolver fired: ",
            sessionId,
            sessionId,
            Number(randomNumber._hex)
          );

          if (ethers.utils.getAddress(player) === this.state.player1) {
            this.setState({
              player1Status:
                Number(randomNumber._hex) == 3 ? (
                  <div>
                    <span style={{ color: "red" }}>Revolver Fired: Bang!</span>
                  </div>
                ) : (
                  "Revovler Fired: Click..."
                ),
            });
          } else if (ethers.utils.getAddress(player) === this.state.player2) {
            this.setState({
              player2Status:
                Number(randomNumber._hex) == 3 ? (
                  <div>
                    <span style={{ color: "red" }}>Revolver Fired: Bang!</span>
                  </div>
                ) : (
                  "Revovler Fired: Click..."
                ),
            });
          }
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
  }

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          {this.displayGame()}
          <div className={`error ${this.state.fadeOut ? "fade-out" : ""}`}>
            {this.state.error}
          </div>
        </Container>
      </div>
    );
  }
}
export default Game;
