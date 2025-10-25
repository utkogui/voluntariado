import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: ${props => props.theme.colors.background};
`;

const PageContent = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  max-width: 100%;
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.modal};
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const Layout = ({ children, showSidebar = true, showHeader = true, showFooter = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      {showHeader && (
        <Header 
          onMenuClick={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      )}
      
      <MainContent>
        {showSidebar && (
          <>
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
            <Overlay 
              isOpen={sidebarOpen}
              onClick={closeSidebar}
            />
          </>
        )}
        
        <ContentArea>
          <PageContent>
            {children}
          </PageContent>
          
          {showFooter && <Footer />}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
