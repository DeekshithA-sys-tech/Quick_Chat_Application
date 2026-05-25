import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import AuthContext from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {
  const {
    users,
    groups,
    selectedUser,
    getUsers,
    getGroups,
    createGroup,
    setSelectedUser,
    unseenMessages
  } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupBio, setGroupBio] = useState('')
  const [groupPic, setGroupPic] = useState(null)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    getUsers()
    getGroups()
  }, [onlineUsers])

  const filteredUsers = searchQuery
    ? users?.filter((user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users || []

  const filteredGroups = searchQuery
    ? groups?.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups || []

  const handleMemberToggle = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setIsSubmitting(true)

    const executeCreate = async (base64Image) => {
      await createGroup({
        name: groupName,
        bio: groupBio,
        profilePic: base64Image,
        members: selectedMembers
      })
      // Reset form
      setGroupName('')
      setGroupBio('')
      setGroupPic(null)
      setSelectedMembers([])
      setShowModal(false)
      setIsSubmitting(false)
      getGroups()
    }

    if (groupPic) {
      const reader = new FileReader()
      reader.readAsDataURL(groupPic)
      reader.onload = async () => {
        await executeCreate(reader.result)
      }
    } else {
      await executeCreate('')
    }
  }

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white flex flex-col ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* ---------- HEADER ---------- */}
      <div className='pb-5 shrink-0'>
        <div className='flex justify-between items-center'>
            <img src={assets.logo} alt="logo" className='max-w-40'/>
            <div className='relative py-2 group'>
                <img src={assets.menu_icon} alt="logo" className='max-w-5 cursor-pointer'/>
                <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md
                bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                    <p onClick={()=>{navigate('/profile')}} className='cursor-pointer text-sm hover:text-violet-400 transition-colors'>edit profile</p>
                    <hr className='my-2 border-t border-gray-500'/>
                    <p onClick={()=>logout()} className='cursor-pointer text-sm hover:text-violet-400 transition-colors'>logout</p>
                </div>
            </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="search" className='w-3'/>
            <input 
              onChange={(e)=>{setSearchQuery(e.target.value)}} 
              type="text" 
              className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' 
              placeholder='Search User or Group...'
            />
        </div>
      </div>

      <div className='flex-1 flex flex-col gap-6 overflow-y-auto pr-1'>
        {/* ---------- GROUP CHATS ---------- */}
        <div>
          <div className='flex justify-between items-center px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400'>
            <span>Group Chats</span>
            <button 
              onClick={() => setShowModal(true)}
              className='text-violet-400 hover:text-violet-300 text-sm font-bold cursor-pointer transition-colors px-1'
              title="Create Group"
            >
              + Create
            </button>
          </div>
          <div className='flex flex-col gap-1'>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div 
                  onClick={() => setSelectedUser(group)}
                  key={group._id} 
                  className={`relative flex items-center gap-3 p-2.5 pl-3 rounded-xl cursor-pointer hover:bg-[#282142]/40 transition-all duration-200
                  ${selectedUser?._id === group._id && 'bg-[#282142]'}`}
                >
                  <img 
                    src={group.profilePic || assets.avatar_icon} 
                    alt={group.name} 
                    className='w-[38px] h-[38px] rounded-full object-cover border border-violet-500/30'
                  />
                  <div className='flex flex-col leading-5'>
                      <p className='font-medium text-sm text-gray-100'>{group.name}</p>
                      <span className='text-gray-400 text-xs'>{group.members?.length || 0} members</span>
                  </div>
                  {unseenMessages[group._id] > 0 && (
                    <p className='absolute top-1/2 -translate-y-1/2 right-4 text-xs h-5 w-5
                    flex justify-center items-center rounded-full bg-violet-500 text-white font-bold'>{unseenMessages[group._id]}</p>
                  )}
                </div>
              ))
            ) : (
              <p className='text-xs text-gray-500 italic px-3 py-1'>No groups found</p>
            )}
          </div>
        </div>

        {/* ---------- DIRECT MESSAGES ---------- */}
        <div>
          <div className='px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400'>
            Direct Messages
          </div>
          <div className='flex flex-col gap-1'>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div 
                  onClick={() => setSelectedUser(user)}
                  key={user._id} 
                  className={`relative flex items-center gap-3 p-2.5 pl-3 rounded-xl cursor-pointer hover:bg-[#282142]/40 transition-all duration-200
                  ${selectedUser?._id === user._id && 'bg-[#282142]'}`}
                >
                  <img 
                    src={user.profilePic || assets.avatar_icon} 
                    alt={user.fullName} 
                    className='w-[38px] h-[38px] rounded-full object-cover border border-violet-500/10'
                  />
                  <div className='flex flex-col leading-5'>
                      <p className='font-medium text-sm text-gray-100'>{user.fullName}</p>
                      {onlineUsers.includes(user._id) ? (
                        <span className='text-green-400 text-xs flex items-center gap-1'>
                          <span className='w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse'></span>
                          Online
                        </span>
                      ) : (
                        <span className='text-gray-400 text-xs'>Offline</span>
                      )}
                  </div>
                  {unseenMessages[user._id] > 0 && (
                    <p className='absolute top-1/2 -translate-y-1/2 right-4 text-xs h-5 w-5
                    flex justify-center items-center rounded-full bg-violet-500 text-white font-bold'>{unseenMessages[user._id]}</p>
                  )}
                </div>
              ))
            ) : (
              <p className='text-xs text-gray-500 italic px-3 py-1'>No users found</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- CREATE GROUP MODAL ---------- */}
      {showModal && (
        <div className='fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300'>
          <div className='bg-[#1a1530] border border-gray-700/80 rounded-2xl w-full max-w-md p-6 text-white flex flex-col gap-4 overflow-y-auto max-h-[90vh] shadow-2xl'>
            <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
              <h3 className='text-lg font-semibold text-violet-300'>Create Group Chat</h3>
              <button 
                onClick={() => {
                  setShowModal(false)
                  setGroupName('')
                  setGroupBio('')
                  setGroupPic(null)
                  setSelectedMembers([])
                }}
                className='text-gray-400 hover:text-white cursor-pointer text-xl font-bold'
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className='flex flex-col gap-4'>
              {/* Group Pic Upload */}
              <div className='flex items-center gap-4 bg-[#231d3d] p-3 rounded-xl border border-gray-700/50'>
                <label htmlFor="groupPic" className='relative cursor-pointer shrink-0 group'>
                  <img 
                    src={groupPic ? URL.createObjectURL(groupPic) : assets.avatar_icon} 
                    alt="Group Pic" 
                    className='w-14 h-14 rounded-full object-cover border-2 border-violet-500'
                  />
                  <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <span className='text-[10px] text-white font-semibold'>Upload</span>
                  </div>
                  <input 
                    onChange={(e) => setGroupPic(e.target.files[0])} 
                    type="file" 
                    id='groupPic' 
                    accept='.png, .jpeg, .jpg' 
                    hidden
                  />
                </label>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Group Icon</span>
                  <span className='text-[11px] text-gray-400'>Click icon to select image</span>
                </div>
              </div>

              {/* Group Name */}
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-semibold text-gray-300 uppercase tracking-wider'>Group Name</label>
                <input 
                  type="text" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter Group Name" 
                  required
                  className='bg-[#231d3d] border border-gray-700/70 rounded-xl p-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-sm text-white placeholder-gray-500'
                />
              </div>

              {/* Group Bio */}
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-semibold text-gray-300 uppercase tracking-wider'>Description / Bio</label>
                <textarea 
                  value={groupBio} 
                  onChange={(e) => setGroupBio(e.target.value)}
                  placeholder="What is this group about?" 
                  rows={2}
                  className='bg-[#231d3d] border border-gray-700/70 rounded-xl p-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-sm text-white placeholder-gray-500 resize-none'
                />
              </div>

              {/* Select Members */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold text-gray-300 uppercase tracking-wider'>Select Members</label>
                <div className='bg-[#231d3d] border border-gray-700/70 rounded-xl p-2 max-h-[160px] overflow-y-auto flex flex-col gap-1.5'>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <label 
                        key={user._id} 
                        className='flex items-center justify-between p-2 rounded-lg hover:bg-[#282142]/60 cursor-pointer select-none'
                      >
                        <div className='flex items-center gap-2.5'>
                          <img 
                            src={user.profilePic || assets.avatar_icon} 
                            alt="" 
                            className='w-7 h-7 rounded-full object-cover'
                          />
                          <span className='text-xs font-medium'>{user.fullName}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(user._id)} 
                          onChange={() => handleMemberToggle(user._id)}
                          className='w-4 h-4 accent-violet-500 cursor-pointer'
                        />
                      </label>
                    ))
                  ) : (
                    <span className='text-xs text-gray-500 italic p-2'>No users to select</span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting || !groupName.trim()}
                className='bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white p-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed mt-2'
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
