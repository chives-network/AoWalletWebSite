// ** React Imports
import { useState, useEffect, Fragment } from 'react'


// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from '@/@core/components/icon'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { AoCreateProcessAuto, generateRandomNumber } from '@/functions/AoConnect/AoConnect'
import { AoTokenTransfer, AoTokenBalanceDryRun } from '@/functions/AoConnect/Token'

const TokenOnlySendAndMintModel = () => {
  // ** Hook
  const { t } = useTranslation()

  const currentAddress = 'auth.currentAddress'

  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  const [toolInfo, setToolInfo] = useState<any>()
  const [TokenAoConnectTxIdError, setTokenAoConnectTxIdError] = useState<string>('')

  const handleSimulatedToken = async function () {

    setIsDisabledButton(true)
    setToolInfo(null)

    const TokenProcessTxId = toolInfo.TokenProcessTxId
    if(TokenProcessTxId) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        TokenProcessTxId: TokenProcessTxId
      }))
    }

    //add random amount transfer
    for (let i = 0; i < 50; i++) {
        const AoTokenBalanceDryRunData = await AoTokenBalanceDryRun(TokenProcessTxId, TokenProcessTxId)
        console.log("AoTokenBalanceDryRunData", AoTokenBalanceDryRunData)
        const UserAdd = await AoCreateProcessAuto(globalThis.arweaveWallet);
        if (UserAdd) {
            const SendAmount = generateRandomNumber(10, 99)
            setToolInfo((prevState: any) => ({
                ...prevState,
                ["User"+i]: UserAdd + " Amount: " + SendAmount
            }));
            const AoTokenTransferData = await AoTokenTransfer(globalThis.arweaveWallet, TokenProcessTxId, UserAdd, SendAmount);
            console.log("AoTokenTransferData", AoTokenTransferData)
            const AoTokenBalanceDryRunData = await AoTokenBalanceDryRun(TokenProcessTxId, UserAdd)
            console.log("AoTokenBalanceDryRunData", AoTokenBalanceDryRunData)
        }
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
                  <Box>
                    <TextField
                        sx={{ml: 2, my: 2}}
                        size="small"
                        label={`${t('TokenProcessTxId')}`}
                        placeholder={`${t('TokenProcessTxId')}`}
                        value={toolInfo?.TokenProcessTxId ?? ''}
                        onChange={(e: any)=>{
                            if(e.target.value && e.target.value.length == 43) {
                                setTokenAoConnectTxIdError('')
                            }
                            else {
                                setTokenAoConnectTxIdError('Please set TokenProcessTxId first!')
                                setIsDisabledButton(false)
                            }
                            setToolInfo((prevState: any)=>({
                                ...prevState,
                                TokenProcessTxId: e.target.value
                            }))
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!TokenAoConnectTxIdError}
                        helperText={TokenAoConnectTxIdError}
                    />
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedToken() }
                    }>
                    {t("Simulated Token (Only Simulated Send And Mint)")}
                    </Button>
                  </Box>
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

export default TokenOnlySendAndMintModel

