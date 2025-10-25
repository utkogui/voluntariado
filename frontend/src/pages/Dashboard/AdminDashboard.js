import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  UserGroupIcon, 
  HeartIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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

const AnalyticsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const AnalyticsCard = styled.div`
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

const AnalyticsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AnalyticsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeights.tight};
`;

const AnalyticsValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
`;

const AnalyticsDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
`;

const AnalyticsMeta = styled.div`
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

const ModerationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ModerationCard = styled.div`
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

const ModerationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.iconColor}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor};
  flex-shrink: 0;
`;

const ModerationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModerationTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const ModerationDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const ModerationCount = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => props.theme.colors.error}20;
  color: ${props => props.theme.colors.error};
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleViewUsers = () => {
    navigate('/admin/users');
  };

  const handleViewOpportunities = () => {
    navigate('/admin/opportunities');
  };

  const handleViewAnalytics = () => {
    navigate('/admin/analytics');
  };

  const handleViewModeration = () => {
    navigate('/admin/moderation');
  };

  const analyticsMetrics = [
    {
      id: 1,
      title: 'Usuários Ativos',
      value: '2,847',
      description: 'Usuários que fizeram login nos últimos 30 dias',
      change: '+12%',
      positive: true
    },
    {
      id: 2,
      title: 'Oportunidades Criadas',
      value: '156',
      description: 'Novas oportunidades de voluntariado este mês',
      change: '+8%',
      positive: true
    },
    {
      id: 3,
      title: 'Taxa de Conversão',
      value: '23.4%',
      description: 'Taxa de candidaturas por visualização de oportunidade',
      change: '+2.1%',
      positive: true
    }
  ];

  const moderationItems = [
    {
      id: 1,
      title: 'Avaliações Pendentes',
      description: 'Avaliações aguardando moderação',
      count: 12,
      icon: ExclamationTriangleIcon,
      iconColor: '#F59E0B'
    },
    {
      id: 2,
      title: 'Relatórios de Comportamento',
      description: 'Relatórios de comportamento inadequado',
      count: 5,
      icon: ExclamationTriangleIcon,
      iconColor: '#EF4444'
    },
    {
      id: 3,
      title: 'Conteúdo Reportado',
      description: 'Conteúdo reportado para revisão',
      count: 8,
      icon: ExclamationTriangleIcon,
      iconColor: '#8B5CF6'
    }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Bem-vindo, {user?.name || 'Administrador'}! ⚙️
        </WelcomeTitle>
        <WelcomeSubtitle>
          Gerencie a plataforma, monitore métricas e mantenha a qualidade do conteúdo e interações.
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickActions>
        <ActionButton primary onClick={handleViewUsers}>
          <UserGroupIcon width={20} height={20} />
          Gerenciar Usuários
        </ActionButton>
        <ActionButton onClick={handleViewOpportunities}>
          <HeartIcon width={20} height={20} />
          Gerenciar Oportunidades
        </ActionButton>
        <ActionButton onClick={handleViewAnalytics}>
          <ChartBarIcon width={20} height={20} />
          Analytics
        </ActionButton>
        <ActionButton onClick={handleViewModeration}>
          <Cog6ToothIcon width={20} height={20} />
          Moderação
        </ActionButton>
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#3B82F6">
              <UserGroupIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>2,847</StatValue>
          <StatLabel>Usuários ativos</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +12% este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#10B981">
              <HeartIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>156</StatValue>
          <StatLabel>Oportunidades criadas</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +8% este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#F59E0B">
              <CheckCircleIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>1,234</StatValue>
          <StatLabel>Atividades concluídas</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +15% este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#8B5CF6">
              <ClockIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>23.4%</StatValue>
          <StatLabel>Taxa de conversão</StatLabel>
          <StatChange positive>
            <TrendingUpIcon width={16} height={16} />
            +2.1% este mês
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Métricas da Plataforma</SectionTitle>
            <ViewAllLink onClick={handleViewAnalytics}>
              Ver relatório completo
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          <AnalyticsList>
            {analyticsMetrics.map((metric) => (
              <AnalyticsCard key={metric.id}>
                <AnalyticsHeader>
                  <div>
                    <AnalyticsTitle>{metric.title}</AnalyticsTitle>
                  </div>
                  <AnalyticsValue>{metric.value}</AnalyticsValue>
                </AnalyticsHeader>
                <AnalyticsDescription>
                  {metric.description}
                </AnalyticsDescription>
                <AnalyticsMeta>
                  <MetaItem>
                    <TrendingUpIcon width={12} height={12} />
                    {metric.change} este mês
                  </MetaItem>
                </AnalyticsMeta>
              </AnalyticsCard>
            ))}
          </AnalyticsList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Moderação</SectionTitle>
            <ViewAllLink onClick={handleViewModeration}>
              Ver todas
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          <ModerationList>
            {moderationItems.map((item) => (
              <ModerationCard key={item.id} onClick={handleViewModeration}>
                <ModerationIcon iconColor={item.iconColor}>
                  <item.icon width={20} height={20} />
                </ModerationIcon>
                <ModerationInfo>
                  <ModerationTitle>{item.title}</ModerationTitle>
                  <ModerationDescription>{item.description}</ModerationDescription>
                </ModerationInfo>
                <ModerationCount>
                  {item.count}
                </ModerationCount>
              </ModerationCard>
            ))}
          </ModerationList>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default AdminDashboard;
