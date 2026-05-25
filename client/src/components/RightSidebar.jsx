import React, { useContext, useState, useEffect } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import AuthContext from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const RightSidebar = ({ selectedUser, setSelectedUser }) => {
  const { authUsers, onlineUsers } = useContext(AuthContext)
  const { updateGroup, messages } = useContext(ChatContext)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editPic, setEditPic] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (selectedUser?.isGroup) {
      setEditName(selectedUser.name || '')
      setEditBio(selectedUser.bio || '')
      setEditPic(null)
      setIsEditing(false)
    }
  }, [selectedUser])

  if (!selectedUser) return null

  const isAdmin = selectedUser.isGroup && (
    selectedUser.admin === authUsers?._id || 
    selectedUser.admin?._id === authUsers?._id
  )

  // Extract images sent in the chat to display as Media
  const chatMedia = messages
    .filter((msg) => msg.fileUrl && (msg.fileType === 'image' || msg.image))
    .map((msg) => msg.fileUrl || msg.image)
  const displayedMedia = chatMedia.length > 0 ? chatMedia : imagesDummyData

  const handleUpdateGroupSubmit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    setIsSaving(true)

    const executeUpdate = async (base64Image) => {
      await updateGroup(selectedUser._id, {
        name: editName,
        bio: editBio,
        profilePic: base64Image || selectedUser.profilePic
      })
      setIsEditing(false)
      setIsSaving(false)
    }

    if (editPic) {
      const reader = new FileReader()
      reader.readAsDataURL(editPic)
      reader.onload = async () => {
        await executeUpdate(reader.result)
      }
    } else {
      await executeUpdate('')
    }
  }

  return (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-auto flex flex-col p-5 pb-10 ${selectedUser ? "max-md:hidden" : ""}`}>
      {selectedUser.isGroup ? (
        /* ================= GROUP VIEW ================= */
        <div className='flex flex-col gap-6'>
          {isEditing ? (
            /* Admin Group Editing Form */
            <form onSubmit={handleUpdateGroupSubmit} className='flex flex-col gap-4 pt-4'>
              <h3 className='text-md font-semibold text-violet-300 border-b border-gray-700 pb-2'>Edit Group Details</h3>
              
              <div className='flex items-center gap-4 bg-[#231d3d] p-3 rounded-xl border border-gray-700/50'>
                <label htmlFor="editGroupPic" className='relative cursor-pointer shrink-0 group'>
                  <img 
                    src={editPic ? URL.createObjectURL(editPic) : selectedUser.profilePic || assets.avatar_icon} 
                    alt="Group Pic" 
                    className='w-14 h-14 rounded-full object-cover border-2 border-violet-500'
                  />
                  <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <span className='text-[10px] text-white font-semibold'>Upload</span>
                  </div>
                  <input 
                    onChange={(e) => setEditPic(e.target.files[0])} 
                    type="file" 
                    id='editGroupPic' 
                    accept='.png, .jpeg, .jpg' 
                    hidden
                  />
                </label>
                <div className='flex flex-col'>
                  <span className='text-xs font-medium'>Group Icon</span>
                  <span className='text-[10px] text-gray-400'>Click image to edit</span>
                </div>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[10px] font-semibold text-gray-400 uppercase tracking-wider'>Group Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required
                  className='bg-[#231d3d] border border-gray-700 rounded-xl p-2 focus:border-violet-500 outline-none text-sm text-white'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[10px] font-semibold text-gray-400 uppercase tracking-wider'>Group Bio</label>
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  rows={2}
                  className='bg-[#231d3d] border border-gray-700 rounded-xl p-2 focus:border-violet-500 outline-none text-sm text-white resize-none'
                />
              </div>

              <div className='flex items-center gap-2 mt-2'>
                <button 
                  type="submit" 
                  disabled={isSaving || !editName.trim()}
                  className='flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white p-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-55'
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className='flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-xl text-xs font-semibold cursor-pointer'
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Group Info Display */
            <div className='flex flex-col items-center text-center gap-2 pt-10'>
              <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-20 h-20 rounded-full object-cover border-2 border-violet-500/20 shadow-md'/>
              <h1 className='text-xl font-medium px-4 mt-2'>{selectedUser.name}</h1>
              <p className='text-xs text-gray-400 max-w-[220px] italic px-4 mt-0.5 break-all'>{selectedUser.bio || "No description provided."}</p>
              {isAdmin && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className='mt-3 bg-violet-950/60 border border-violet-500/40 text-violet-300 hover:bg-violet-900/80 px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors'
                >
                  Edit Group Details
                </button>
              )}
            </div>
          )}

          <hr className='border-gray-700/60'/>

          {/* Group Members List */}
          <div className='flex flex-col gap-2'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1'>Members ({selectedUser.members?.length || 0})</p>
            <div className='max-h-[220px] overflow-y-auto flex flex-col gap-2 bg-[#231d3d]/30 border border-gray-700/20 p-2.5 rounded-xl'>
              {selectedUser.members?.map((member) => {
                const memberId = typeof member === 'object' ? member._id : member;
                const isMemberAdmin = selectedUser.admin === memberId || selectedUser.admin?._id === memberId;
                const isMe = memberId === authUsers?._id;
                
                return (
                  <div key={memberId} className='flex items-center justify-between p-1 rounded hover:bg-[#282142]/20'>
                    <div className='flex items-center gap-2'>
                      <img src={member.profilePic || assets.avatar_icon} alt="" className='w-6 h-6 rounded-full object-cover border border-violet-500/10'/>
                      <span className='text-xs font-light text-gray-100 truncate max-w-[130px]'>
                        {isMe ? 'You' : member.fullName}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      {isMemberAdmin && (
                        <span className='text-[8px] bg-violet-600 text-white font-bold uppercase px-1 rounded-sm tracking-wider'>Admin</span>
                      )}
                      {onlineUsers.includes(memberId) ? (
                        <span className='w-1.5 h-1.5 bg-green-500 rounded-full' title="Online"></span>
                      ) : (
                        <span className='w-1.5 h-1.5 bg-gray-500 rounded-full' title="Offline"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================= DIRECT CHAT VIEW ================= */
        <div className='flex flex-col gap-6 pt-10 items-center text-center'>
          <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-20 h-20 rounded-full object-cover border border-violet-500/10 shadow-md'/>
          <h1 className='text-xl font-medium px-4 mt-2 flex items-center gap-2 justify-center'>
            {onlineUsers.includes(selectedUser._id) && (
              <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
            )}
            {selectedUser.fullName}
          </h1>
          <p className='text-xs text-gray-400 max-w-[220px] px-4 break-all'>{selectedUser.bio || "Hi, I am using QuickChat!"}</p>
        </div>
      )}

      <hr className='my-5 border-gray-700/60'/>

      {/* Media section (Universal) */}
      <div className='flex flex-col gap-2 px-1'>
        <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Media</p>
        <div className='max-h-[160px] overflow-y-auto grid grid-cols-3 gap-2.5 opacity-80 mt-1'>
          {displayedMedia.map((url, index) => (
            <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded-lg overflow-hidden border border-gray-700/40 aspect-square hover:scale-105 transition-transform duration-200'>
              <img src={url} alt="Media" className='w-full h-full object-cover'/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightSidebar
