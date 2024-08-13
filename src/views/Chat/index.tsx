// ** React Imports
import { useEffect, useState, Fragment, memo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// ** Hooks
import { useSettings } from '@core/hooks/useSettings'

// ** Chat App Components Imports
import ChatIndex from '@views/Chat/ChatIndex'

// ** Axios Imports
import authConfig from '@configs/auth'


import { useAuth } from '@/hooks/useAuth'

import { AoCreateProcessAuto } from '@/functions/AoConnect/AoConnect'
import { GetAoConnectMyAoConnectTxId, SetAoConnectMyAoConnectTxId } from '@/functions/AoConnect/MsgReminder'


const Chat = () => {
  // ** States
  const [app, setApp] = useState<any>(null)
  const [myAoConnectTxId, setMyAoConnectTxId] = useState<string>('')

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  
  const id = '0'

  const auth = useAuth()
  const currentAddress = auth.currentAddress
  const currentWallet = auth.currentWallet

  useEffect(() => {
    if(id && id.length == 43) {

      const AoConnectChatRoomData = window.localStorage.getItem(authConfig.AoConnectChatRoom) || '{}';
      try{
        const AoConnectChatRoomJson = JSON.parse(AoConnectChatRoomData)
        if(AoConnectChatRoomJson) {
          const AppNew = AoConnectChatRoomJson.filter((item: any)=>item.id == id)
          if(AppNew && AppNew[0]) {
            setApp(AppNew[0])
          }
        }
      }
      catch(e: any) {
        console.log("AoConnectChatRoomData AoConnectChatRoomJson", e)
      }
    }
  }, [id])

  useEffect(() => {
    const fetchData = async () => {
        if(currentAddress && currentAddress.length === 43) {
            const MyProcessTxIdData: string = GetAoConnectMyAoConnectTxId(currentAddress);
            if(MyProcessTxIdData && MyProcessTxIdData.length === 43) {
                setMyAoConnectTxId(MyProcessTxIdData);
            }
            if(MyProcessTxIdData === '') {
                const ChivesMyAoConnectProcessTxId = await AoCreateProcessAuto(currentWallet.jwk);
                if(ChivesMyAoConnectProcessTxId) {
                    console.log("ChivesMyAoConnectProcessTxId", ChivesMyAoConnectProcessTxId);
                    SetAoConnectMyAoConnectTxId(currentAddress, ChivesMyAoConnectProcessTxId);
                    setMyAoConnectTxId(ChivesMyAoConnectProcessTxId);
                }
            }
        }
    };
    fetchData();
  }, [currentAddress]);

  // ** Vars
  const { skin } = settings

  return (
    <Grid container sx={{maxWidth: '1152px', margin: '0 auto', maxHeight: '1152px'}}>
      {id && app?
      <Box
        className='app-chat'
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          my: 6,
          backgroundColor: 'background.paper',
          boxShadow: skin === 'bordered' ? 0 : 6,
          ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
        }}
      >
        <ChatIndex id={id} app={app} myAoConnectTxId={myAoConnectTxId} currentAddress={currentAddress} />
      </Box>
      :
      null
      }
    </Grid>
  )
}

export default memo(Chat)

