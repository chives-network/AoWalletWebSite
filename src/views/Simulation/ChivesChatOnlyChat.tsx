// ** React Imports
import { useState, Fragment } from 'react'

// ** Next Imports
import Button from '@mui/material/Button'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from '@/@core/components/icon'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { GetMyLastMsg, AoCreateProcessAuto, sleep } from '@/functions/AoConnect/AoConnect'
import { ChivesChatAddMember, SendMessageToChivesChat, ChivesChatGetChatRecords, ChivesChatApplyJoin, ChivesChatIsMember } from '@/functions/AoConnect/ChivesChat'
import { ansiRegex } from '@configs/functions'

const ChivesChatOnlyChat = ({auth} : any) => {
  // ** Hook
  const { t } = useTranslation()

  const currentAddress = auth.address as string
  
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)
  const [toolInfo, setToolInfo] = useState<any>({ChivesChatProcessTxId:''})
  const [ChivesChatAoConnectTxIdError, setChivesChatAoConnectTxIdError] = useState<string>('')

  const handleSimulatedChivesChat = async function () {

    setIsDisabledButton(true)
    setToolInfo({ChivesChatProcessTxId: toolInfo.ChivesChatProcessTxId})
    
    setToolInfo((prevState: any)=>({
      ...prevState,
      'Create other 5 users': 'UserOne, UserTwo, UserThree, UserFour, UserFive'
    }))

    const channelId = "AAAAAA"

    if(toolInfo.ChivesChatProcessTxId && toolInfo.ChivesChatProcessTxId.length == 43) {
      const ChivesChatGetChatRecordsData = await ChivesChatGetChatRecords(toolInfo.ChivesChatProcessTxId, toolInfo.ChivesChatProcessTxId, channelId, '1', '9')
      console.log("ChivesChatGetChatRecordsData", ChivesChatGetChatRecordsData)
      if(ChivesChatGetChatRecordsData && ChivesChatGetChatRecordsData.status == 'error') {
        setToolInfo((prevState: any)=>({
          ...prevState,
          'ChivesChatGetChatRecordsMaxRecords': ChivesChatGetChatRecordsData.status,
          'ChivesChatGetChatRecordsListRs': ChivesChatGetChatRecordsData.msg
        }))
      }
      else {
        const ChivesChatGetChatRecordsDataJson = JSON.parse(ChivesChatGetChatRecordsData)
        const ChivesChatGetChatRecordsList = ChivesChatGetChatRecordsDataJson[0]
        const ChivesChatGetChatRecordsMaxRecords = ChivesChatGetChatRecordsDataJson[1]
        const ChivesChatGetChatRecordsListRs = ChivesChatGetChatRecordsList.map((item: any, index: number)=>{
          
            return {index, Data: item?.Data ?? '', Sender: item?.Tags?.Sender ?? '', NanoId: item?.Tags?.NanoId ?? ''}
        })
        console.log("ChivesChatGetChatRecordsDataJson", ChivesChatGetChatRecordsDataJson)
        console.log("ChivesChatGetChatRecordsListRs", ChivesChatGetChatRecordsListRs)
        setToolInfo((prevState: any)=>({
          ...prevState,
          'ChivesChatGetChatRecordsMaxRecords': ChivesChatGetChatRecordsMaxRecords,
          'ChivesChatGetChatRecordsListRs': JSON.stringify(ChivesChatGetChatRecordsListRs)
        }))
      }
    }

    const ChivesChatProcessTxId = toolInfo?.ChivesChatProcessTxId
    if(!ChivesChatProcessTxId || ChivesChatProcessTxId == "" || ChivesChatProcessTxId.length != 43) {
        setChivesChatAoConnectTxIdError('Please set ChivesChatProcessTxId first!')
        setIsDisabledButton(false)

        return 
    }
    else {
        setChivesChatAoConnectTxIdError('')
    }

    const UserOne = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserOne) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserOne: UserOne
      }))
    }

    const UserTwo = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserTwo) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserTwo: UserTwo
      }))
    }

    const UserThree = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserThree) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserThree: UserThree
      }))
    }

    const UserFour = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserFour) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserFour: UserFour
      }))
    }

    const UserFive = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserFive) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserFive: UserFive
      }))
    }

    const UserSix = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserSix) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserSix: UserSix
      }))
    }

    const UserSeven = await AoCreateProcessAuto(globalThis.arweaveWallet)
    if(UserSeven) {
      setToolInfo((prevState: any)=>({
        ...prevState,
        UserSeven: UserSeven
      }))
    }

    await sleep(500)

    //Admin add or del member

    const ChivesChatAdminAddUserOne = await ChivesChatAddMember(globalThis.arweaveWallet, ChivesChatProcessTxId, UserOne, "UserOne", "UserOne Reason")
    if(ChivesChatAdminAddUserOne) {
      console.log("ChivesChatAdminAddUserOne", ChivesChatAdminAddUserOne)
      if(ChivesChatAdminAddUserOne?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatAdminAddUserOne?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatAdminAddUserOne: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, ChivesChatProcessTxId)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatAdminAddUserOne: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatIsMemberUserOne = await ChivesChatIsMember(ChivesChatProcessTxId, UserOne)
    if(ChivesChatIsMemberUserOne) {
      console.log("ChivesChatIsMemberUserOne", ChivesChatIsMemberUserOne)
      setToolInfo((prevState: any)=>({
        ...prevState,
        ChivesChatIsMemberUserOne: JSON.stringify(ChivesChatIsMemberUserOne)
      }))
    }

    const ChivesChatAdminAddUserTwo = await ChivesChatAddMember(globalThis.arweaveWallet, ChivesChatProcessTxId, UserTwo, "UserTwo", "UserTwo Reason")
    if(ChivesChatAdminAddUserTwo) {
      console.log("ChivesChatAdminAddUserTwo", ChivesChatAdminAddUserTwo)
      if(ChivesChatAdminAddUserTwo?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatAdminAddUserTwo?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatAdminAddUserTwo: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, ChivesChatProcessTxId)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatAdminAddUserTwo: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatAdminAddUserThree = await ChivesChatAddMember(globalThis.arweaveWallet, ChivesChatProcessTxId, UserThree, "UserThree", "UserThree Reason")
    if(ChivesChatAdminAddUserThree) {
      console.log("ChivesChatAdminAddUserThree", ChivesChatAdminAddUserThree)
      if(ChivesChatAdminAddUserThree?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatAdminAddUserThree?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatAdminAddUserThree: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, ChivesChatProcessTxId)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatAdminAddUserThree: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatAdminAddUserFour = await ChivesChatAddMember(globalThis.arweaveWallet, ChivesChatProcessTxId, UserFour, "UserFour", "UserFour Reason")
    if(ChivesChatAdminAddUserFour) {
      console.log("ChivesChatAdminAddUserFour", ChivesChatAdminAddUserFour)
      if(ChivesChatAdminAddUserFour?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatAdminAddUserFour?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatAdminAddUserFour: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, ChivesChatProcessTxId)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatAdminAddUserFour: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatAdminAddUserFive = await ChivesChatAddMember(globalThis.arweaveWallet, ChivesChatProcessTxId, UserFive, "UserFive", "UserFive Reason")
    if(ChivesChatAdminAddUserFive) {
      console.log("ChivesChatAdminAddUserFive", ChivesChatAdminAddUserFive)
      if(ChivesChatAdminAddUserFive?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatAdminAddUserFive?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatAdminAddUserFive: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, ChivesChatProcessTxId)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatAdminAddUserFive: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatUserSixApplyJoin = await ChivesChatApplyJoin(globalThis.arweaveWallet, ChivesChatProcessTxId, "UserSix", "Hope join this chatroom")
    if(ChivesChatUserSixApplyJoin) {
      console.log("ChivesChatUserSixApplyJoin", ChivesChatUserSixApplyJoin)
      if(ChivesChatUserSixApplyJoin?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatUserSixApplyJoin?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatUserSixApplyJoin: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, UserSix)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatUserSixApplyJoin: formatText2
              }))
            }
          }

        }

      }
    }

    const ChivesChatUserSevenApplyJoin = await ChivesChatApplyJoin(globalThis.arweaveWallet, ChivesChatProcessTxId, "UserSeven", "Hope join this chatroom")
    if(ChivesChatUserSevenApplyJoin) {
      console.log("ChivesChatUserSevenApplyJoin", ChivesChatUserSevenApplyJoin)
      if(ChivesChatUserSevenApplyJoin?.msg?.Output?.data?.output)  {
        const formatText = ChivesChatUserSevenApplyJoin?.msg?.Output?.data?.output.replace(ansiRegex, '');
        if(formatText) {

          setToolInfo((prevState: any)=>({
            ...prevState,
            ChivesChatUserSevenApplyJoin: formatText
          }))

          //Read message from inbox
          const AdminOneInboxData = await GetMyLastMsg(globalThis.arweaveWallet, UserSeven)
          if(AdminOneInboxData?.msg?.Output?.data?.output)  {
            const formatText2 = AdminOneInboxData?.msg?.Output?.data?.output.replace(ansiRegex, '');
            if(formatText2) {
              setToolInfo((prevState: any)=>({
                ...prevState,
                ChivesChatUserSevenApplyJoin: formatText2
              }))
            }
          }

        }

      }
    }

    /*
    const GetChivesChatMembersByOwner4th = await GetChivesChatMembersByOwner(globalThis.arweaveWallet, ChivesChatProcessTxId)
    if(GetChivesChatMembersByOwner4th) {
      console.log("GetChivesChatMembersByOwner4th", GetChivesChatMembersByOwner4th)
      if(GetChivesChatMembersByOwner4th?.msg?.Output?.data?.output)  {
        const formatText = GetChivesChatMembersByOwner4th?.msg?.Output?.data?.output.replace(ansiRegex, '');
        setToolInfo((prevState: any)=>({
          ...prevState,
          'GetChivesChatMembersByOwner4th(3 members, UserOne, UserTwo, UserFour)': formatText
        }))
      }
    }
    */

    const UserOneSendMessage = await SendMessageToChivesChat(globalThis.arweaveWallet, ChivesChatProcessTxId, channelId, "Send message from UserOne Random: " + String(Math.random()))
    if(UserOneSendMessage) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            UserOneSendMessage: UserOneSendMessage.id
        }))
    }

    const UserTwoSendMessage = await SendMessageToChivesChat(globalThis.arweaveWallet, ChivesChatProcessTxId, channelId, "Send message from UserTwo Random: " + String(Math.random()))
    if(UserTwoSendMessage) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            UserTwoSendMessage: UserTwoSendMessage.id
        }))
    }

    const UserThreeSendMessage = await SendMessageToChivesChat(globalThis.arweaveWallet, ChivesChatProcessTxId, channelId, "Send message from UserThree Random: " + String(Math.random()))
    if(UserThreeSendMessage) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            UserThreeSendMessage: UserThreeSendMessage.id
        }))
    }

    const UserFourSendMessage = await SendMessageToChivesChat(globalThis.arweaveWallet, ChivesChatProcessTxId, channelId, "Send message from UserFour Hello, AO! Random: " + String(Math.random()))
    if(UserFourSendMessage) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            UserFourSendMessage: UserFourSendMessage.id
        }))
    }

    const UserFiveSendMessage = await SendMessageToChivesChat(globalThis.arweaveWallet, ChivesChatProcessTxId, channelId, "Send message from UserFive 你好, AO! Random: " + String(Math.random()))
    if(UserFiveSendMessage) {
        setToolInfo((prevState: any)=>({
            ...prevState,
            UserFiveSendMessage: UserFiveSendMessage.id
        }))
    }

    
    //Delay 1s code end
    setIsDisabledButton(false)

    setToolInfo((prevState: any)=>({
      ...prevState,
      'Testing Finished': '==================================================='
    }))

    //}, 5000);


  }

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
                        label={`${t('ChivesChatProcessTxId')}`}
                        placeholder={`${t('ChivesChatProcessTxId')}`}
                        value={toolInfo?.ChivesChatProcessTxId ?? ''}
                        onChange={(e: any)=>{
                            if(e.target.value && e.target.value.length == 43) {
                                setChivesChatAoConnectTxIdError('')
                            }
                            else {
                                setChivesChatAoConnectTxIdError('Please set ChivesChatProcessTxId first!')
                                setIsDisabledButton(false)
                            }
                            setToolInfo((prevState: any)=>({
                                ...prevState,
                                ChivesChatProcessTxId: e.target.value
                            }))
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Icon icon='mdi:account-outline' />
                                </InputAdornment>
                            )
                        }}
                        error={!!ChivesChatAoConnectTxIdError}
                        helperText={ChivesChatAoConnectTxIdError}
                    />
                    <Button sx={{ textTransform: 'none', m: 2 }} size="small" disabled={isDisabledButton} variant='outlined' onClick={
                        () => { handleSimulatedChivesChat() }
                    }>
                    {t("Simulated ChivesChat (Only Simulated Chat)")}
                    </Button>
                  </Box>
                  <Link sx={{mt: 2, mr: 2}} href={`https://github.com/chives-network/AoWalletWebsite/blob/main/blueprints/chiveschat.lua`} target='_blank'>
                      <Typography variant='body2'>
                        {t("ChivesChat Lua")}
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

export default ChivesChatOnlyChat

