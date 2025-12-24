import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import TaskList from "./TaskList";

import TaskBoard from "./TaskBoard";

import Projects from "./Projects";

import Reports from "./Reports";

import TaskDetail from "./TaskDetail";

import Profile from "./Profile";

import Leaderboard from "./Leaderboard";

import Settings from "./Settings";

import Notifications from "./Notifications";

import ChallengeManagement from "./ChallengeManagement";

import ChallengeDetail from "./ChallengeDetail";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    TaskList: TaskList,
    
    TaskBoard: TaskBoard,
    
    Projects: Projects,
    
    Reports: Reports,
    
    TaskDetail: TaskDetail,
    
    Profile: Profile,
    
    Leaderboard: Leaderboard,
    
    Settings: Settings,
    
    Notifications: Notifications,
    
    ChallengeManagement: ChallengeManagement,
    
    ChallengeDetail: ChallengeDetail,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/TaskList" element={<TaskList />} />
                
                <Route path="/TaskBoard" element={<TaskBoard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/TaskDetail" element={<TaskDetail />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/ChallengeManagement" element={<ChallengeManagement />} />
                
                <Route path="/ChallengeDetail" element={<ChallengeDetail />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}