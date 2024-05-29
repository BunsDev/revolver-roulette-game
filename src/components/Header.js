import React from "react";
import { signer, provider } from "../web3";
import "../css/header.css";
import { Container, Header, Menu, Segment, Icon } from "semantic-ui-react";
const ethers = require("ethers");

class NavBar extends React.Component {
  state = {
    account: null,
    connectedIcon: <Icon name="cancel" color="red" />,
    networkIcon: <Icon name="cancel" color="red" />,
    network: null,
  };

  async componentDidMount() {
    window.ethereum.on("connect", async () => {
      const networkId = await provider.getNetwork();
      this.setState({ network: networkId.chainId });
      console.log(networkId.chainId);
      window.ethereum.removeListener("connect", () => {
        console.log("Listener removed");
      });
    });

    window.ethereum.on("chainChanged", async () => {
      const networkId = await provider.getNetwork();
      this.setState({ network: networkId.chainId });
    });
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
                className="banner "
              ></div>
            </Header>
            <div
              className=""
              style={{
                minWidth: "25%",
                float: "right",
                lineHeight: "0.1",
              }}
            >
              Wallet:
              {this.props.account ? (
                <Icon name="check" color="green" />
              ) : (
                <Icon name="cancel" color="red" />
              )}
              <br />
              Network:
              {this.state.network === 43113 && window.ethereum ? (
                <Icon name="check" color="green" />
              ) : (
                <Icon name="cancel" color="red" />
              )}
            </div>

            <Menu fluid widths={4}>
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
          {this.state.error}
        </Container>
      </>
    );
  }
}

export default NavBar;
