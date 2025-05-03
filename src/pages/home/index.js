import { useSelector } from "react-redux";

function Home() {
    const { user } = useSelector((state) => state.auth);
    console.log("Home page loaded");
    console.log(user);
    
    return <>
        <    h2>Home</h2>
    </>
}
export default Home;