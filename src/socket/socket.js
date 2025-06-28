import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const socket = io(apiBaseUrl, {
    auth: {
        token: Cookies.get('authToken') || null,
    },
    query: {
    
    },
    // withCredentials: true,
});
export default socket;
