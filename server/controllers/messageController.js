import express from 'express'
import Message from "../models/message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

import cloudinary from '../lib/cloudinary.js'

import {io , userSocketMap} from '../server.js'

// get all user except the logged in user
export const getUserForSidebar = async(req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // count number of unseen messages
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

// get all message for selected user

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUsedId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUsedId },
                { senderId: selectedUsedId, receiverId: myId }
            ]
        });
        await Message.updateMany({ senderId: selectedUsedId, receiverId: myId }, { seen: true });
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// api to mark as seen using message id

export const markMessageAsSeen = async(req,res)=>{
    try {
        const { id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    } catch (error) {
         console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

// send message to selected user

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new Group Chat
export const createGroup = async (req, res) => {
    try {
        const { name, bio, profilePic, members } = req.body;
        const admin = req.user._id;

        if (!name) {
            return res.json({ success: false, message: "Group name is required" });
        }

        let imageUrl = "";
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            imageUrl = uploadResponse.secure_url;
        }

        let parsedMembers = [];
        if (members) {
            parsedMembers = typeof members === 'string' ? JSON.parse(members) : members;
        }
        if (!parsedMembers.includes(admin.toString())) {
            parsedMembers.push(admin.toString());
        }

        const newGroup = await Group.create({
            name,
            bio: bio || "",
            profilePic: imageUrl,
            admin,
            members: parsedMembers
        });

        const populatedGroup = await Group.findById(newGroup._id).populate("members", "-password").populate("admin", "-password");

        res.json({ success: true, group: populatedGroup, message: "Group created successfully!" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all groups where the current user is a member
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate("members", "-password").populate("admin", "-password");
        res.json({ success: true, groups });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update group details (admin only)
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, bio, profilePic } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Only group admin can update group details" });
        }

        let updateData = { name, bio };
        if (profilePic) {
            if (profilePic.startsWith("data:")) {
                const uploadResponse = await cloudinary.uploader.upload(profilePic);
                updateData.profilePic = uploadResponse.secure_url;
            } else {
                updateData.profilePic = profilePic;
            }
        }

        const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, { new: true })
            .populate("members", "-password")
            .populate("admin", "-password");

        res.json({ success: true, group: updatedGroup, message: "Group details updated successfully!" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all messages for a group
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId }).populate("senderId", "fullName profilePic");
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send a message to a group (can send files, videos, images)
export const sendGroupMessage = async (req, res) => {
    try {
        const { text, file, fileType } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        let fileUrl = "";
        let type = "";

        if (file) {
            const uploadResponse = await cloudinary.uploader.upload(file, { resource_type: "auto" });
            fileUrl = uploadResponse.secure_url;
            type = uploadResponse.resource_type === 'raw' ? 'file' : uploadResponse.resource_type;
        } else if (fileType) {
            type = fileType;
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            text,
            image: type === 'image' ? fileUrl : "", // for compatibility
            fileUrl,
            fileType: type
        });

        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

        // Broadcast to group members
        group.members.forEach((memberId) => {
            if (memberId.toString() !== senderId.toString()) {
                const socketId = userSocketMap[memberId.toString()];
                if (socketId) {
                    io.to(socketId).emit("newMessage", populatedMessage);
                }
            }
        });

        res.json({ success: true, newMessage: populatedMessage });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};