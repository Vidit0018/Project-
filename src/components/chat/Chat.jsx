import './chat.css';
import phoneIcon from '/phone.png';
import videoIcon from '/video.png';
import infoIcon from '/info.png';
import EmojiPicker from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react';
import { arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';
import upload from '../../lib/upload';

const Chat = () => {

  const [open, setOpen] = useState(false);
  const [text,setText] = useState('');
  const [chat,setChat] = useState([]);
  const [img,setImg] = useState({
    file:null,
    url:'',
  }) 

  const {chatId,user,isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
  const {currentUser} = useUserStore();

  const handleEmoji = (e) =>{
    setText( (prev) => prev+e.emoji);
    setOpen(false);
  }

  const endRef = useRef(null);

  useEffect( () => {
    endRef.current?.scrollIntoView({behavior : 'smooth'})
  },[chat])

  useEffect( ()=>{
    
      const unsub = onSnapshot(doc(db,'chats',chatId), (res) => {
        setChat(res.data());
      })
      
      return () => {
      unsub();
    }
    
    
  },[chatId])

  const handleSend = async () => {
    if (text==="") return;

    let imgUrl = null;

    if (img.file){
      imgUrl = await upload(img.file);
    }

    try {
      await updateDoc(doc(db,"chats",chatId),{
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && {img: imgUrl}),
        })
      })

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async(id) => {
        const userChatsRef = doc(db,"userchats",id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id? true : false ;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          
          await updateDoc(userChatsRef,{
            chats:userChatsData.chats,
          })
        }
      })

      

    } catch (error) {
      console.log(error.message);
    }

    setImg({
      file:null,
      url:"",
    })

    setText("");
  }

  const handleImg = (e) => {
    if (e.target.files[0]){
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      })
    }
  }



  return (
    <div className='chat'>
      <div className="top">

        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="text">
            <span>{user?.username}</span>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
        </div>

        <div className="icons">
          <img src={phoneIcon} alt="" />
          <img src={videoIcon} alt="" />
          <img src={infoIcon} alt="" />
        </div>

      </div>

      <div className="center">

        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              {
                message.img &&
                <img src={message.img} alt="" />
              }
              
              <p>{message.text}</p>
              {/* <span>10 minutes ago</span> */}
            </div>
          </div>
        ))
          
        }
        {
          img.url &&(
            <div className="message own">
              <div className="texts">
                <img src={img.url} alt="" />
              </div>
            </div>
          )
        }
        
        
        <div ref={endRef}></div>
      </div>

      <div className="bottom">

        <div className="icons">

          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{display:'none'}} onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked}/>

          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>

        <input 
        autoComplete='off'
        type="text" 
        placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot Send messages" : 'Type a message...'}
        value={text} 
        name='text' 
        onChange={ (e) => {setText(e.target.value)}}
        disabled={isCurrentUserBlocked || isReceiverBlocked}/>

        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen(!open)}/>
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>

        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Send
        </button>

      </div>
    </div>
  )
}

export default Chat