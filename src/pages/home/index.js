// import { useSelector } from "react-redux";
import { useState } from "react";
import ChatLayout from "./ChatLayout";


function Home() {
    // const { user } = useSelector((state) => state.auth);
    // console.log("Home page loaded");
    // console.log(user);
    const [activeSection, setActiveSection] = useState('all');


    return <>
        <ChatLayout     onSelect={(section) => setActiveSection(section)}
        activeSection={activeSection}/>
    </>
}
export default Home;