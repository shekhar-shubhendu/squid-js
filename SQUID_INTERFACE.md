## Ocean
- Ocean(config(web3Provider, nodeURI, gas, network, providerURI))
- getInstance()
- getMessageHash(message) => hash of the given message
- createDIDRecord(content) => ocean specific DID with an id based on hash of the given string message
- registerProvider(url, provider_address)
- getProviders()

## Account 
- getAccounts() => list of accounts along with token and eth balances
- getTokenBalance()
- getEthBalance()
- requestTokens(amount) => bool

## Order
- purchaseAsset(assetDID, price, timeout, conditions)
- getOrderStatus(orderId) => integer representing the order status as defined in the keeper 
- getOrders() => list of orders
- verifyOrderPayment(orderId) => true / false

## Asset / Metadata
- publishAsset(assetDID, assetDDO, price)
- updateAsset(assetDDO)
- retireAsset(assetDID)
- getAssetPrice(assetDID)
- getAssetMetadata(assetDID) => asset DDO
- getAssetsMetadata(<search-params>) => list of assets DDOs
- resolveAssetDID(did) => DDO of the given DID
- getAssets() => asset ids from keeper
- checkAsset(assetDID) => true / false
- getAssetConditions


#######################################################
#######################################################
#######################################################
## Keeper API:
* register tribe actor
* publish service agreement conditions
* setup/execute service agreement
* fulfill condition
* dispute service delivery, quality, content, results
* submit proof of service delivery
* query transaction history
* verify actor

#######################################################
## Use cases:

### Publisher
* publish one service
  * squid.publishService(metadata) => serviceDID, didDocument
* view my published services
  * squid.listServices(type, matchStr, labels, tags, publishers))
* view my sold services
  * squid.listSoldServices(actorAddress)
* update service
  * squid.updateService(serviceDID, metadata, price)
* revoke service
  * squid.revokeService(serviceDID, reason)
  
### Consumer
* view / find services
  * squid.listServices(type, matchStr, labels, tags, publishers)
* buy/access service
  * squid.buyService(serviceId, ) => orderId, service ?
* view my purchased services
  * squid.listPurchasedServices(actorAddress)
* checkPurchaseStatus(orderId)
* dispute purchased service
  * squid.openServiceDispute(orderId)
* rate service
  * squid.rateService(orderId, rating)

### Tribe / Marketplace
* register on ocean with an `ethereum` address and DID Record
  * Uses `squid` or directly access keeper contracts
* provide API to allow the following interactions:
  * publish a service
  * update a service
  * revoke a service
  * buy/use/access a service
  * search available services
  * 
* tribe admin:
  * view publishers
  * view disputes

### Curator

### Verifier

