import React from 'react';
import { BrowserRouter as Router, Route, Link, useLocation, Routes } from 'react-router-dom';
import TeacherPage from './teacher';
import StudentPage from './student';
import { Helmet } from 'react-helmet';


function App() {
  return (
    <Router>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width:'90vw', height: '100vh' }}>
        <Helmet>
          <title>ClassMessage 교실에서 간단하게 메시지를 보내요.</title>
          <meta name="description" content="교실에서 간단하게 메시지를 보내세요." />
        </Helmet>
        <Navigation />
        <Routes>
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/student" element={<StudentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function Navigation() {
  const location = useLocation();
  
  if (location.pathname === '/') {
    return (
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
  <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '10px', textAlign: 'center', width: '200px' }}>
    <Link to="/teacher" style={{ fontSize: '20px', textDecoration: 'none' }}>선생님</Link>
  </div>
  <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '10px', textAlign: 'center', width: '200px' }}>
    <Link to="/student" style={{ fontSize: '20px', textDecoration: 'none' }}>학생</Link>
  </div>
</div>    );
  } else {
    return null;
  }
}

export default App;