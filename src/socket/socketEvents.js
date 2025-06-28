export const SOCKET_EVENTS = {
  CHAT: {
    JOIN: 'chat:join',                          // User joined a chat room              Done
    LEAVE: 'chat:leave',                        // User left a chat room
    NEW_MESSAGE: 'chat:new_message',            // User sent a message                  // Done
    RECEIVE_MESSAGE: 'chat:receive_message',    // Message received by others
    MESSAGE_EDITED: 'chat:message_edited',      // A message was edited
    MESSAGE_DELETED: 'chat:message_deleted',    // A message was deleted
    TYPING: 'chat:typing',                      // User is typing                       // Done    
    STOP_TYPING: 'chat:stop_typing',            // User stopped typing                  // Done
    SEEN: 'chat:seen',                          // Messages seen by a user
    UPDATE_SEEN: 'chat:update_seen',            // Update seen status for others
    PRESENCE: 'chat:presence',                  // Snapchat-style: user is viewing
    REACTION_ADDED: 'chat:reaction_added',      // A reaction (like emoji) added to a message
    REACTION_REMOVED: 'chat:reaction_removed',  // A reaction removed from a message
    PIN_MESSAGE: 'chat:pin_message',            // Pin a message in chat
    UNPIN_MESSAGE: 'chat:unpin_message',        // Unpin a message
    CHAT_UPDATED: 'chat:chat_updated',          // Chat metadata changed (name, pic)
    CHAT_DELETED: 'chat:chat_deleted',          // Chat was deleted
  },

  INBOX: {
    UPDATE: 'inbox:update',                     // Inbox or chat list changed
    ARCHIVE: 'inbox:archive',                   // Archive a conversation
    UNARCHIVE: 'inbox:unarchive',               // Restore archived chat
    MUTE: 'inbox:mute',                         // Mute notifications
    UNMUTE: 'inbox:unmute',                     // Unmute chat
  },

  FRIEND: {
    REQUEST_SENT: 'friend:request_sent',        // Sent a friend request
    REQUEST_RECEIVED: 'friend:request_received',// Received a friend request
    REQUEST_ACCEPTED: 'friend:request_accepted',// Accepted a request
    REQUEST_REJECTED: 'friend:request_rejected',// Rejected a request
    REQUEST_CANCELLED: 'friend:request_cancelled', // Cancelled a request
    FRIEND_REMOVED: 'friend:removed',           // Removed a friend
  },

  USER: {
    CONNECTED: 'user:connected',                // User connected to socket                 // Done
    DISCONNECTED: 'user:disconnected',          // User disconnected
    PROFILE_UPDATED: 'user:profile_updated',    // User updated profile
  },

  SYSTEM: {
    ERROR: 'system:error',                      // General socket/system error
    SERVER_RESTART: 'system:server_restart',    // Inform users of restart
    FORCE_LOGOUT: 'system:force_logout',        // Force logout from server
    RATE_LIMIT: 'system:rate_limited',          // Rate-limiting exceeded
  },

  ADMIN: {
    ADMIN_MESSAGE_FLAGGED: 'admin:message_flagged',  // Flag a message
    ADMIN_USER_SUSPENDED: 'admin:user_suspended',    // Suspend a user
  }
};



/*
INBOX.UPDATE: Auto-refresh inbox on new messages, name updates, etc.
Use in response to NEW_MESSAGE, CHAT_UPDATED, REQUEST_ACCEPTED etc.

LEAVE: Removes user from room to avoid unnecessary events

https://chatgpt.com/share/685e3e4d-7420-8006-8684-428625982a0b
*/