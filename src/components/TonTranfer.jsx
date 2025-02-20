import React, { useState } from 'react';
import TonConnect from '@tonconnect/sdk';

const TokenTransfer = () => {
  const [recipientAddress, setRecipientAddress] = useState('UQAQwryUGbBZEu7mUx11csUTaH66AM3VKuW_ZV1ZkZodJCFD');
  const [amount, setAmount] = useState('10');
  
  // Substitua pelo endereço do seu token
  const TOKEN_CONTRACT = "EQCtDfcHGCw6NSa8JsrMXBrciRUQXJbczqWuA4pR7UGwWw55";
  const DECIMALS = 9; // Ajuste conforme decimais do seu token
  
  const connector = new TonConnect({
    manifestUrl: 'https://orcmine.vercel.app/manifest.json'
  });

  const handleApprove = async () => {
    try {
      if (!connector.connected) {
        await connector.connect();
      }

      const approveData = {
        address: TOKEN_CONTRACT,
        amount: BigInt(amount * (10 ** DECIMALS)),
        payload: {
          abi: "approve",
          method: "approve",
          params: {
            spender: recipientAddress,
            amount: BigInt(amount * (10 ** DECIMALS))
          }
        }
      };
      
      const result = await connector.sendTransaction(approveData);
      console.log('Aprovação:', result);
      return true;
    } catch (error) {
      console.error('Erro na aprovação:', error);
      return false;
    }
  };

  const handleTransfer = async () => {
    try {
      const approved = await handleApprove();
      if (!approved) return;

      const transferData = {
        address: TOKEN_CONTRACT,
        amount: 0,
        payload: {
          abi: "transfer",
          method: "transfer",
          params: {
            to: recipientAddress,
            amount: BigInt(amount * (10 ** DECIMALS))
          }
        }
      };

      const result = await connector.sendTransaction(transferData);
      console.log('Transferência:', result);
      
    } catch (error) {
      console.error('Erro na transferência:', error);
    }
  };

  return (
    <div className="p-4">
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
        Transferir Token
      </button>
    </div>
  );
};

export default TokenTransfer;