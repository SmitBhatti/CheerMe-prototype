import './App.css';
import { Link, ImmutableXClient, ImmutableMethodResults} from '@imtbl/imx-sdk';
import { useEffect, useState } from 'react';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
import Bridging from './Bridging';
require('dotenv').config();

const App = () => {
  // initialise Immutable X Link SDK
  const link = new Link(process.env.REACT_APP_ROPSTEN_LINK_URL)
  
  // general
  const [tab, setTab] = useState('marketplace');
  const [wallet, setWallet] = useState('undefined');
  const [balance, setBalance] = useState<ImmutableMethodResults.ImmutableGetBalanceResult>(Object);
  const [client, setClient] = useState<ImmutableXClient>(Object);


  useEffect(() => {
    buildIMX()
  }, [])

  // initialise an Immutable X Client to interact with apis more easily
  async function buildIMX() {
    const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
    setClient(await ImmutableXClient.build({publicApiUrl}))
  }

  // register and/or setup a user
  async function linkSetup(): Promise<void> {
    const res = await link.setup({})
    setWallet(res.address)
    setBalance(await client.getBalance({user: res.address, tokenAddress: 'eth'}))
  };

  function handleTabs() {
    if (client.address) {
      switch (tab) {
        case 'inventory':
          if (wallet === 'undefined') return <div>Connect wallet</div>
          return <Inventory
            client={client}
            link={link}
            wallet={wallet}
          />
        case 'bridging':
          if (wallet === 'undefined') return <div>Connect wallet</div>
          return <Bridging
            client={client}
            link={link}
            wallet={wallet}
          />
        default:
          return <Marketplace
            client={client}
            link={link}
          />
      }
    }
    return null
  }

  return (
    <div className="App">
      <div className = "CheerMeHeader">
        <h1> Welcome to CheerMe trading platform</h1>
      </div>
      <button className="glow-on-hover" type="button" onClick={linkSetup}>Setup your wallet</button>
      <div>
        <br/>
        Active wallet: {wallet}
        <br/><br/>
      </div>
      <div>
        ETH balance (in wei): {balance?.balance?.toString()}
        <br/>
      </div>
      <button className="button-28" type="button" onClick={() => setTab('marketplace')}>Marketplace</button><br/><br/>
      <button className="button-28" type="button" onClick={() => setTab('inventory')}>My Inventory</button><br/><br/>
      <button className="button-28" type="button" onClick={() => setTab('bridging')}>Deposit and withdrawal</button><br/><br/>
      <br/><br/><br/>
      {handleTabs()}
    </div>
  );
}

export default App;
