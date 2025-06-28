import './ChatArea.css';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Spinner, Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { logout } from '../../features/auth/authSlice';
import socket from '../../socket/socket';
import { SOCKET_EVENTS } from '../../socket/socketEvents';

const ChatArea = () => {
    const dispatch = useDispatch();
    const { chatId } = useParams();
    const token = useSelector((state) => state.auth.token);
    const currentUserId = useSelector((state) => state.auth.user?.id);
    const theme = useSelector((state) => state.theme.mode);
    const apiBaseUrl = useSelector((state) => state.config.apiBaseUrl);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSeenBy, setShowSeenBy] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [mediaFile, setMediaFile] = useState(null);

    const [inputFocused, setInputFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const typingTimeoutRef = useRef(null);


    // Refs for scrolling
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const messageInputRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        requestAnimationFrame(() => {
            const container = chatContainerRef.current;
            if (!container) return;
            container.scrollTop = container.scrollHeight;
        });
    };
    const isUserAtBottom = () => {
        const container = chatContainerRef.current;
        if (!container) return false;
        return container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    };




    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
        const fetchMessages = async () => {
            if (chatId) {
                socket.emit(SOCKET_EVENTS.CHAT.JOIN, { chatId, msg: `User ${currentUserId} joined to chat ${chatId}` });
            }
            try {
                const res = await fetch(`${apiBaseUrl}/messages/get-messages/${chatId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.status === 401) {
                    toast.error("Session expired !! Please log in again.");
                    dispatch(logout({}));
                    return;
                }
                const data = await res.json();
                if (!data.success) throw new Error(data.message);
                setMessages(data.data.messages);
                setChatUser(data.data.chatUser);
            } catch (error) {
                toast.error(error.message || 'Failed to fetch messages');
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
        // Listen for new messages
        socket.on(SOCKET_EVENTS.CHAT.NEW_MESSAGE, (message) => {
            // console.log("New message received:", message);
            const isFromMe = message.senderId._id.toString() === currentUserId;
            if (message.chatId === chatId && !isFromMe) {
                setMessages((prev) => [...prev, message]);
                if (isUserAtBottom()) {
                    setTimeout(() => scrollToBottom(), 100);
                }
            }
        });
        return () => {
            socket.off(SOCKET_EVENTS.CHAT.NEW_MESSAGE);
        };
    }, [chatId, token, apiBaseUrl, dispatch, currentUserId, loading]);


    const themeStyles = {
        backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
        color: theme === 'dark' ? '#f1f1f1' : '#212529',
    };

    const renderMessages = () => {
        return messages?.map((msg, index) => {
            const isCurrentUser = msg.senderId._id === currentUserId;
            const previous = messages[index - 1];
            const showAvatar = !previous || previous.senderId._id !== msg.senderId._id;
            const isLast = index === messages.length - 1;
            return (
                <div key={msg._id} className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                    {!isCurrentUser && showAvatar
                        ? (<img src={`${apiBaseUrl}/${msg.senderId.profilePic}`} alt="avatar" className="rounded-circle me-2" width={40} height={40} />)
                        : (<div className='me-2' style={{ width: 40, height: 40 }}></div>)}
                    <div className={`p-2 rounded ${isCurrentUser ? 'bg-primary text-white' : 'bg-light text-dark'} `}
                        style={{
                            maxWidth: '80%',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}>
                        {msg.content}
                        {msg.mediaUrl && <img src={`${apiBaseUrl}/${msg.mediaUrl}`} alt="media" style={{ maxWidth: '200px' }} />}
                        {isLast && msg.seenBy?.length > 0 && (
                            <div className="mt-1 d-flex align-items-center">
                                {msg.seenBy.slice(0, 3).map(user => (
                                    <>
                                        <span style={{ fontSize: '0.6rem', color: '#999', fontStyle: 'italic', fontWeight: '600' }}
                                            onClick={() => setShowSeenBy(true)}>Seen by  </span>
                                        <img
                                            key={user._id}
                                            src={`${apiBaseUrl}/${user.profilePic}`}
                                            alt={user.username}
                                            className="rounded-circle me-1"
                                            width={20}
                                            height={20}
                                            onClick={() => setShowSeenBy(true)}
                                        />
                                    </>
                                ))}
                                {msg.seenBy.length > 3 && (
                                    <span
                                        className="small text-muted ms-1"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setShowSeenBy(true)}
                                    >
                                        +{msg.seenBy.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !mediaFile) return;
        if (mediaFile && !(mediaFile instanceof File)) {
            toast.error("Invalid media file.");
            return;
        }
        if (mediaFile && mediaFile.size > 10 * 1024 * 1024) {
            toast.error("Media file should be less than 10MB.");
            return;
        }
        const formData = new FormData();
        formData.append("content", newMessage);
        formData.append("chatId", chatId);
        if (mediaFile) {
            formData.append("media", mediaFile);
        }
        // console.log("Sending message with content:", newMessage, "and media file:", mediaFile)

        try {
            const res = await fetch(`${apiBaseUrl}/messages/send-message`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            if (res.status === 401) {
                toast.error("Session expired !! Please log in again.");
                dispatch(logout({}));
                return;
            }
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to send message');
            }
            // console.log("Message sent successfully:", data);

            setMessages((prev) => [...prev, data.data]);
            scrollToBottom();
            setNewMessage('');
            setMediaFile(null);
            requestAnimationFrame(() => {
                messageInputRef.current?.focus();
            });
            const fileInput = document.getElementById("media-upload");
            if (fileInput) fileInput.value = '';
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
        }
    };

    useEffect(() => {
        if (inputFocused) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [inputFocused, isTyping, otherTyping]);

    const handleTypingStatusOnChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        if (!isTyping) {
            setIsTyping(true);
            socket.emit(SOCKET_EVENTS.CHAT.TYPING, { chatId });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit(SOCKET_EVENTS.CHAT.STOP_TYPING, { chatId });
        }, 1500);
    }

    useEffect(() => {
        const handleTyping = ({ chatId: typingChatId }) => {
            if (typingChatId === chatId) {
                setOtherTyping(true);
            }
        };
        const handleStopTyping = ({ chatId: stopTypingChatId }) => {
            if (stopTypingChatId === chatId) {
                setOtherTyping(false);
            }
        };
        socket.on(SOCKET_EVENTS.CHAT.TYPING, handleTyping);
        socket.on(SOCKET_EVENTS.CHAT.STOP_TYPING, handleStopTyping);
        // ✅ Clean up on unmount or chat change
        return () => {
            socket.off(SOCKET_EVENTS.CHAT.TYPING, handleTyping);
            socket.off(SOCKET_EVENTS.CHAT.STOP_TYPING, handleStopTyping);
        };
    }, [chatId]);

    useEffect(() => {
        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.senderId._id === currentUserId) return;      // Don't emit seen for messages sent by me
        const alreadySeen = lastMessage.seenBy.some(u => u._id === currentUserId);    // Only emit if I haven't already seen it
        if (!alreadySeen && isUserAtBottom()) {
            socket.emit(SOCKET_EVENTS.CHAT.SEEN, {
                chatId,
                userId: currentUserId
            });
        }
    }, [messages, chatId, currentUserId]);


    useEffect(() => {
        const handleSeenUpdate = ({ chatId: seenChatId, userId: seenUserId, firstName, profilePic }) => {
            if (seenChatId === chatId && seenUserId !== currentUserId) {
                // console.log(`User ${seenUserId} has seen messages in chat ${seenChatId}`);
                setMessages(prevMessages => {
                    // console.log("Updating seen status for previous messages:", prevMessages);
                    return prevMessages.map((msg) => {
                        if (!msg.seenBy.some(u => u._id === seenUserId) && seenUserId !== currentUserId) {
                            return {
                                ...msg,
                                seenBy: [...msg.seenBy, { _id: seenUserId, firstName, profilePic }]
                            };
                        }
                        return msg;
                    });
                }
                );
            }
        };
        socket.on(SOCKET_EVENTS.CHAT.UPDATE_SEEN, handleSeenUpdate);
        return () => {
            socket.off(SOCKET_EVENTS.CHAT.UPDATE_SEEN, handleSeenUpdate);
        };
    }, [chatId, currentUserId]);






    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container
            fluid
            className="chat-area-container d-flex flex-column"
            style={{ height: '100vh', padding: 0, ...themeStyles }}
        >
            <div className="p-3 border-bottom d-flex align-items-center" style={{
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 2,
                position: 'relative',
            }} >
                <Button variant="outline-secondary" className="me-3" onClick={() => window.history.back()}>&larr;</Button>
                <img src={`${apiBaseUrl}/${chatUser?.profilePic}`} alt="avatar" className="rounded-circle me-2" width={50} height={50} />
                <div>
                    <div style={{ fontWeight: 'bold' }}>{chatUser?.name}</div>
                    <div className="text-muted small">@{chatUser?.username}</div>
                </div>
            </div>

            <div ref={chatContainerRef} className="chat-messages flex-grow-1 overflow-auto px-3 py-2" style={{ minHeight: 0 }}>
                {renderMessages()}
                {otherTyping && (
                    <div className="d-flex justify-content-start mb-2">
                        <div className="me-2" style={{ width: 40, height: 40 }}></div>
                        <div className="typing-indicator d-flex align-items-center px-3 py-1 rounded bg-light text-muted">
                            <div className="typing-dots">
                                Typing<span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-2 border-top" style={{ backgroundColor: theme === 'dark' ? '#121212' : '#fff' }}>
                <Form onSubmit={handleSendMessage}>
                    <div className="d-flex align-items-end border rounded p-2" style={{ backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff' }}>
                        {mediaFile && (
                            <div className="mt-2">
                                {mediaFile.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(mediaFile)}
                                        alt="preview"
                                        className="img-thumbnail"
                                        style={{ maxHeight: '150px' }}
                                    />
                                ) : (
                                    <video
                                        src={URL.createObjectURL(mediaFile)}
                                        controls
                                        className="img-thumbnail"
                                        style={{ maxHeight: '150px' }}
                                    />
                                )}
                            </div>
                        )}
                        <Form.Control
                            as="textarea"
                            ref={messageInputRef}
                            rows={1}
                            placeholder="Type a message..."
                            style={{ resize: 'none', border: 'none', boxShadow: 'none', flex: 1 }}
                            value={newMessage}
                            onChange={(e) => handleTypingStatusOnChange(e)}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)} // user manually blurred
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <label htmlFor="media-upload" className="btn btn-sm btn-light ms-2 mb-1">📎</label>
                        <input
                            id="media-upload"
                            type="file"
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                if (e.target.files.length > 1) {
                                    toast.warning("Only one media file can be uploaded at a time.");
                                    e.target.value = ''; // Reset input
                                    return;
                                }
                                setMediaFile(e.target.files[0]);
                            }}
                        />

                        <Button type="submit" variant="primary" className="ms-2 mb-1">Send</Button>
                    </div>
                </Form>
            </div>

            <Modal show={showSeenBy} onHide={() => setShowSeenBy(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Seen By</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul className="list-unstyled">
                        {messages[messages?.length - 1]?.seenBy?.map(user => (
                            <li key={user._id} className="d-flex align-items-center mb-2">
                                <img src={`${apiBaseUrl}/${user.profilePic}`} alt={user.username} className="rounded-circle me-2" width={30} height={30} />
                                <span>{user.firstName}</span>
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
            </Modal>
        </Container>

    );
};

export default ChatArea;


