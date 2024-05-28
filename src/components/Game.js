import "../css//App.css";
import "../css/game.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import {
  Container,
  Button,
  Input,
  Segment,
  GridRow,
  GridColumn,
  Grid,
  Image,
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
      wager: 0,
      turn: "0x0",
      winner: "0x0",
    };
  }
  extractErrorReason = (errorMessage) => {
    const reasonMatch = errorMessage.match(/reason="([^"]+)"/);
    return reasonMatch ? reasonMatch[1] : "Unknown error";
  };

  spinCylinder = async () => {
    try {
      await this.props.gameContract.spinCylinder(this.props.sessionId);
    } catch (error) {
      const errorMessage = error.message;
      const extractedReason = this.extractErrorReason(errorMessage);
      this.setState({
        error: extractedReason,
        showError: true,
        fadeOut: false,
      });

      // Wait for 5 seconds before starting the fade-out animation
      setTimeout(() => {
        this.setState({ fadeOut: true });

        // Remove error after the fade-out animation completes
        setTimeout(() => {
          this.setState({ showError: false });
        }, 5000);
      }, 5000);
    }
  };

  fireRevolver = async () => {
    try {
      await this.props.gameContract.fireRevolver(this.props.sessionId);
    } catch (error) {
      const errorMessage = error.message;
      const extractedReason = this.extractErrorReason(errorMessage);
      this.setState({
        error: extractedReason,
        showError: true,
        fadeOut: false,
      });

      // Wait for 5 seconds before starting the fade-out animation
      setTimeout(() => {
        this.setState({ fadeOut: true });

        // Remove error after the fade-out animation completes
        setTimeout(() => {
          this.setState({ showError: false });
        }, 5000);
      }, 5000);
    }
  };

  getWager = async () => {
    const accounts = await provider.send("eth_requestAccounts", []);
    const wager = await this.props.gameContract.wagers(
      this.props.sessionId,
      accounts[0]
    );

    const wagerInWei = ethers.BigNumber.from(wager);
    const wagerInEther = ethers.utils.formatEther(wagerInWei);

    this.setState({ wager: wagerInEther });

    return wager;
  };

  getGameInfo = async () => {
    const gameStruct = await this.props.gameContract.gameSessions(
      this.props.sessionId
    );
    console.log(gameStruct[1]);
    this.setState({ player1: gameStruct[1] });
    this.setState({ player2: gameStruct[2] });
    this.setState({ turn: gameStruct[4] });
    if (gameStruct[3] != "0x0000000000000000000000000000000000000000") {
      this.setState({ winner: gameStruct[3] });
    }
    console.log(gameStruct);
    await this.getWager();
    console.log("game updated");
  };

  displayWinner = () => {
    if (this.state.player1 == this.state.winner) {
      return (
        <div>
          <h1>Player1 wins!</h1>
        </div>
      );
    } else if (this.state.player2 == this.state.winner) {
      return (
        <div>
          <h1>Player2 wins!</h1>
        </div>
      );
    }
  };

  displayGame = () => {
    if (this.props.sessionId && !this.state.display) {
      this.getGameInfo();
      this.setState({ display: true });
      this.createEventListeners();
    }
    if (this.props.sessionId) {
      return (
        <Segment textAlign="center">
          {this.props.sessionId}
          <br />
          {`Pot: ${this.state.wager} LINK`}
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
    provider.on("error", (error) => {
      console.error("Provider error:", error);
    });
  }
  // async componentDidUpdate() {
  //   if (this.state.sessionId) {
  //     console.log("componentDidUpdate");
  //     await this.getGameInfo();

  //     const filter = this.props.gameContract.filters.RevolverFired(
  //       this.state.sessionId
  //     );
  //     this.props.gameContract.on(
  //       filter,
  //       async (player, sessionId, randomNumber) => {
  //         console.log(player, sessionId, randomNumber);
  //       }
  //     );
  //     provider.on("error", (error) => {
  //       console.error("Provider error:", error);
  //     });
  //   }
  // }

  render() {
    return (
      <div>
        <Container className="box" style={{ marginTop: "20px" }}>
          {this.displayGame()}
          <button onClick={() => this.getGameInfo()}>update</button>
          <div className={`error ${this.state.fadeOut ? "fade-out" : ""}`}>
            {this.state.error}
          </div>
        </Container>
      </div>
    );
  }
}
export default Game;
