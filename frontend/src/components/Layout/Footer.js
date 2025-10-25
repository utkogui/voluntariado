import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.gray900};
  color: ${props => props.theme.colors.gray300};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  }
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.xl};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const BrandSection = styled.div`
  max-width: 400px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.xl};
`;

const LogoText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: white;
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.gray400};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray400};
`;

const ContactIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: white;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FooterLink = styled(Link)`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray400};
  text-decoration: none;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: white;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${props => props.theme.colors.gray800};
  padding-top: ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const SocialLink = styled.a`
  color: ${props => props.theme.colors.gray400};
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: white;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterTop>
          <BrandSection>
            <Logo>
              <LogoIcon>V</LogoIcon>
              <LogoText>Voluntariado</LogoText>
            </Logo>
            <Description>
              Conectamos voluntários com oportunidades de impacto social. 
              Juntos, construímos um mundo melhor através do voluntariado.
            </Description>
            <ContactInfo>
              <ContactItem>
                <ContactIcon>
                  <EnvelopeIcon width={16} height={16} />
                </ContactIcon>
                <span>contato@voluntariado.com</span>
              </ContactItem>
              <ContactItem>
                <ContactIcon>
                  <PhoneIcon width={16} height={16} />
                </ContactIcon>
                <span>+55 (11) 99999-9999</span>
              </ContactItem>
              <ContactItem>
                <ContactIcon>
                  <MapPinIcon width={16} height={16} />
                </ContactIcon>
                <span>São Paulo, SP - Brasil</span>
              </ContactItem>
            </ContactInfo>
          </BrandSection>

          <FooterSection>
            <SectionTitle>Para Voluntários</SectionTitle>
            <FooterLinks>
              <li><FooterLink to="/opportunities">Encontrar Oportunidades</FooterLink></li>
              <li><FooterLink to="/activities">Atividades</FooterLink></li>
              <li><FooterLink to="/profile">Meu Perfil</FooterLink></li>
              <li><FooterLink to="/my-applications">Minhas Candidaturas</FooterLink></li>
              <li><FooterLink to="/help">Central de Ajuda</FooterLink></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Para Instituições</SectionTitle>
            <FooterLinks>
              <li><FooterLink to="/register?type=institution">Cadastrar Instituição</FooterLink></li>
              <li><FooterLink to="/create-opportunity">Criar Oportunidade</FooterLink></li>
              <li><FooterLink to="/volunteers">Gerenciar Voluntários</FooterLink></li>
              <li><FooterLink to="/reports">Relatórios</FooterLink></li>
              <li><FooterLink to="/partnerships">Parcerias</FooterLink></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Suporte</SectionTitle>
            <FooterLinks>
              <li><FooterLink to="/help">Central de Ajuda</FooterLink></li>
              <li><FooterLink to="/contact">Fale Conosco</FooterLink></li>
              <li><FooterLink to="/privacy">Política de Privacidade</FooterLink></li>
              <li><FooterLink to="/terms">Termos de Uso</FooterLink></li>
              <li><FooterLink to="/faq">Perguntas Frequentes</FooterLink></li>
            </FooterLinks>
          </FooterSection>
        </FooterTop>

        <FooterBottom>
          <Copyright>
            © 2024 Voluntariado. Todos os direitos reservados.
          </Copyright>
          <SocialLinks>
            <SocialLink href="#" aria-label="Facebook">
              <GlobeAltIcon width={20} height={20} />
            </SocialLink>
            <SocialLink href="#" aria-label="Instagram">
              <GlobeAltIcon width={20} height={20} />
            </SocialLink>
            <SocialLink href="#" aria-label="LinkedIn">
              <GlobeAltIcon width={20} height={20} />
            </SocialLink>
            <SocialLink href="#" aria-label="Twitter">
              <GlobeAltIcon width={20} height={20} />
            </SocialLink>
          </SocialLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
