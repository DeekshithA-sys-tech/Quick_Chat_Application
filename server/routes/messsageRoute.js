import express from 'express'
import {protectRoute} from '../middleware/auth.js'
import { 
    getMessages, 
    getUserForSidebar, 
    markMessageAsSeen, 
    sendMessage,
    createGroup,
    getGroups,
    updateGroup,
    getGroupMessages,
    sendGroupMessage 
} from '../controllers/messageController.js';
const messageRouter = express.Router();



messageRouter.get('/users', protectRoute, getUserForSidebar);
messageRouter.get('/groups/all', protectRoute, getGroups);
messageRouter.post('/groups', protectRoute, createGroup);
messageRouter.put('/groups/:groupId', protectRoute, updateGroup);
messageRouter.get('/group/:groupId', protectRoute, getGroupMessages);
messageRouter.post('/group/send/:groupId', protectRoute, sendGroupMessage);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessageAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);



export default messageRouter;