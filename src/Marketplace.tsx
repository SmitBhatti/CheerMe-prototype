import { Link, ImmutableXClient, ImmutableMethodResults, ImmutableOrderStatus} from '@imtbl/imx-sdk';
import { useEffect, useState } from 'react';
require('dotenv').config();

interface MarketplaceProps {
  client: ImmutableXClient,
  link: Link
}
const Marketplace = ({client, link}: MarketplaceProps) => {
  
  const [marketplace, setMarketplace] = useState<ImmutableMethodResults.ImmutableGetOrdersResult>(Object)
  const [buyOrderId, setBuyOrderId] = useState('')
  
  

  useEffect(() => {
    load()
  }, [])

  async function load(): Promise<void> {
    const link = new Link('https://link.ropsten.x.immutable.com')
    setMarketplace(await client.getOrders({status: ImmutableOrderStatus.active, user: '0x3553f4D4F603b5a3891907365D6324712005a694'}))   
  };

  
  // buy an asset
  async function buyNFT() {
    const link = new Link('https://link.ropsten.x.immutable.com')
    await link.buy({
      orderIds:[buyOrderId]
    })
  };

  return (
    <div>
      <div>
        Buy asset:
        <br/>
        <label>
          Order ID:
          <input type="text" value={buyOrderId} onChange={e => setBuyOrderId(e.target.value)} />
        </label>
        <button className="glow-on-hover" onClick={buyNFT}>Buy</button>
      </div>
      <br/><br/><br/>
      <div>
        Marketplace (active sell orders):
        <br/>
        {JSON.stringify(marketplace.result)}
      </div>
    </div>
  );
}

export default Marketplace;
