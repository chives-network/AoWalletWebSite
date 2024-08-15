'use client'

// ** React Imports
import { useState, useEffect, Fragment } from 'react'
import { Clipboard } from '@capacitor/clipboard';

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import authConfig from '../../configs/auth'
import CustomAvatar from '../../@core/components/mui/Avatar'
import Icon from '../../@core/components/icon'
import Divider from '@mui/material/Divider'
import Backdrop from '@mui/material/Backdrop'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { styled } from '@mui/material/styles'
import { formatHash } from '../../configs/functions'
import { FormatBalance } from '../../functions/AoConnect/AoConnect'
import FaucetHelpText from '@views/Help/Faucet'

import { useAuth } from '@/hooks/useAuth'
import { getAllAoFaucets, setAllAoFaucets, getMyAoFaucetTokenBalance, setMyAoFaucetTokenBalance, addMyAoToken } from '../../functions/ChivesWallets'
import { GetAppAvatar, AoTokenBalanceDryRun, AoTokenInfoDryRun } from '../../functions/AoConnect/Token'
import { AoFaucetGetFaucet, AoFaucetInfo } from '../../functions/AoConnect/ChivesFaucet'

import { ChivesServerDataGetFaucets } from '../../functions/AoConnect/ChivesServerData'
import { MyProcessTxIdsAddToken } from '../../functions/AoConnect/MyProcessTxIds'

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const Faucet = () => {
  // ** Hook
  const { t } = useTranslation()
  const auth = useAuth()

  const encryptWalletDataKey = "encryptWalletDataKey"

  const [loadingWallet, setLoadingWallet] = useState<number>(0)

  const contentHeightFixed = {}

  const [currentAddress, setCurrentAddress] = useState<string>("")
  
  const [allFaucetsData, setAllFaucetsData] = useState<any[]>([])
  const [myFaucetTokenBalanceData, setMyFaucetTokenBalanceData] = useState<any[]>([])
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)

  useEffect(()=>{
    if(auth && auth.connected == false) {
        setLoadingWallet(2)
    }
    if(auth && auth.connected == true && auth.address && auth.address.length == 43) {
        setLoadingWallet(1)
        setCurrentAddress(auth.address)
    }
  }, [auth])

  const [windowWidth, setWindowWidth] = useState('1152px');
  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth >=1920)   {
        setWindowWidth('1392px');
      }
      else if(window.innerWidth < 1920 && window.innerWidth > 1440)   {
        setWindowWidth('1152px');
      }
      else if(window.innerWidth <= 1440 && window.innerWidth > 1200)   {
        setWindowWidth('1152px');
      }
      else if(window.innerWidth <= 1200 && window.innerWidth > 900)   {
        setWindowWidth('852px');
      }
      else if(window.innerWidth <= 900)   {
        setWindowWidth('90%');
      }
      console.log("window.innerWidth1 ", window.innerWidth)
      console.log("window.windowWidth2 ", windowWidth)
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleGetAllFaucetsData = async () => {

    const getAllAoFaucetsData = getAllAoFaucets(currentAddress, encryptWalletDataKey)
    if(getAllAoFaucetsData) {   
      setAllFaucetsData(getAllAoFaucetsData)
    }
    if(getAllAoFaucetsData.length == 0) {
      setIsDisabledButton(true)
    }
    console.log("getAllAoFaucetsData", getAllAoFaucetsData, currentAddress)
    
    try {
      const ChivesServerDataGetFaucetsData1 = await ChivesServerDataGetFaucets(authConfig.AoConnectChivesServerTxId, authConfig.AoConnectChivesServerUser)
      if(ChivesServerDataGetFaucetsData1) {
          const dataArray = Object.values(ChivesServerDataGetFaucetsData1);
          dataArray.sort((a: any, b: any) => {
              if (a.FaucetGroup == b.FaucetGroup) {
                  return Number(a.FaucetSort) - Number(b.FaucetSort);
              } else {
                  return a.FaucetGroup.localeCompare(b.FaucetGroup);
              }
          });
          console.log("ChivesServerDataGetFaucetsData1 dataArray", dataArray)
          const dataArrayFilter = dataArray.map((Faucet: any)=>{
            const FaucetDataJson = JSON.parse(Faucet.FaucetData.replace(/\\"/g, '"'))
            
            return {...Faucet, FaucetData: FaucetDataJson}
          })
          console.log("handleGetAllFaucetsData FaucetDataJson", dataArrayFilter)
          setAllAoFaucets(currentAddress, dataArrayFilter, encryptWalletDataKey)
          setAllFaucetsData(dataArrayFilter)
          console.log("handleGetAllFaucetsData dataArrayFilter", dataArrayFilter)
      }
    }
    catch(e: any) {
      console.log("handleGetAllFaucetsData Error", e)  
      setIsDisabledButton(false)    
    }

  }

  const handelGetAmountFromFaucet = async (Faucet: any) => {
    if( Faucet && Faucet.FaucetId && currentAddress.length == 43 )   {
      setIsDisabledButton(true)

      const GetFaucetFromFaucetTokenId: any = await AoFaucetGetFaucet(globalThis.arweaveWallet, Faucet.FaucetId)
      if(GetFaucetFromFaucetTokenId && GetFaucetFromFaucetTokenId.msg && GetFaucetFromFaucetTokenId.msg.Error) {
        toast.error(GetFaucetFromFaucetTokenId.msg.Error, {
          duration: 2500
        })
        setIsDisabledButton(false)

        return
      }
      if(GetFaucetFromFaucetTokenId?.msg?.Messages && GetFaucetFromFaucetTokenId?.msg?.Messages.length == 1) {
        const Messages = GetFaucetFromFaucetTokenId?.msg?.Messages
        if(Messages[0].Tags && Messages[0].Tags[6] && Messages[0].Tags[6].name == 'Error')  {
          toast.error(Messages[0].Tags[6].value, {
            duration: 2500
          })
          setIsDisabledButton(false)

          return
        }
      }
      if(GetFaucetFromFaucetTokenId?.msg?.Messages && GetFaucetFromFaucetTokenId?.msg?.Messages[4]?.Data) {
        console.log("GetFaucetFromFaucetTokenId", GetFaucetFromFaucetTokenId?.msg?.Messages[4]?.Data)
        toast.success(GetFaucetFromFaucetTokenId?.msg?.Messages[4]?.Data, {
          duration: 2000
        })

        const AoFaucetInfoData = await AoFaucetInfo(Faucet.FaucetId)
        console.log("AoFaucetInfoData AoFaucetInfo", AoFaucetInfoData)

        //Get my wallet address balance
        const AoDryRunBalance: any = await AoTokenBalanceDryRun(AoFaucetInfoData.FaucetTokenId, currentAddress);
        if (AoDryRunBalance && AoFaucetInfoData) {
          const getMyAoFaucetTokenBalanceData = getMyAoFaucetTokenBalance(currentAddress, encryptWalletDataKey);
          const AoDryRunBalanceCoin = FormatBalance(AoDryRunBalance, AoFaucetInfoData.Denomination ? AoFaucetInfoData.Denomination : '12');
          const AoDryRunBalanceCoinFormat = Number(AoDryRunBalanceCoin) > 0 ? Number(AoDryRunBalanceCoin).toFixed(4).replace(/\.?0*$/, '') : 0;
          setMyAoFaucetTokenBalance(currentAddress, {...getMyAoFaucetTokenBalanceData, [AoFaucetInfoData.FaucetTokenId]: AoDryRunBalanceCoinFormat}, encryptWalletDataKey); // Immediately update the local storage balance
          console.log("AoDryRunBalanceCoinFormat1-1", AoFaucetInfoData.FaucetTokenId, AoDryRunBalanceCoinFormat)
          setMyFaucetTokenBalanceData((prevState: any)=>({
            ...prevState, 
            [AoFaucetInfoData.FaucetTokenId]: AoDryRunBalanceCoinFormat
          }))
        }

        //Get faucet address balance
        const AoDryRunFaucetBalance: any = await AoTokenBalanceDryRun(AoFaucetInfoData.FaucetTokenId, Faucet.FaucetId);
        if (AoDryRunFaucetBalance && Faucet) {
          const getMyAoFaucetTokenBalanceData = getMyAoFaucetTokenBalance(currentAddress, encryptWalletDataKey);
          const AoDryRunBalanceCoin = FormatBalance(AoDryRunFaucetBalance, AoFaucetInfoData.Denomination ? AoFaucetInfoData.Denomination : '12');
          const AoDryRunBalanceCoinFormat = Number(AoDryRunBalanceCoin) > 0 ? Number(AoDryRunBalanceCoin).toFixed(4).replace(/\.?0*$/, '') : 0;
          setMyAoFaucetTokenBalance(currentAddress, {...getMyAoFaucetTokenBalanceData, [Faucet.FaucetId]: AoDryRunBalanceCoinFormat}, encryptWalletDataKey); // Immediately update the local storage balance
          console.log("AoDryRunBalanceCoinFormat2-2", Faucet.FaucetId, AoDryRunBalanceCoinFormat)
          setMyFaucetTokenBalanceData((prevState: any)=>({
            ...prevState, 
            [Faucet.FaucetId]: AoDryRunBalanceCoinFormat
          }))
        }

        //Add faucet token to my favorite
        const Token: any = await AoTokenInfoDryRun(AoFaucetInfoData.FaucetTokenId)
        if(Token) {
          handleSelectTokenAndSave({TokenId: AoFaucetInfoData.FaucetTokenId, ...Token, TokenData: Token}, Token)
          console.log("TokenId", {TokenId: AoFaucetInfoData.FaucetTokenId, ...Token, TokenData: Token})
        }

      }
      setIsDisabledButton(false)

    }
    else {
      console.log("GetFaucetFromFaucetTokenId chooseWallet", "chooseWallet")
    }
  }

  const handleGetMyFaucetTokenBalance = async () => {

    const getMyAoFaucetTokenBalanceData = getMyAoFaucetTokenBalance(currentAddress, encryptWalletDataKey);
    if(getMyAoFaucetTokenBalanceData) {   
      setMyFaucetTokenBalanceData(getMyAoFaucetTokenBalanceData)
    }
    try {
      if (allFaucetsData) {
        Promise.any(
          allFaucetsData.map(async (Faucet: any) => {
            try {

              //Get my wallet address balance
              const AoDryRunBalance = await AoTokenBalanceDryRun(Faucet.FaucetData.FaucetTokenId, currentAddress);
              if (AoDryRunBalance && Faucet) {
                const AoDryRunBalanceCoin = FormatBalance(AoDryRunBalance, Faucet.FaucetData.Denomination ? Faucet.FaucetData.Denomination : '12');
                const AoDryRunBalanceCoinFormat = Number(AoDryRunBalanceCoin) > 0 ? Number(AoDryRunBalanceCoin).toFixed(4).replace(/\.?0*$/, '') : 0;
                console.log("AoDryRunBalanceCoinFormat1", AoDryRunBalanceCoinFormat)
                setMyFaucetTokenBalanceData((prevState: any)=>{
                  const TempData = { ...prevState, [Faucet.FaucetData.FaucetTokenId]: AoDryRunBalanceCoinFormat }
                  setMyAoFaucetTokenBalance(currentAddress, TempData, encryptWalletDataKey); // Immediately update the local storage balance

                  return TempData
                })
              }

              //Get faucet address balance
              const AoDryRunFaucetBalance = await AoTokenBalanceDryRun(Faucet.FaucetData.FaucetTokenId, Faucet.FaucetId);
              if (AoDryRunFaucetBalance && Faucet) {
                const AoDryRunBalanceCoin = FormatBalance(AoDryRunFaucetBalance, Faucet.FaucetData.Denomination ? Faucet.FaucetData.Denomination : '12');
                const AoDryRunBalanceCoinFormat = Number(AoDryRunBalanceCoin) > 0 ? Number(AoDryRunBalanceCoin).toFixed(4).replace(/\.?0*$/, '') : 0;
                setMyAoFaucetTokenBalance(currentAddress, {...getMyAoFaucetTokenBalanceData, [Faucet.FaucetId]: AoDryRunBalanceCoinFormat}, encryptWalletDataKey); // Immediately update the local storage balance
                console.log("AoDryRunBalanceCoinFormat2", AoDryRunBalanceCoinFormat)
                setMyFaucetTokenBalanceData((prevState: any)=>({
                  ...prevState, 
                  [Faucet.FaucetId]: AoDryRunBalanceCoinFormat
                }))
                setMyFaucetTokenBalanceData((prevState: any)=>{
                  const TempData = { ...prevState, [Faucet.FaucetId]: AoDryRunBalanceCoinFormat }
                  setMyAoFaucetTokenBalance(currentAddress, TempData, encryptWalletDataKey); // Immediately update the local storage balance

                  return TempData
                })
              }
              setIsDisabledButton(false)

            } catch (error) {
              console.error(`Error processing Faucet.FaucetId ${Faucet.FaucetId}:`, error);
            }
          })
        ).catch((error) => {
          console.error("All promises failed:", error);
        });
      }
    } 
    catch (e: any) {
      console.log("handleGetMySavingTokensBalance Error", e);
    }

  }

  const handleSelectTokenAndSave = async (Token: any, TokenData: any) => {
    const WantToSaveTokenProcessTxIdData = await MyProcessTxIdsAddToken(globalThis.arweaveWallet, authConfig.AoConnectMyProcessTxIds, Token.TokenId, '100', TokenData.Name, JSON.stringify(TokenData) )
    if(WantToSaveTokenProcessTxIdData?.msg?.Messages && WantToSaveTokenProcessTxIdData?.msg?.Messages[0]?.Data)  {
      toast.success(t(WantToSaveTokenProcessTxIdData?.msg?.Messages[0]?.Data) as string, { duration: 2500, position: 'top-center' })
      addMyAoToken(currentAddress, Token, encryptWalletDataKey)
    }
  }

  useEffect(() => {
    if(currentAddress && currentAddress.length == 43) {
      handleGetAllFaucetsData()
    }
  }, [currentAddress]);

  useEffect(() => {   
    if(allFaucetsData && allFaucetsData.length > 0) {
      handleGetMyFaucetTokenBalance()
    }
  }, [allFaucetsData]);

  return (
    <Grid container sx={{maxWidth: windowWidth, margin: '0 auto'}}>
      {loadingWallet == 0 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="center">
              <Card sx={{ my: 6, width: '100%', height: '800px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  Loading Wallet Status
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 2 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="center">
              <Card sx={{ my: 6, width: '100%', height: '800px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <FaucetHelpText />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && allFaucetsData.length === 0 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="center">
              <Card sx={{ my: 6, width: '100%', height: '800px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  Loading data from Faucet Server
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && allFaucetsData.length > 0 && (
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <ContentWrapper
            className='layout-page-content'
            sx={{
                ...(contentHeightFixed && {
                overflow: 'hidden',
                '& > :first-of-type': { height: `calc(100% - 104px)` }
                })
            }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{height: '100%'}}>
                  <Grid container spacing={2}>
                    {allFaucetsData && allFaucetsData.map((Faucet: any, Index: number) => {

                      let isShow = false
                      if(Number(myFaucetTokenBalanceData[Faucet.FaucetId]) >= Number(Faucet.FaucetData.FaucetAmount)) {
                        isShow = true
                      }

                      return (
                        <Fragment key={Index}>
                          { isShow && (
                            <Grid item xs={12} sx={{ py: 2 }}>
                              <Card>     
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CustomAvatar
                                      skin='light'
                                      color={'primary'}
                                      sx={{ mr: 3, width: 38, height: 38, fontSize: '1.5rem' }}
                                      src={GetAppAvatar(Faucet.FaucetData.Logo)}
                                    >
                                    </CustomAvatar>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontWeight: 600 }}>{Faucet.FaucetData.Name}</Typography>
                                      <Typography variant='caption' sx={{ letterSpacing: '0.4px', cursor: 'pointer' }} onClick={async ()=>{
                                        await Clipboard.write({
                                          string: Faucet.FaucetData.FaucetTokenId
                                        });
                                      }}>
                                        {formatHash(Faucet.FaucetData.FaucetTokenId, 12)}
                                      </Typography>
                                      <Typography variant='caption' sx={{ letterSpacing: '0.4px' }}>
                                        {t('My Balance')}: {myFaucetTokenBalanceData[Faucet.FaucetData.FaucetTokenId] ?? ''}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Divider
                                    sx={{ mb: theme => `${theme.spacing(4)} !important`, mt: theme => `${theme.spacing(4.75)} !important` }}
                                  />

                                  <Box sx={{ mb: 2, display: 'flex', '& svg': { mr: 3, mt: 1, fontSize: '1.375rem', color: 'text.secondary' } }}>
                                    <Icon icon='mdi:clock-time-three-outline' />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '0.875rem', py: 1 }}>{t('Rule') as string}: {Faucet.FaucetData.FaucetRule}</Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ mb: 2, display: 'flex', '& svg': { mr: 3, mt: 1, fontSize: '1.375rem', color: 'text.secondary' } }}>
                                    <Icon icon='mdi:dollar' />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '0.875rem', py: 0.8 }}>{t('Get Amount') as string}: {Faucet.FaucetData.FaucetAmount
                                      }</Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ mb: 2, display: 'flex', '& svg': { mr: 3, mt: 1, fontSize: '1.375rem', color: 'text.secondary' } }}>
                                    <Icon icon='streamline:bag-dollar-solid' />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '0.875rem', py: 0.8 }}>{t('Faucet Balance') as string}: {myFaucetTokenBalanceData[Faucet.FaucetId] ?? ''}</Typography>
                                      {Number(myFaucetTokenBalanceData[Faucet.FaucetId]) < Number(Faucet.FaucetData.FaucetAmount) && (
                                        <Typography sx={{ fontSize: '0.875rem', py: 0.8, color: 'error.main' }}>{t('Insufficient balance') as string}, {t('At least') as string}: {Faucet.FaucetData.FaucetAmount}</Typography>
                                      )}
                                    </Box>
                                  </Box>

                                  <Box sx={{ display: 'flex', '& svg': { mr: 3, mt: 1, fontSize: '1.375rem', color: 'text.secondary' } }}>
                                    <Icon icon='material-symbols:info-outline' />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography sx={{ fontSize: '0.875rem', py: 0.8 }}>{t('Requirement AR') as string}: {Faucet.FaucetData.RequirementAR ?? 0}</Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Box sx={{ '& svg': { mr: 3, mt: 1, fontSize: '1.375rem', color: 'text.secondary' } }}>
                                        {Number(myFaucetTokenBalanceData[Faucet.FaucetId]) >= Number(Faucet.FaucetData.FaucetAmount) && (
                                          <Button disabled={isDisabledButton} sx={{ textTransform: 'none', mt: 3, ml: 2 }} size="small" variant='outlined' onClick={() => handelGetAmountFromFaucet(Faucet)}>
                                              {t('Get Faucet') as string}
                                          </Button>
                                        )}
                                    </Box>
                                  </Box>

                                </CardContent>
                              </Card>
                            </Grid>
                          )} 
                        </Fragment>
                      )

                    })}
                  </Grid>
                  <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isDisabledButton}
                  >
                    <CircularProgress color="inherit" size={45}/>
                  </Backdrop>
                </Grid>
              </Grid>

        </ContentWrapper>
      </Box>
      )}
    </Grid>
  )
}

export default Faucet
