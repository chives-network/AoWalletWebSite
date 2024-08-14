// ** React Imports
import { useState, useEffect, Fragment } from 'react'

import { BigNumber } from 'bignumber.js';

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

import { GetMyLastMsg, AoCreateProcessAuto, generateRandomNumber, sleep, FormatBalance } from '@/functions/AoConnect/AoConnect'
import { AoLoadBlueprintToken, AoTokenTransfer, AoTokenMint, AoTokenBalancesDryRun } from '@/functions/AoConnect/Token'
import { ansiRegex } from '@configs/functions'

const TokenModel = ({auth} : any) => {
  // ** Hook
  const { t } = useTranslation()

  const currentAddress = auth?.address as string

  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  const [toolInfo, setToolInfo] = useState<any>()
  const [tokenInfo, setTokenInfo] = useState<any>()

  const handleSimulatedToken = async function () {

    setIsDisabledButton(true)
    setToolInfo(null)

    const TokenProcessTxId = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(TokenProcessTxId) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        TokenProcessTxId: TokenProcessTxId
      }))
    }

    await sleep(2000)

    const UserOne = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserOne) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserOne: UserOne
      }))
    }

    await sleep(2000)

    const UserTwo = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserTwo) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserTwo: UserTwo
      }))
    }

    await sleep(2000)

    const UserThree = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserThree) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserThree: UserThree
      }))
    }

    await sleep(5000)

    console.log("handleSimulatedToken tokenInfo", tokenInfo)
    let LoadBlueprintToken: any = await AoLoadBlueprintToken(globalThis.arweaveWallet, currentAddress, TokenProcessTxId, tokenInfo);
    while(LoadBlueprintToken && LoadBlueprintToken.status == 'ok' && LoadBlueprintToken.msg && LoadBlueprintToken.msg.error)  {
      sleep(6000)
      LoadBlueprintToken = await AoLoadBlueprintToken(globalThis.arweaveWallet, currentAddress, TokenProcessTxId, tokenInfo);
      console.log("handleSimulatedToken LoadBlueprintToken:", LoadBlueprintToken);
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
    console.log("handleSimulatedToken LoadBlueprintToken", LoadBlueprintToken)

    await sleep(2000)

    const SendTokenToUserOneData = await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserOne, 1001)
    if(SendTokenToUserOneData) {
      console.log("SendTokenToUserOneData", SendTokenToUserOneData)
      if(SendTokenToUserOneData?.msg?.error)  {
        setToolInfo((prevState: any)=>({
          ...prevState,
          SendUserOne1001: SendTokenToUserOneData?.msg?.error
        }))
      }
      if(SendTokenToUserOneData?.msg?.Output?.data?.output)  {
        const formatText = SendTokenToUserOneData?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            SendUserOne1001: formatText
          }))

          //Read message from inbox
          const UserOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, UserOne)
          if(UserOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = UserOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                SendUserOne1001: formatText2
              }))
            }
          }

        }

      }
    }

    await sleep(2000)
  
    const SendTokenToUserTwoData = await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserTwo, 1002)
    if(SendTokenToUserTwoData) {
      console.log("SendTokenToUserTwoData", SendTokenToUserTwoData)
      if(SendTokenToUserTwoData?.msg?.error)  {
        setToolInfo((prevState: any)=>({
          ...prevState,
          SendUserTwo1002: SendTokenToUserTwoData?.msg?.error
        }))
      }
      if(SendTokenToUserTwoData?.msg?.Output?.data?.output)  {
        const formatText = SendTokenToUserTwoData?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            SendUserTwo1002: formatText
          }))

          //Read message from inbox
          const UserTwoInboxData = await GetMyLastMsg(globalThis.arweaveWallet, UserTwo)
          if(UserTwoInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = UserTwoInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                SendUserTwo1002: formatText2
              }))
            }
          }

        }

      }
    }

    await sleep(2000)

    const SendTokenToUserThreeData = await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserThree, 1003)
    if(SendTokenToUserThreeData) {
      console.log("SendTokenToUserThreeData", SendTokenToUserThreeData)
      if(SendTokenToUserThreeData?.msg?.error)  {
        setToolInfo((prevState: any)=>({
          ...prevState,
          SendUserThree1003: SendTokenToUserThreeData?.msg?.error
        }))
      }
      if(SendTokenToUserThreeData?.msg?.Output?.data?.output)  {
        const formatText = SendTokenToUserThreeData?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            SendUserThree1003: formatText
          }))

          //Read message from inbox
          const UserThreeInboxData = await GetMyLastMsg(globalThis.arweaveWallet, UserThree)
          if(UserThreeInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = UserThreeInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                SendUserThree1003: formatText2
              }))
            }
          }

        }

      }
    }

    await sleep(2000)

    const MintTokenData = await AoTokenMint(globalThis.arweaveWallet, TokenProcessTxId, 2000)
    if(MintTokenData) {
      console.log("MintTokenData", MintTokenData)
      if(MintTokenData?.msg?.Output?.data?.output)  {
        const formatText = MintTokenData?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            Mint2000: formatText
          }))

          //Read message from inbox
          const MintTokenInboxData = await GetMyLastMsg(globalThis.arweaveWallet, TokenProcessTxId)
          if(MintTokenInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = MintTokenInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                Mint2000: formatText2
              }))
            }
          }

        }

      }
    }

    await sleep(2000)
    
    //add random amount transfer
    const UserAdd1 = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserAdd1) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserAdd1: UserAdd1
      }))
      await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserAdd1, generateRandomNumber(1111, 9999) )
    }

    await sleep(2000)

    const UserAdd2 = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserAdd2) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserAdd2: UserAdd2
      }))
      await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserAdd2, generateRandomNumber(1111, 9999) )
    }

    await sleep(2000)

    const UserAdd3 = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserAdd3) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserAdd3: UserAdd3
      }))
      await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserAdd3, generateRandomNumber(1111, 9999) )
    }

    setToolInfo((prevState: any)=>({
      ...prevState,
      WaitSeconds: '5s..........................'
    }))

    await sleep(5000)

    const AoDryRunBalances = await AoTokenBalancesDryRun(TokenProcessTxId)
    if(AoDryRunBalances) {
      console.log("AoDryRunBalances", AoDryRunBalances)
      const AoDryRunBalancesJson = JSON.parse(AoDryRunBalances)
      const AoDryRunBalancesJsonSorted = Object.entries(AoDryRunBalancesJson)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .reduce((acc: any, [key, value]) => {
                            acc[key] = FormatBalance(Number(value), 12);
                            
                            return acc;
                        }, {} as { [key: string]: number });
      const TokenMap = Object.values(AoDryRunBalancesJsonSorted)
      const TokenHolders = TokenMap.length
      let CirculatingSupply = BigNumber(0)
      TokenMap.map((Item: any)=>{
        CirculatingSupply = CirculatingSupply.plus(Item)
      })
      setToolInfo((prevState: any)=>({
        ...prevState,
        TokenBalances: AoDryRunBalancesJsonSorted,
        TokenHolders: TokenHolders,
        CirculatingSupply: CirculatingSupply.toString()
      }))
      console.log("AoDryRunBalances", AoDryRunBalancesJsonSorted, "TokenHolders", TokenHolders)
    }

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
                  <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                      () => { handleSimulatedToken() }
                  }>
                  {t("Simulated Token")}
                  </Button>
                  <Link sx={{mt: 2, mr: 2}} href={`https://github.com/chives-network/AoWalletWebsite/blob/main/blueprints/chivestoken.lua`} target='_blank'>
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

                <TextField
                    sx={{ml: 2, my: 2, width: '200px'}}
                    size="small"
                    label={`${t('Name')}`}
                    placeholder={`${t('Name')}`}
                    value={tokenInfo?.Name ?? 'AoConnectToken'}
                    onChange={(e: any)=>{
                      setTokenInfo((prevState: any)=>({
                        ...prevState,
                        Name: e.target.value
                      }))
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                            <Icon icon='mdi:account-outline' />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    sx={{ml: 2, my: 2, width: '200px'}}
                    size="small"
                    label={`${t('Ticker')}`}
                    placeholder={`${t('Ticker')}`}
                    value={tokenInfo?.Ticker ?? 'AOCN'}
                    onChange={(e: any)=>{
                      setTokenInfo((prevState: any)=>({
                        ...prevState,
                        Ticker: e.target.value
                      }))
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                            <Icon icon='mdi:account-outline' />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    sx={{ml: 2, my: 2, width: '200px'}}
                    size="small"
                    type="number"
                    label={`${t('Balance')}`}
                    placeholder={`${t('Balance')}`}
                    value={tokenInfo?.Balance ?? 9999}
                    onChange={(e: any)=>{
                      setTokenInfo((prevState: any)=>({
                        ...prevState,
                        Balance: e.target.value
                      }))
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                            <Icon icon='mdi:account-outline' />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField
                    sx={{ml: 2, my: 2}}
                    size="small"
                    label={`${t('Logo')}`}
                    placeholder={`${t('Logo')}`}
                    value={tokenInfo?.Logo ?? 'dFJzkXIQf0JNmJIcHB-aOYaDNuKymIveD2K60jUnTfQ'}
                    onChange={(e: any)=>{
                      setTokenInfo((prevState: any)=>({
                        ...prevState,
                        Logo: e.target.value
                      }))
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                            <Icon icon='mdi:account-outline' />
                            </InputAdornment>
                        )
                    }}
                />

                {toolInfo && Object.keys(toolInfo).map((Item: any, Index: number)=>{

                  return (
                    <Fragment key={Index}>
                      {Item && Item!="TokenBalances" && (
                        <Tooltip title={toolInfo[Item]}>
                          <Grid sx={{my: 2}}>
                            <Typography noWrap variant='body2' sx={{display: 'inline', mr: 1}}>{Item}:</Typography>
                            <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main'}}>{toolInfo[Item]}</Typography>
                          </Grid>
                        </Tooltip>
                      )}
                    </Fragment>
                  )

                })}
                
                <Typography noWrap variant='body2' sx={{my: 2}}>
                  Token Balances: 
                </Typography>
                {toolInfo && toolInfo.TokenBalances && Object.keys(toolInfo.TokenBalances).map((Item: string, Index: number)=>{

                  return (
                    <Fragment key={Index}>
                      <Box sx={{color: 'primary.main'}}>
                        <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main', pr: 3}}>{Index}</Typography>
                        <Typography noWrap variant='body2' sx={{display: 'inline', color: 'info.main', pr: 3}}>{Item}</Typography>
                        <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main', pr: 3}}>{toolInfo.TokenBalances[Item]}</Typography>
                      </Box>
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

export default TokenModel

