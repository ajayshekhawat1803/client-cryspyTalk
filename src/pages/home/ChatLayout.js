import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AllChats from "./AllChats";
import Sidebar from "../../components/sidebar";
import Header from "../../components/header/index";

const ChatLayout = () => {
    const [activeSection, setActiveSection] = useState("all");
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 950);

    const handleResize = () => {
        if (window.innerWidth < 950) {
            setShowSidebar(false);
        } else {
            setShowSidebar(true);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case "search":
                return <>Search box will be here</>;
            case "settings":
                return <>Settings will be here</>;
            case "favourites":
                return <>Favourites will be here</>;
            case "archived":
                return <>Archived chats will be here</>;
            case "all":
                return <>All chats will be here</>;
            default:
                return <AllChats />;
        }
    };

    return (
        <div className="w-100 h-100 d-flex flex-column">
            <Header
                showSidebar={showSidebar}
                toggleSidebar={() => setShowSidebar((prev) => !prev)}
            />
            <Container fluid className="g-0 w-100 h-100">
                <Row className="g-0 w-100 h-100" style={{ position: 'relative' }}>
                    {showSidebar && (
                        <Col md="auto"
                            style={
                                window.innerWidth < 950
                                    ? {
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                    }
                                    : {}
                            }
                        >
                            <div className="sidebar-container" >
                                <Sidebar
                                    onSelect={(section) => {
                                        setActiveSection(section);
                                        if (window.innerWidth < 950) setShowSidebar(false); // auto-hide on mobile
                                    }}
                                    activeSection={activeSection}
                                />
                            </div>
                        </Col>
                    )}
                    <Col>
                        <div className="p-4 w-100" style={{ background: "#f8f9fa", height: "100%" }}>
                            {renderContent()}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ChatLayout;
