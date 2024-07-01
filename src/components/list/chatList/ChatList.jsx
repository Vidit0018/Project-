import  {  useEffect, useState } from 'react';
import './chatList.css';
import searchIcon from '/search.png';
import plusIcon from '/plus.png';
import minusIcon from '/minus.png'
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const ChatList = () => {

    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const {currentUser} = useUserStore();
    const {changeChat} = useChatStore();
    const [input,setInput] = useState('');

    useEffect( () => {
        const unSub = onSnapshot(doc(db,"userchats", currentUser.id),async (res) => {
            const items = res.data().chats;

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return {...item , user};
            })
            const chatData = await Promise.all(promises);

            setChats(chatData.sort((a,b) => b.updatedAt - a.updatedAt));
          });

          return () =>{
            unSub();
          }
    },[currentUser.id])

    const handleSelect = async (chat) =>{
        
        const userChats = chats.map(item => {
            const {user,...rest} = item;
            return rest;
        })

        const chatIndex = userChats.findIndex(item=> item.chatId === chat.chatId)

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db,'userchats',currentUser.id);

        try {
            await updateDoc(userChatsRef,{
                chats: userChats,
            })

            await changeChat(chat.chatId,chat.user);
        } 
        catch (error) {
            console.log(error.message);
        }

        
    }

    const filteredChats = chats.filter((c) => 
    c.user.username.toLowerCase().includes(input.toLowerCase()))

  return ( 
    <div className='chatList'>
        <div className="search">
            <div className="searchBar">
                <img src={searchIcon} alt="" />
                <input type="text" placeholder='Search' onChange={(e) => setInput(e.target.value)}/>
            </div>
            
            <img src={addMode? minusIcon : plusIcon } alt=""  className='add' onClick={() => {setAddMode(!addMode)}}/>
        </div>

        {
            filteredChats.map((chat) => (
                <div className="item" 
                key={chat.chatId} 
                onClick={()=>handleSelect(chat)}
                style={{
                    backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                }}>
                    <img src={chat.user.blocked.includes(currentUser.id)? "./avatar.png" : chat.user.avatar || './avatar.png'} alt="" />
                    <div className="text">
                        <span>{chat.user.blocked.includes(currentUser.id)? "User": chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))
        }

        


        {
            addMode &&
            <AddUser/>
        }
       
    </div>
  )
}

export default ChatList;