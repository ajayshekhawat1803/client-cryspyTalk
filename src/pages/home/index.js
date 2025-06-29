// import { useSelector } from "react-redux";
import { useState } from "react";
import ChatLayout from "./ChatLayout";


function Home() {
    const [activeSection, setActiveSection] = useState('all');


    return <>
        <ChatLayout     onSelect={(section) => setActiveSection(section)}
        activeSection={activeSection}/>
    </>
}
export default Home;