import { ethers } from 'ethers';
import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType } from '@imtbl/imx-sdk';
import { ERC721TokenType, ETHTokenType } from '@imtbl/imx-sdk';
import { useEffect, useState } from 'react';
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ImLogger, WinstonLogger } from '@imtbl/imlogging';
require('dotenv').config();

interface InventoryProps {
  client: ImmutableXClient,
  link: Link,
  wallet: string
}

//import { ImmutableXClient, MintableERC721TokenType } from '@imtbl/imx-sdk';



const provider = new AlchemyProvider('ropsten', "KRHogHCIQqqMXbbI3BWT4F7ijspMepY0");
const component = 'imx-bulk-mint-script';

const waitForTransaction = async (promise: Promise<string>) => {
    const txId = await promise;
    const receipt = await provider.waitForTransaction(txId);
    if (receipt.status === 0) {
      throw new Error('Transaction rejected');
    }
    return receipt;
};



const Inventory = ({client, link, wallet}: InventoryProps) => {
  const [newTokenId, setNewTokenId] = useState(0);
  const [inventory, setInventory] = useState<ImmutableMethodResults.ImmutableGetAssetsResult>(Object);
  // minting
  const [mintTokenId, setMintTokenId] = useState('');
  const [mintBlueprint, setMintBlueprint] = useState('');
  const [mintTokenIdv2, setMintTokenIdv2] = useState('');
  const [mintBlueprintv2, setMintBlueprintv2] = useState('');

  //transfer
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferTokenAddress, setTransferTokenAddress] = useState('');
  const [transferToAddress, setTransferToAddress] = useState('');


  // buying and selling
  const [sellAmount, setSellAmount] = useState('');
  const [sellTokenId, setSellTokenId] = useState('');
  const [sellTokenAddress, setSellTokenAddress] = useState('');
  const [sellCancelOrder, setSellCancelOrder] = useState('');

  const customMint = async()  => {
    const mintToWallet = '0x3553f4D4F603b5a3891907365D6324712005a694'; // eth wallet public address which will receive the token
    const signer = new Wallet("3a541ca594c3905b4ca7a25c84be74c1d9356f21c2e211995fd0604647e87ec2").connect(provider);

    const minter = await ImmutableXClient.build({
      publicApiUrl: "https://api.ropsten.x.immutable.com/v1" , // https://api.ropsten.x.immutable.com/v1 for ropsten, https://api.x.immutable.com/v1 for mainnet
      signer: signer,
      starkContractAddress: "0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef", // 0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef for ropsten, 0x5FDCCA53617f4d2b9134B29090C87D01058e27e9 for mainnet
      registrationContractAddress: "0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864", // 0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864 for ropsten, 0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c for mainnet
      gasLimit: '7000000',
      gasPrice: '40000000000',
    });

    const registerImxResult = await minter.registerImx({
      etherKey: minter.address.toLowerCase(),
      starkPublicKey: minter.starkPublicKey,
    });

    if (registerImxResult.tx_hash === '') {
      console.info(component, 'Minter registered, continuing...');
    } else {
      console.info(component, 'Waiting for minter registration...');
      await waitForTransaction(Promise.resolve(registerImxResult.tx_hash));
    }
   
   

    const result = await minter.mintV2([
      {
        contractAddress: "0x3E75F5F6F7D87Ed13B24F2a982e5FFfd3ab92de2", // address of token
        users: [
          {
            etherKey: mintToWallet,
            tokens: [{
              id: `${newTokenId}`,
              blueprint: 'metadata'
            }]
          }]
      }
    ]);
    console.log("Minter result",result);
  }

const burntoken = async() => {
  const link = new Link('https://link.ropsten.x.immutable.com');
  await link.transfer([
    {
      type: ERC721TokenType.ERC721,
      tokenId: "53",
      tokenAddress: "0x3e75f5f6f7d87ed13b24f2a982e5fffd3ab92de2",
      toAddress: '0x0000000000000000000000000000000000000000',
    },
  ]);
}

const transferToken = async() => {
  const link = new Link('https://link.ropsten.x.immutable.com');
  await link.transfer([
  {
    type: ERC721TokenType.ERC721,
    tokenId: transferTokenId,
    tokenAddress: "0x3e75f5f6f7d87ed13b24f2a982e5fffd3ab92de2",
    toAddress: transferToAddress,
  },
  ]);
}
const GetTokenId = () =>{
  const options = {method: 'GET', headers: {Accept: 'application/json'}};

  fetch('https://api.ropsten.x.immutable.com/v1/mints?token_address=0x3E75F5F6F7D87Ed13B24F2a982e5FFfd3ab92de2', options)
    .then(response => response.json())
    // .then(response => console.log(response))
    .then(response => {
      const tempArray = response.result;
      const newArray: any[] = [];
      tempArray?.map((item: { token: { data: { token_id: any; }; }; }) => {
        newArray.push(item?.token?.data.token_id);
      })
      const latest = Math.max(...newArray);
      console.log(latest+1, latest)
      setNewTokenId(latest+1);
    })
    .catch(err => console.error(err));
}

  useEffect(() => {
    load()
  }, [])

  async function load(): Promise<void> {
    
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
    GetTokenId()
  };

  // sell an asset
  async function sellNFT() {
    await link.sell({
      amount: sellAmount,
      tokenId: sellTokenId,
      tokenAddress: sellTokenAddress
    })
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  // cancel sell order
  async function cancelSell() {
    await link.cancel({
      orderId: sellCancelOrder
    })
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  // helper function to generate random ids
  function random()
    : number {
    const min = 1;
    const max = 1000000000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }





  // the minting function should be on your backend
  async function mint() {
    // initialise a client with the minter for your NFT smart contract
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
    
    /**
    //if you want to mint on a back end server you can also provide the private key of your wallet directly to the minter. 
    //Please note: you should never share your private key and so ensure this is only done on a server that is not accessible from the internet
    const minterPrivateKey: string = process.env.REACT_APP_MINTER_PK ?? ''; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    **/
    const minter = new ethers.providers.Web3Provider(window.ethereum).getSigner(); //get Signature from Metamask wallet
    const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
    const starkContractAddress: string = process.env.REACT_APP_ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
    const registrationContractAddress: string = process.env.REACT_APP_ROPSTEN_REGISTRATION_ADDRESS ?? '';
    const minterClient = await ImmutableXClient.build({
        publicApiUrl,
        signer: minter,
        starkContractAddress,
        registrationContractAddress,
    })

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = process.env.REACT_APP_TOKEN_ADDRESS ?? ''; // contract registered by Immutable
    const result = await minterClient.mint({
      mints: [{
          etherKey: wallet,
          tokens: [{
              type: MintableERC721TokenType.MINTABLE_ERC721,
              data: {
                  id: mintTokenId, // this is the ERC721 token id
                  blueprint: mintBlueprint, // this is passed to your smart contract at time of withdrawal from L2
                  tokenAddress: token_address.toLowerCase(),
              }
          }],
          nonce: random().toString(10),
          authSignature: ''
      }]
    });
    console.log(`Token minted: ${result.results[0].token_id}`);
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

async function mintv2() {
    // initialise a client with the minter for your NFT smart contract
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
        
    /**
    //if you want to mint on a back end server you can also provide the private key of your wallet directly to the minter. 
    //Please note: you should never share your private key and so ensure this is only done on a server that is not accessible from the internet
    const minterPrivateKey: string = process.env.REACT_APP_MINTER_PK ?? ''; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    **/
    const minter = new ethers.providers.Web3Provider(window.ethereum).getSigner(); //get Signature from Metamask wallet
    const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
    const starkContractAddress: string = process.env.REACT_APP_ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
    const registrationContractAddress: string = process.env.REACT_APP_ROPSTEN_REGISTRATION_ADDRESS ?? '';
    const minterClient = await ImmutableXClient.build({
        publicApiUrl,
        signer: minter,
        starkContractAddress,
        registrationContractAddress,
    })

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = process.env.REACT_APP_TOKEN_ADDRESS ?? ''; // contract registered by Immutable
    const royaltyRecieverAddress: string = process.env.REACT_APP_ROYALTY_ADDRESS ?? '';
    const tokenReceiverAddress: string = process.env.REACT_APP_TOKEN_RECEIVER_ADDRESS ?? '';
    const result = await minterClient.mintV2([{
           users: [{
                     etherKey: tokenReceiverAddress.toLowerCase(),
                     tokens: [{
                                id: mintTokenIdv2,
                                blueprint: mintBlueprintv2,
                                // overriding royalties for specific token
                                royalties: [{                                        
                                        recipient: tokenReceiverAddress.toLowerCase(),
                                        percentage: 3.5
                                    }],
                            }]
                    }],
                contractAddress: token_address.toLowerCase(),

                // globally set royalties
                royalties: [{
                        recipient: tokenReceiverAddress.toLowerCase(),
                        percentage: 4.0
                    }]
            }]
    );
    console.log(`Token minted: ${result}`);
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  

 







  return (
    <div>
      <div>
        Mint NFT:
        <br/>
        <label>
          Token ID:
          <input type="text" value={mintTokenId} onChange={e => setMintTokenId(e.target.value)} />
        </label>
        <label>
          Blueprint:
          <input type="text" value={mintBlueprint} onChange={e => setMintBlueprint(e.target.value)} />
        </label>
        <button onClick={mint}>Mint</button>
        <button onClick={GetTokenId}>GetTokenId</button>
      </div>
      <div>
        MintV2 - with Royalties NFT:
        <br/>
        <label>
          Token ID:
          <input type="text" value={mintTokenIdv2} onChange={e => setMintTokenIdv2(e.target.value)} />
        </label>
        <label>
          Blueprint:
          <input type="text" value={mintBlueprintv2} onChange={e => setMintBlueprintv2(e.target.value)} />
        </label>
        <button onClick={mintv2}>MintV2</button>
        <button onClick={customMint}>MintV3</button>
      </div>
      <br/>
      <div>
        Sell asset (create sell order):
        <br/>
        <label>
          Amount (ETH):
          <input type="text" value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
        </label>
        <label>
          Token ID:
          <input type="text" value={sellTokenId} onChange={e => setSellTokenId(e.target.value)} />
        </label>
        <label>
          Token Address:
          <input type="text" value={sellTokenAddress} onChange={e => setSellTokenAddress(e.target.value)} />
        </label>
        <button onClick={sellNFT}>Sell</button>
      </div>
      <br/>
      
      <div>
        Cancel sell order:
        <br/>
        <label>
          Order ID:
          <input type="text" value={sellCancelOrder} onChange={e => setSellCancelOrder(e.target.value)} />
        </label>
        <button onClick={cancelSell}>Cancel</button>
      </div>
      <br/><br/><br/>
      <div>

      <div>
        Transfer NFT:
        <br/>
        <label>
          Token ID:
          <input type="text" value={transferTokenId} onChange={e => setTransferTokenId(e.target.value)} />
        </label>
        <br/>
        <label>
          Address:
          <input type="text" value={transferTokenAddress} onChange={e => setTransferTokenAddress(e.target.value)} />
        </label>
        <label>
          To Address:
          <input type="text"  value={transferToAddress} onChange={e => setTransferToAddress(e.target.value)}/>
        </label>
        <button onClick={transferToken}>Send</button>
      </div>
      
        
        Inventory:
        <button onClick={burntoken}>Burn token</button>
        {JSON.stringify(inventory.result)}
        
      </div>
    </div>
  );
}

export default Inventory;
