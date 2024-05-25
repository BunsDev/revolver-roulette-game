import "../css//App.css";
import "../css/header.css";
import React from "react";
import gameAbi from "../ABIs/revolver";
import linkAbi from "../ABIs/linkToken";
import { signer, provider } from "../web3";
import { ethers } from "ethers";
import Header from "./Header";
import JoinGame from "./JoinGame";
import CreateGame from "./CreateGame";

import { Container, Button, Input, Segment } from "semantic-ui-react";

class StartGame extends React.Component {
  state = {
    createOrJoin: null,
  };

  render() {
    return (
      <div>
        <Container className="box">
          <Segment textAlign="center">
            <Button
              color="blue"
              size="massive"
              onClick={() => this.setState({ createOrJoin: "create" })}
            >
              CREATE A GAME
            </Button>
            <Button
              color="blue"
              size="massive"
              onClick={() => this.setState({ createOrJoin: "join" })}
            >
              JOIN A GAME
            </Button>

            {this.state.createOrJoin === "create" ? (
              <CreateGame
                gameContract={this.props.gameContract}
                linkContract={this.props.linkContract}
              />
            ) : null}
            {this.state.createOrJoin === "join" ? (
              <JoinGame
                gameContract={this.props.gameContract}
                linkContract={this.props.linkContract}
              />
            ) : null}
          </Segment>
        </Container>
      </div>
    );
  }
}
export default StartGame;
