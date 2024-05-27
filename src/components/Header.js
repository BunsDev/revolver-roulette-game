import React from "react";
import { signer, provider } from "../web3";
import "../css/header.css";

import { Container, Header, Menu, Segment, Icon } from "semantic-ui-react";
class NavBar extends React.Component {
  state = {
    account: null,
    connectedIcon: <Icon name="cancel" color="red" />,
    networkIcon: <Icon name="cancel" color="red" />,
  };

  async componentDidMount() {
    //check if wallet is connected
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log(accounts[0]);
    this.setState({ account: accounts[0] });
    if (accounts.length > 0) {
      this.setState({ connectedIcon: <Icon name="check" color="green" /> });
    }
    //get network
    const networkId = await provider.getNetwork();
    console.log(networkId.chainId);
    if (networkId.chainId === 43113 && window.ethereum) {
      this.setState({ networkIcon: <Icon name="check" color="green" /> });
    }
  }

  render() {
    return (
      <>
        <Container>
          <Segment className="content-box">
            <Header as="h1" textAlign="center">
              <div
                style={{
                  fontSize: "32px",
                  marginTop: "15px",
                  display: "inline-flex",
                }}
                className="banner chainlinkFont"
              ></div>
            </Header>
            <div
              className="chainlinkFont"
              style={{
                minWidth: "25%",
                float: "right",
                lineHeight: "0.1",
              }}
            >
              Wallet:
              {this.state.connectedIcon}
              <br />
              Network:
              {this.state.networkIcon}
            </div>

            <Menu style={{ fontFamily: "chainlinkFont" }} fluid widths={4}>
              <Menu.Item className="menu-button">
                <a style={{ display: "block", color: "black" }} href="/">
                  <span className="span-button"></span>
                  Home
                </a>
              </Menu.Item>
              <Menu.Item className="menu-button">
                <a style={{ color: "black" }} href={`/about`}>
                  <span className="span-button"></span>
                  About
                </a>
              </Menu.Item>
              <Menu.Item className="menu-button">
                <a
                  style={{ color: "black" }}
                  href={`/account/${this.state.account}`}
                >
                  <span className="span-button"></span>
                  My Games
                </a>
              </Menu.Item>
              <Menu.Item className="menu-button">
                <p style={{ color: "black" }}>Find A Game</p>
              </Menu.Item>
            </Menu>
          </Segment>
        </Container>
      </>
    );
  }
}

export default NavBar;
