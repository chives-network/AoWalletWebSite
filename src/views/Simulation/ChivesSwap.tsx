// ** React Imports
import { useState, useEffect, Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from '@/@core/components/icon'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { AoCreateProcessAuto, generateRandomNumber, sleep } from '@/functions/AoConnect/AoConnect'
import { AoLoadBlueprintSwap, ChivesSwapInfo, ChivesSwapBalance, ChivesSwapBalances, ChivesSwapTotalSupply, ChivesSwapGetOrder, ChivesSwapDebitNotice, ChivesSwapAddLiquidity, ChivesSwapSendTokenToSwap } from '@/functions/AoConnect/ChivesSwap'
import { AoLoadBlueprintToken, AoTokenTransfer, AoTokenMint, AoTokenBalancesDryRun } from '@/functions/AoConnect/Token'
import { ansiRegex } from '@configs/functions'

const ChivesSwap = ({auth} : any) => {
  // ** Hook
  const { t } = useTranslation()

  const currentAddress = auth?.address as string

  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  const [toolInfo, setToolInfo] = useState<any>()
  const [TokenAoConnectTxIdError, setTokenAoConnectTxIdError] = useState<string>('')

  const TokenProcessTxId = "DCITJ5AlPjHTSq8pApRZ1e23qEaDx__Wbx1g5w9x_8c"
  const X = "UKkF0_BZ-SpEjUn6v1qjW9sZDSr8ny9GYpnocNipQ9Q"
  const Y = "UAGSgMlv9c806Wfbu85RZHlRDR2WGuPQCi7ShDtLlvw"

  const handleSimulatedSwapInfo = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }

    const ChivesSwapInfoData = await ChivesSwapInfo(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapInfoDataLine: '--------------------------------------------------------',
        ...ChivesSwapInfoData
    }))
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapInfo", ChivesSwapInfoData)

  }

  const handleSimulatedSwapBalances = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }

    const ChivesSwapBalancesData = await ChivesSwapBalances(TokenProcessTxId)
    console.log("handleSimulatedSwapBalances ChivesSwapBalances", ChivesSwapBalancesData)
    if(ChivesSwapBalancesData && ChivesSwapBalancesData['BalancesX'])   {
      setToolInfo((prevState: any)=>({
          ...prevState,
          Balances: JSON.stringify(ChivesSwapBalancesData['Balances']),
          BalancesX: JSON.stringify(ChivesSwapBalancesData['BalancesX']),
          BalancesY: JSON.stringify(ChivesSwapBalancesData['BalancesY']),
      }))
    }
    console.log("handleSimulatedSwapBalances ChivesSwapBalances", ChivesSwapBalancesData)

  }

  const handleSimulatedSwapGetOrder = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }

    const OrderId = 'P4YjT7SdlNrAbsMPZ2XGnw9GFR7S5djoswNjojDi8jw'
    const ChivesSwapGetOrderData = await ChivesSwapGetOrder(TokenProcessTxId, OrderId)
    console.log("ChivesSwapGetOrderData", ChivesSwapGetOrderData)

    if(ChivesSwapGetOrderData) {
      setToolInfo((prevState: any)=>({
          ...prevState,
          ChivesSwapGetOrderDataLine: '---------------------------------------------------',
          ...ChivesSwapGetOrderData
      }))
    }

  }

  const handleSimulatedSwapWithdraw = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }

  }

  const handleSimulatedSwapAddLiquidity = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }
    /*
    const TokenProcessTxId = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(TokenProcessTxId) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        TokenProcessTxId: TokenProcessTxId
      }))
    }

    await sleep(2000)

    let LoadBlueprintToken: any = await AoLoadBlueprintSwap(globalThis.arweaveWallet, TokenProcessTxId, toolInfo);
    while(LoadBlueprintToken && LoadBlueprintToken.status == 'ok' && LoadBlueprintToken.msg && LoadBlueprintToken.msg.error)  {
      sleep(6000)
      LoadBlueprintToken = await AoLoadBlueprintSwap(globalThis.arweaveWallet, TokenProcessTxId, toolInfo);
      console.log("handleSimulatedSwapAddLiquidity LoadBlueprintToken:", LoadBlueprintToken);
    }
    if(LoadBlueprintToken) {
      if(LoadBlueprintToken?.msg?.Output?.data?.output)  {
        const formatText = LoadBlueprintToken?.msg?.Output?.data?.output.replace(ansiRegex, '');
        setToolInfo((prevState: any)=>({
          ...prevState,
          LoadBlueprintToken: formatText
        }))
      }
    }
    console.log("handleSimulatedSwapAddLiquidity LoadBlueprintToken", LoadBlueprintToken)
    */

    await sleep(2000)

    const SendToSwapTokenX = await AoTokenTransfer(globalThis.arweaveWallet, X, TokenProcessTxId, 11, 3);
    console.log("SendToSwapTokenX", SendToSwapTokenX)
    setToolInfo((prevState: any)=>({
      ...prevState,
      SendToSwapTokenX1: SendToSwapTokenX?.msg?.Messages && SendToSwapTokenX?.msg?.Messages[0]?.Data.replace(ansiRegex, ''),
      SendToSwapTokenX2: SendToSwapTokenX?.msg?.Messages && SendToSwapTokenX?.msg?.Messages[1]?.Data.replace(ansiRegex, '')
    }))

    const SendToSwapTokenY = await AoTokenTransfer(globalThis.arweaveWallet, Y, TokenProcessTxId, 40, 3);
    console.log("SendToSwapTokenY", SendToSwapTokenY)
    setToolInfo((prevState: any)=>({
      ...prevState,
      SendToSwapTokenY1: SendToSwapTokenY?.msg?.Messages && SendToSwapTokenY?.msg?.Messages[0]?.Data.replace(ansiRegex, ''),
      SendToSwapTokenY2: SendToSwapTokenY?.msg?.Messages && SendToSwapTokenY?.msg?.Messages[1]?.Data.replace(ansiRegex, '')
    }))

    const ChivesSwapInfoData = await ChivesSwapInfo(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapInfoData: JSON.stringify(ChivesSwapInfoData)
    }))
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapInfo", ChivesSwapInfoData)

    const ChivesSwapBalancesData1 = await ChivesSwapBalances(TokenProcessTxId)
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapBalances", ChivesSwapBalancesData1)
    if(ChivesSwapBalancesData1 && ChivesSwapBalancesData1['BalancesX'])   {
      setToolInfo((prevState: any)=>({
          ...prevState,
          Balances1: JSON.stringify(ChivesSwapBalancesData1['Balances']),
          BalancesX1: ChivesSwapBalancesData1['BalancesX'][currentAddress],
          BalancesY1: ChivesSwapBalancesData1['BalancesY'][currentAddress]
      }))
    }

    //await sleep(2000)

    const MinLiquidity = '100'
    const ChivesSwapAddLiquidityData = await ChivesSwapAddLiquidity(globalThis.arweaveWallet, TokenProcessTxId, MinLiquidity)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapAddLiquidityData: JSON.stringify(ChivesSwapAddLiquidityData)
    }))
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapAddLiquidity", ChivesSwapAddLiquidityData)
    if(ChivesSwapAddLiquidityData)   {
      setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapAddLiquidityData1: ChivesSwapAddLiquidityData?.msg?.Messages && ChivesSwapAddLiquidityData?.msg?.Messages[0]?.Data,
        ChivesSwapAddLiquidityData2: ChivesSwapAddLiquidityData?.msg?.Messages && ChivesSwapAddLiquidityData?.msg?.Messages[1]?.Data,
        ChivesSwapAddLiquidityData3: ChivesSwapAddLiquidityData?.msg?.Messages && ChivesSwapAddLiquidityData?.msg?.Messages[2]?.Data
      }))
    }

    const ChivesSwapBalanceData = await ChivesSwapBalance(TokenProcessTxId, currentAddress)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapBalanceData: JSON.stringify(ChivesSwapBalanceData)
    }))
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapBalance", ChivesSwapBalanceData)

    const ChivesSwapBalancesData2 = await ChivesSwapBalances(TokenProcessTxId)
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapBalances", ChivesSwapBalancesData2)
    if(ChivesSwapBalancesData2 && ChivesSwapBalancesData2['BalancesX'])   {
      setToolInfo((prevState: any)=>({
          ...prevState,
          Balances2: JSON.stringify(ChivesSwapBalancesData2['Balances']),
          BalancesX2: ChivesSwapBalancesData2['BalancesX'][currentAddress],
          BalancesY2: ChivesSwapBalancesData2['BalancesY'][currentAddress]
      }))
    }

    /*
    const ChivesSwapTotalSupplyData = await ChivesSwapTotalSupply(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapTotalSupplyData: JSON.stringify(ChivesSwapTotalSupplyData)
    }))
    console.log("handleSimulatedSwapAddLiquidity ChivesSwapTotalSupply", ChivesSwapTotalSupplyData)

    
    */



    setToolInfo((prevState: any)=>({
      ...prevState,
      ExecuteStatus: 'All Finished.'
    }))

    setIsDisabledButton(false)

  }

  const handleSimulatedSwapRemoveLiquidity = async function () {
  }

  const handleSimulatedSwap = async function () {

    //setIsDisabledButton(true)
    setToolInfo(null)

    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId,
            X: X,
            Y: Y
        }))
    }
    
    const handleSimulatedSwapData: any = await ChivesSwapSendTokenToSwap(globalThis.arweaveWallet, X, TokenProcessTxId, 0.1, 3, '1')
    setToolInfo((prevState: any)=>({
        ...prevState,
        handleSimulatedSwapData: JSON.stringify(handleSimulatedSwapData)
    }))
    console.log("handleSimulatedSwap ChivesSwapSendTokenToSwap", handleSimulatedSwapData)
    if(handleSimulatedSwapData)   {
      setToolInfo((prevState: any)=>({
        ...prevState,
        handleSimulatedSwapData1: handleSimulatedSwapData?.msg?.Messages && handleSimulatedSwapData?.msg?.Messages[0]?.Data.replace(ansiRegex, ''),
        handleSimulatedSwapData2: handleSimulatedSwapData?.msg?.Messages && handleSimulatedSwapData?.msg?.Messages[1]?.Data.replace(ansiRegex, '')
      }))
    }

    if(handleSimulatedSwapData && handleSimulatedSwapData.id)   {
      const ChivesSwapGetOrderData = await ChivesSwapGetOrder(TokenProcessTxId, handleSimulatedSwapData.id)
      console.log("ChivesSwapGetOrderData", ChivesSwapGetOrderData)

      if(ChivesSwapGetOrderData) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesSwapGetOrderDataLine: '---------------------------------------------------',
            ...ChivesSwapGetOrderData
        }))
      }
    }
    
    /*
    const ChivesSwapBalanceData = await ChivesSwapBalance(TokenProcessTxId, currentAddress)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapBalanceData: JSON.stringify(ChivesSwapBalanceData)
    }))
    //console.log("handleSimulatedSwap ChivesSwapBalance", ChivesSwapBalanceData)

    const ChivesSwapBalancesData2 = await ChivesSwapBalances(TokenProcessTxId)
    //console.log("handleSimulatedSwap ChivesSwapBalances", ChivesSwapBalancesData2)
    if(ChivesSwapBalancesData2 && ChivesSwapBalancesData2['BalancesX'])   {
      setToolInfo((prevState: any)=>({
          ...prevState,
          Balances2: JSON.stringify(ChivesSwapBalancesData2['Balances']),
          BalancesX2: ChivesSwapBalancesData2['BalancesX'][currentAddress],
          BalancesY2: ChivesSwapBalancesData2['BalancesY'][currentAddress]
      }))
    }
    */

    setToolInfo((prevState: any)=>({
      ...prevState,
      ExecuteStatus: 'All Finished.'
    }))

    setIsDisabledButton(false)

  }


  //Loading the all Inbox to IndexedDb
  useEffect(() => {
    //GetMyInboxMsgFromAoConnect()
  }, [])

  return (
    <Fragment>
      {currentAddress ?
      <Grid container>
        <Grid item xs={12}>
          <Card>
              <Grid item sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapAddLiquidity() }
                    }>
                    {t("Add Liquidity")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwap() }
                    }>
                    {t("Swap")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapInfo() }
                    }>
                    {t("Info")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapBalances() }
                    }>
                    {t("Balances")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapGetOrder() }
                    }>
                    {t("getOrder")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapWithdraw() }
                    }>
                    {t("Withdraw")}
                    </Button>
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedSwapRemoveLiquidity() }
                    }>
                    {t("Remove Liquidity")}
                    </Button>
                  </Box>
                  <Link sx={{mt: 2, mr: 2}} href={`https://github.com/chives-network/AoWalletWebsite/blob/main/blueprints/chivesswap.lua`} target='_blank'>
                      <Typography variant='body2'>
                        {t("Lua")}
                      </Typography>
                  </Link>
              </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} sx={{my: 2}}>
          <Card>
              <Grid item sx={{ display: 'column', m: 2 }}>
                
                <Grid sx={{my: 2}}>
                  <Typography noWrap variant='body2' sx={{display: 'inline', mr: 1}}>CurrentAddress:</Typography>
                  <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main'}}>{currentAddress}</Typography>
                </Grid>
                

                {toolInfo && Object.keys(toolInfo).map((Item: any, Index: number)=>{

                  return (
                    <Fragment key={Index}>
                      <Tooltip title={toolInfo[Item]}>
                        <Grid sx={{my: 2}}>
                          <Typography noWrap variant='body2' sx={{display: 'inline', mr: 1}}>{Item}:</Typography>
                          <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main'}}>{toolInfo[Item]}</Typography>
                        </Grid>
                      </Tooltip>
                    </Fragment>
                  )

                })}


              </Grid>
          </Card>
        </Grid>
      </Grid>
      :
      null
      }
    </Fragment>
  )
}

export default ChivesSwap

/*
function getInputPrice(amountIn: bigint, reserveIn: bigint, reserveOut: bigint, fee: number): bigint {
    const FEE_DENOMINATOR = 10000;
    const amountInWithFee = amountIn * BigInt(FEE_DENOMINATOR - fee);
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * BigInt(FEE_DENOMINATOR)) + amountInWithFee;
    return numerator / denominator;
}

// 示例用法
const amountIn = BigInt(1000); // 输入代币数量
const reserveIn = BigInt(10000); // 输入代币储备量
const reserveOut = BigInt(20000); // 输出代币储备量
const fee = 100; // 1% 手续费

const outputAmount = getInputPrice(amountIn, reserveIn, reserveOut, fee);
console.log(`Output amount: ${outputAmount.toString()}`);
*/