import React, { useState } from 'react';
import TonConnect from '@tonconnect/sdk';

const TokenTransfer = () => {
  const [connected, setConnected] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('UQAQwryUGbBZEu7mUx11csUTaH66AM3VKuW_ZV1ZkZodJCFD');
  const [amount, setAmount] = useState('1');
  
  const TOKEN_CONTRACT = "EQCtDfcHGCw6NSa8JsrMXBrciRUQXJbczqWuA4pR7UGwWw55";
  const DECIMALS = 9;
  
  const connector = new TonConnect({
    manifestUrl: 'https://tonconnect-hazel.vercel.app/manifest.json',
    walletsListSource: 'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json'
  });

  const connectWallet = async () => {
    try {
      const walletsList = await connector.getWallets();
      
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile, use universal link
        const universalWallet = walletsList.find(wallet => wallet.universalLink);
        if (universalWallet) {
          await connector.connect({
            universalLink: universalWallet.universalLink,
            bridgeUrl: universalWallet.bridgeUrl
          });
        } else {
          throw new Error('No compatible mobile wallet found');
        }
      } else {
        // For browser extensions
        const browserWallet = walletsList.find(wallet => wallet.injected);
        if (browserWallet) {
          await connector.connect({
            jsBridgeKey: browserWallet.jsBridgeKey
          });
        } else {
          throw new Error('No compatible browser wallet found');
        }
      }
      
      setConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleTransfer = async () => {
    try {
      if (!connector.connected) {
        console.log('connectWallet');
        await connectWallet();
        
        await new Promise((resolve) => {
          const checkConnection = setInterval(() => {
            if (connector.connected) {
              clearInterval(checkConnection);
              resolve();
            }
          }, 500);
        });
      }

      const amountInNano = BigInt(amount) * BigInt(10 ** DECIMALS);
      
      // Minimum fees required for the transaction
      const gasAmount = BigInt(6e7);  // 0.06 TON for gas
      const forwardAmount = BigInt(4e7); // 0.04 TON for forward fee
      const totalFee = gasAmount + forwardAmount; // 0.1 TON total

      const transferData = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: TOKEN_CONTRACT,
            amount: totalFee.toString(),
            stateInit: null, // Explicitly set stateInit to null
            bounce: true,    // Enable bounce for failed transactions
            payload: {
              abi: 'jetton_wallet',
              method: 'transfer',
              params: {
                query_id: 0,
                amount: amountInNano.toString(),
                destination: recipientAddress,
                response_destination: connector.account.address,
                custom_payload: null,
                forward_ton_amount: forwardAmount.toString(),
                forward_payload: Buffer.from('').toString('base64')
              }
            }
          }
        ]
      };

      console.log('Transfer data:', transferData);
      
      const result = await connector.sendTransaction(transferData);
      console.log('Transfer result:', result);
      
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  return (
    <div className="p-4">
      {!connected ? (
        <button 
          onClick={connectWallet}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Conectar Wallet
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Endereço do destinatário"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="number"
            placeholder="Quantidade de tokens"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleTransfer}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Transfer
          </button>
        </>
      )}
    </div>
  );
};

export default TokenTransfer;
