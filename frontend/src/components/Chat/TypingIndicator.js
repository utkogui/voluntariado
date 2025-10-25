import React from 'react';
import styled, { keyframes } from 'styled-components';

const typingAnimation = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin: ${props => props.theme.spacing.sm} 0;
  max-width: 80px;
`;

const TypingText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  font-style: italic;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 2px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${props => props.theme.colors.gray500};
  border-radius: 50%;
  animation: ${typingAnimation} 1.4s infinite;
  animation-delay: ${props => props.delay}s;
`;

const TypingIndicator = ({ isVisible, userName }) => {
  if (!isVisible) return null;

  return (
    <TypingContainer>
      <TypingText>{userName} está digitando</TypingText>
      <DotsContainer>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </DotsContainer>
    </TypingContainer>
  );
};

export default TypingIndicator;
