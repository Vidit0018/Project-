import './detail.css';
import upArrow from '/arrowUp.png';
import downArrow from '/arrowDown.png'
import downloadIcon from '/download.png'
import { auth, db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Detail = () => {

  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock} = useChatStore();
  const {currentUser} = useUserStore();

  const handleBlock =async () =>{
    if (!user) return;

    const userDocRef = doc(db,'users',currentUser.id);

    try {
      await updateDoc(userDocRef,{
        blocked : isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })

      changeBlock();
      
    } catch (error) {
      console.log(error.message);
    }

  }

  return (
    <div className='detail'>


      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>



      <div className="info">

        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src={upArrow} alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src={upArrow} alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src={downArrow} alt="" />
          </div>
          <div className="photos">

            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>Landscape</span>
              </div>
              <img src={downloadIcon} alt="" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>Landscape.png</span>
              </div>
              <img src={downloadIcon} alt="" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="./bg.jpg" alt="" />
                <span>Landscape.png</span>
              </div>
              <img src={downloadIcon} alt="" />
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src={upArrow} alt="" />
          </div>
        </div>

        <button onClick={handleBlock}>{isCurrentUserBlocked? "You are Blocked" : isReceiverBlocked? "Unblock User" : "Block User"}</button>
        <button className='logoutButton' onClick={ () => auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail
