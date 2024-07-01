import './userInfo.css';
import moreIcon from '/more.png';
import videoIcon from '/video.png';
import editIcon from '/edit.png';
import { useUserStore } from '../../../lib/userStore';

const UserInfo = () => {

  const {currentUser} = useUserStore();

  return (
    <div className='userInfo'>
        <div className="user">
            <img src={currentUser.avatar || "./avatar.png"} alt=""/>
            <h2>{currentUser.username}</h2>
        </div>
        <div className="icons">
            <img src={moreIcon} alt="" />
            <img src={videoIcon} alt="" />
            <img src={editIcon} alt="" />
        </div>
    </div>
  )
}

export default UserInfo