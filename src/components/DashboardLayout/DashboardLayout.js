import React, { useState, useContext, useEffect, useRef } from "react";
import SideBar from '../SideBar/SideBar';
import { Outlet } from 'react-router-dom';
import "./DashboardLayout.css";

const DashboardLayout = ({ onLogout }) => {

    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div>
            <SideBar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} onLogout={onLogout}/>
            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`} >
                <div className="inner-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;