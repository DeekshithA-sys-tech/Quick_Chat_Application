import React, { useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import assets from '../assets/assets'
import { formateMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import AuthContext from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const { messages, sendMessage, selectedUser, setSelectedUser, getMessages } = useContext(ChatContext);
  const { authUsers, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef(null);

  const [input, setInput] = useState('');

  // handle send message to selected user or group
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') {
      return;
    }
    await sendMessage({ text: input.trim() });
    setInput('');
  }

  // handle sending a file, video, or image to selected user or group
  const handleSendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64File = reader.result;
      await sendMessage({ 
        file: base64File, 
        fileType: fileType,
        text: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return selectedUser ? (
    <div className='h-full overflow-hidden relative backdrop-blur-lg flex flex-col justify-between'>
      {/* ---------- HEADER ---------- */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500/40 shrink-0'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-9 h-9 rounded-full object-cover border border-violet-500/20'/>
        <div className='flex-1 flex flex-col'>
          <p className='text-md text-white font-medium flex items-center gap-2'>
            {selectedUser.isGroup ? selectedUser.name : selectedUser.fullName}
            {!selectedUser.isGroup && onlineUsers.includes(selectedUser._id) && (
              <span className='w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse'></span>
            )}
          </p>
          <span className='text-[10px] text-gray-400'>
            {selectedUser.isGroup 
              ? `${selectedUser.members?.length || 0} members` 
              : (onlineUsers.includes(selectedUser._id) ? 'online' : 'offline')}
          </span>
        </div>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7 cursor-pointer'/>
        <img src={assets.help_icon} alt="Help" className='max-md:hidden max-w-5' />
      </div>

      {/* ---------- Chat Area ---------- */}  
      <div className='flex-1 overflow-y-auto p-4 pb-20 flex flex-col gap-4'>
        {messages.map((msg, index) => {
          const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
          const isMyMessage = senderIdStr === authUsers?._id;
          const senderPic = isMyMessage
            ? authUsers?.profilePic
            : (typeof msg.senderId === 'object' ? msg.senderId?.profilePic : selectedUser?.profilePic);

          return (
            <div key={index} className={`flex items-end gap-2.5 max-w-[85%] ${isMyMessage ? 'self-end flex-row' : 'self-start flex-row-reverse'}`}>
              <div className='flex flex-col gap-1 max-w-[280px]'>
                {/* Sender Name in group chat */}
                {selectedUser.isGroup && !isMyMessage && typeof msg.senderId === 'object' && (
                  <span className='text-[10px] text-violet-400 font-semibold text-left pl-1'>
                    {msg.senderId?.fullName || "Group Member"}
                  </span>
                )}
                
                {/* Rich Media Render */}
                {msg.fileUrl || msg.image ? (
                  <div className='rounded-xl overflow-hidden border border-stone-500/30 shadow-md'>
                    {(msg.fileType === 'image' || (!msg.fileType && (msg.image || msg.fileUrl))) ? (
                      <img src={msg.fileUrl || msg.image} alt="Sent Image" className='max-w-full object-cover max-h-[220px]' />
                    ) : msg.fileType === 'video' ? (
                      <video src={msg.fileUrl} controls className='max-w-full rounded-xl object-contain max-h-[220px]' />
                    ) : (
                      <a 
                        href={msg.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2.5 p-3 bg-violet-950/50 text-xs text-white hover:bg-violet-900/60 hover:underline transition-all"
                      >
                        <span className="text-xl">📄</span>
                        <div className="flex flex-col text-left">
                          <span className="truncate max-w-[150px] font-medium text-gray-200">{msg.text || "Download File"}</span>
                          <span className="text-[9px] text-gray-400">Click to open</span>
                        </div>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className={`p-3 text-sm font-light text-white rounded-2xl break-all shadow-sm
                    ${isMyMessage ? 'bg-violet-500/30 rounded-br-none' : 'bg-gray-800/80 rounded-bl-none'}`}>
                    {msg.text}
                  </p>
                )}
              </div>
              
              <div className='text-center text-xs text-gray-500 shrink-0'>
                <img src={senderPic || assets.avatar_icon} alt="" className='w-7 h-7 rounded-full object-cover border border-gray-700/50' />
                <p className='text-[9px] text-gray-500 mt-0.5'>{formateMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* ------------ BOTTOM INPUT AREA -------------------- */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-gradient-to-t from-[#130f26]/90 to-[#130f26]/10 backdrop-blur-sm shrink-0 z-10'>
        <div className='flex-1 flex items-center gap-3 bg-gray-900/55 border border-gray-700/65 px-4 rounded-full'>
          <input 
            type="text" 
            placeholder='Type a message...' 
            onChange={(e) => setInput(e.target.value)} 
            value={input}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(e) }}
            className='flex-1 text-sm py-3 bg-transparent border-none outline-none text-white placeholder-gray-400' 
          />
          <input 
            type="file" 
            id='attachment' 
            accept='image/*,video/*,application/*,text/*' 
            hidden 
            onChange={handleSendFile}
          />
          <label htmlFor="attachment" className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src={assets.gallery_icon} alt="Attach file" className='w-5 mr-1' />
          </label>
        </div>
        <div className="shrink-0 hover:scale-105 transition-transform">
          <img onClick={handleSendMessage} src={assets.send_button} alt="Send" className='w-7 cursor-pointer' />
        </div>
      </div>
    </div>
  ) : (
    <div className='text-gray-500 gap-2 bg-white/10 max-md:hidden backdrop-blur-lg relative flex flex-col items-center justify-center h-full'>
      <img src={assets.logo_icon} alt="" className='max-w-16'/>
      <p className='text-white font-medium text-lg'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
