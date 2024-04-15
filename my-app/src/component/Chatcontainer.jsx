import React, {useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Logout } from './Logout';
import { ChatInput } from './ChatInput';
import { Message } from './Message';

import axios from 'axios';
import {sendMessageRoute,getMessage} from "../utils/APIRoutes"
export const Chatcontainer = ({currentChat, currentUser,socket}) => {
  const [message,setMessage]=useState([]);
  const [arrivalMsg,setArrivalMsg]=useState(null);
  const lastMessageRef = useRef(null);
  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 

    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}.${minutes} ${ampm}`;
  }
  
  let currentTime=getCurrentTime();

  
  const handleChatMsg=async(msg)=>{
    await  axios.post(sendMessageRoute,{
         message:msg,
         from:currentUser._id,
         to:currentChat._id,
         time:currentTime,
       });
       socket.current.emit("send-msg",{
        from:currentUser._id,
        to:currentChat._id, 
        message:msg,
        time:currentTime,
       })
      const msgs=[...message];
      msgs.push({fromSelf:true, message:msg,time:currentTime});
      setMessage(msgs);
    
  }
    
      if(socket.current){
        socket.current.on("data-receive",(msg)=>{
         setArrivalMsg({fromSelf:false,message:msg.message,time:msg.time}); 
        })} 
     

     useEffect(()=>{
     arrivalMsg && setMessage((prev)=>[...prev,arrivalMsg])
     },[arrivalMsg])

     useEffect(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [message]);

   useEffect(()=>{
    (async()=>{
      if(currentChat){
       const {data}=await axios.get(getMessage,{
        params:{
        from:currentUser._id,
        to:currentChat._id,}
       })

       setMessage(data)
      }
    })();
  
   },[currentChat])
  
  return (
  <>   {
     currentChat &&
    (
    <Container >
      <div className="chat-header" >
        <div className="user-detail">
          <div className="avatar" >
            <img src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} alt='avatar'/>
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout  />
      </div>
            <Message msg={message} lastMessageRef={lastMessageRef} />
       <ChatInput  chatMsg={handleChatMsg} />
    </Container>
    )
    }
    </>

  )
}

const Container=styled.div`
 display:grid;
 grid-template-rows:10% 78% 12%;
 gap:0.1rem;
overflow:hidden;
.chat-header{
  display:flex;
  justify-content:space-between;
  padding:1rem 2rem;
  border-radius:1rem;
  background-color:#ffffff39;
.user-detail{
  display:flex;
  align-items:center;
 gap:2rem;
  .avatar{
    img{
    height:2.5rem;
    }
  }
  .username{
    color:white;
  }
 }
}
`;
