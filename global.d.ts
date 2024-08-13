declare global {
    interface GlobalThis {
      arweaveWallet: any; // or specify the actual type if you know it
    }
}
  
export {}; // This is necessary to make the file a module