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
import { AoLoadBlueprintSwap, ChivesSwapInfo, ChivesSwapBalance, ChivesSwapBalances, ChivesSwapTotalSupply, ChivesSwapGetOrder, ChivesSwapDebitNotice, ChivesSwapAddLiquidity } from '@/functions/AoConnect/ChivesSwap'
import { ansiRegex } from '@configs/functions'

const ChivesSwap = ({auth} : any) => {
  // ** Hook
  const { t } = useTranslation()

  const currentAddress = auth?.address as string

  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  const [toolInfo, setToolInfo] = useState<any>()
  const [TokenAoConnectTxIdError, setTokenAoConnectTxIdError] = useState<string>('')

  const handleSimulatedSwap = async function () {

    setIsDisabledButton(true)
    setToolInfo(null)

    const TokenProcessTxId = "0CcbtqejD67UHutSpyJ6yDTdlwE4j7vf_dGkPxNGBVA"
    if(TokenProcessTxId) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            TokenProcessTxId: TokenProcessTxId
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
      console.log("handleSimulatedSwap LoadBlueprintToken:", LoadBlueprintToken);
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
    console.log("handleSimulatedSwap LoadBlueprintToken", LoadBlueprintToken)
    */
    await sleep(2000)

    const ChivesSwapInfoData = await ChivesSwapInfo(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapInfoData: JSON.stringify(ChivesSwapInfoData)
    }))
    console.log("handleSimulatedSwap ChivesSwapInfo", ChivesSwapInfoData)

    const ChivesSwapBalanceData = await ChivesSwapBalance(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapBalanceData: JSON.stringify(ChivesSwapBalanceData)
    }))
    console.log("handleSimulatedSwap ChivesSwapBalance", ChivesSwapBalanceData)

    const ChivesSwapBalancesData = await ChivesSwapBalances(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapBalancesData: JSON.stringify(ChivesSwapBalancesData)
    }))
    console.log("handleSimulatedSwap ChivesSwapBalances", ChivesSwapBalancesData)

    const ChivesSwapTotalSupplyData = await ChivesSwapTotalSupply(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapTotalSupplyData: JSON.stringify(ChivesSwapTotalSupplyData)
    }))
    console.log("handleSimulatedSwap ChivesSwapTotalSupply", ChivesSwapTotalSupplyData)

    const ChivesSwapAddLiquidityData = await ChivesSwapAddLiquidity(TokenProcessTxId)
    setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesSwapAddLiquidityData: JSON.stringify(ChivesSwapAddLiquidityData)
    }))
    console.log("handleSimulatedSwap ChivesSwapAddLiquidity", ChivesSwapAddLiquidityData)




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
                        () => { handleSimulatedSwap() }
                    }>
                    {t("Simulated Swap")}
                    </Button>
                  </Box>
                  <Link sx={{mt: 2, mr: 2}} href={`https://github.com/chives-network/AoWalletWebsite/blob/main/blueprints/chivesswap.lua`} target='_blank'>
                      <Typography variant='body2'>
                        {t("Token Lua")}
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