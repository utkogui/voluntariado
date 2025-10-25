import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  AcademicCapIcon, 
  UserGroupIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const WelcomeTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.primary ? 'white' : props.theme.colors.gray700};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.gray50};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.iconColor}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatChange = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const ViewAllLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const EngagementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EngagementCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const EngagementHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EngagementTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeights.tight};
`;

const EngagementValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
`;

const EngagementDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
`;

const EngagementMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PartnershipList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PartnershipCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.gray50};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const PartnershipLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  flex-shrink: 0;
`;

const PartnershipInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PartnershipName = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const PartnershipType = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const PartnershipStatus = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => props.theme.colors.success}20;
  color: ${props => props.theme.colors.success};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.md} auto;
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray400};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const UniversityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleViewEngagement = () => {
    navigate('/student-engagement');
  };

  const handleViewPartnerships = () => {
    navigate('/partnerships');
  };

  const engagementMetrics = [
    {
      id: 1,
      title: 'Estudantes Ativos',
      value: '342',
      description: 'Estudantes participando de atividades de voluntariado',
      change: '+28',
      positive: true
    },
    {
      id: 2,
      title: 'Horas de Serviço',
      value: '2,156h',
      description: 'Horas de serviço comunitário registradas este semestre',
      change: '+15%',
      positive: true
    },
    {
      id: 3,
      title: 'Projetos Sociais',
      value: '18',
      description: 'Projetos de extensão comunitária em andamento',
      change: '+3',
      positive: true
    }
  ];

  const partnerships = [
    {
      id: 1,
      name: 'ONG Esperança',
      type: 'Projetos de educação',
      status: 'Ativa',
      logo: 'OE'
    },
    {
      id: 2,
      name: 'Instituto Verde',
      type: 'Sustentabilidade',
      status: 'Ativa',
      logo: 'IV'
    },
    {
      id: 3,
      name: 'Casa do Bem',
      type: 'Assistência social',
      status: 'Pendente',
      logo: 'CB'
    }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Bem-vinda, {user?.name || 'Universidade'}! 🎓
        </WelcomeTitle>
        <WelcomeSubtitle>
          Acompanhe o engajamento dos seus estudantes em atividades de voluntariado e extensão comunitária.
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickActions>
        <ActionButton primary onClick={handleViewEngagement}>
          <AcademicCapIcon width={20} height={20} />
          Engajamento Estudantil
        </ActionButton>
        <ActionButton onClick={handleViewPartnerships}>
          <BuildingOfficeIcon width={20} height={20} />
          Gerenciar Parcerias
        </ActionButton>
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#3B82F6">
              <UserGroupIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>342</StatValue>
          <StatLabel>Estudantes ativos</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +28 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#10B981">
              <ClockIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>2,156h</StatValue>
          <StatLabel>Horas de serviço</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +15% este semestre
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#F59E0B">
              <AcademicCapIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>18</StatValue>
          <StatLabel>Projetos sociais</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +3 este semestre
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#8B5CF6">
              <BuildingOfficeIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>12</StatValue>
          <StatLabel>Parcerias ativas</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +2 este mês
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Métricas de Engajamento</SectionTitle>
            <ViewAllLink onClick={handleViewEngagement}>
              Ver relatório completo
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          <EngagementList>
            {engagementMetrics.map((metric) => (
              <EngagementCard key={metric.id}>
                <EngagementHeader>
                  <div>
                    <EngagementTitle>{metric.title}</EngagementTitle>
                  </div>
                  <EngagementValue>{metric.value}</EngagementValue>
                </EngagementHeader>
                <EngagementDescription>
                  {metric.description}
                </EngagementDescription>
                <EngagementMeta>
                  <MetaItem>
                    <TrendingUpIcon width={12} height={12} />
                    {metric.change} este semestre
                  </MetaItem>
                </EngagementMeta>
              </EngagementCard>
            ))}
          </EngagementList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Parcerias Ativas</SectionTitle>
            <ViewAllLink onClick={handleViewPartnerships}>
              Ver todas
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          <PartnershipList>
            {partnerships.map((partnership) => (
              <PartnershipCard key={partnership.id}>
                <PartnershipLogo>
                  {partnership.logo}
                </PartnershipLogo>
                <PartnershipInfo>
                  <PartnershipName>{partnership.name}</PartnershipName>
                  <PartnershipType>{partnership.type}</PartnershipType>
                </PartnershipInfo>
                <PartnershipStatus>
                  {partnership.status}
                </PartnershipStatus>
              </PartnershipCard>
            ))}
          </PartnershipList>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default UniversityDashboard;
