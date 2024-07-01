import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import './addUser.css';
import { db } from '../../../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../../../lib/userStore';
import Spinner from '../../../spinner/Spinner';

const AddUser = () => {

    const [user,setUser] = useState(null);
    const {currentUser} = useUserStore();
    const [loading,setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));

            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty){
                setUser(querySnapShot.docs[0].data());
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleAdd = async () =>{

        const chatRef = collection(db,'chats');
        const userchatsRef = collection(db,'userchats');

        setLoading(true);

        try {

            const newChatRef = doc(chatRef);

            await setDoc(newChatRef,{
                createdAt: serverTimestamp(),
                messages: [],
            })

            await updateDoc(doc(userchatsRef,user.id),{
                chats: arrayUnion({
                    chatId:newChatRef.id,
                    lastMessage:'',
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            })

            await updateDoc(doc(userchatsRef,currentUser.id),{
                chats: arrayUnion({
                    chatId:newChatRef.id,
                    lastMessage:'',
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            })
            
        } catch (error) {
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

  return (
    
        <div className="addUser">

            <form action="" onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username"/>
                <button>Search</button>
            </form>

            {user&&
                <div className="user">
                    <div className="detail">
                        <img src="./avatar.png" alt="" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd}>
                        Add User
                    </button>
                </div>
            }
            {
                loading&&
                <Spinner/>
            }

        </div>
    
  )
}

export default AddUser