import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  HeartIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { fetchOpportunitiesStart } from '../../store/slices/opportunitiesSlice';

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

const OpportunityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const OpportunityCard = styled.div`
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

const OpportunityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const OpportunityTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeights.tight};
`;

const OpportunityInstitution = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const OpportunityDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OpportunityMeta = styled.div`
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

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
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

const ActivityIcon = styled.div`
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

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const ActivityDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const ActivityTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  white-space: nowrap;
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

const VolunteerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { list: opportunities, isLoading } = useSelector(state => state.opportunities);

  useEffect(() => {
    dispatch(fetchOpportunitiesStart());
  }, [dispatch]);

  const handleViewOpportunities = () => {
    navigate('/opportunities');
  };

  const handleViewApplications = () => {
    navigate('/my-applications');
  };

  const handleViewSchedule = () => {
    navigate('/schedule');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const recentOpportunities = opportunities.slice(0, 3);
  const upcomingActivities = [
    {
      id: 1,
      title: 'Limpeza da praia',
      institution: 'ONG Verde Vida',
      date: '2024-01-15',
      time: '08:00',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Distribuição de alimentos',
      institution: 'Banco de Alimentos',
      date: '2024-01-18',
      time: '14:00',
      status: 'pending'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Candidatura enviada',
      description: 'Para "Ajuda com distribuição de alimentos"',
      time: '2h atrás',
      icon: HeartIcon,
      iconColor: '#3B82F6'
    },
    {
      id: 2,
      title: 'Participação confirmada',
      description: 'Em "Limpeza da praia" para 15/01',
      time: '1 dia atrás',
      icon: CheckCircleIcon,
      iconColor: '#10B981'
    },
    {
      id: 3,
      title: 'Avaliação recebida',
      description: '5 estrelas da ONG Esperança',
      time: '3 dias atrás',
      icon: StarIcon,
      iconColor: '#F59E0B'
    }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Olá, {user?.name || 'Voluntário'}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle>
          Pronto para fazer a diferença? Encontre oportunidades incríveis e participe de atividades que transformam vidas.
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickActions>
        <ActionButton primary onClick={handleViewOpportunities}>
          <PlusIcon width={20} height={20} />
          Encontrar Oportunidades
        </ActionButton>
        <ActionButton onClick={handleViewApplications}>
          <HeartIcon width={20} height={20} />
          Minhas Candidaturas
        </ActionButton>
        <ActionButton onClick={handleViewSchedule}>
          <CalendarIcon width={20} height={20} />
          Minha Agenda
        </ActionButton>
        <ActionButton onClick={handleViewProfile}>
          <UserGroupIcon width={20} height={20} />
          Meu Perfil
        </ActionButton>
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#3B82F6">
              <HeartIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{opportunities.length}</StatValue>
          <StatLabel>Oportunidades disponíveis</StatLabel>
          <StatChange positive>
            +12% este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#10B981">
              <CheckCircleIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>8</StatValue>
          <StatLabel>Atividades concluídas</StatLabel>
          <StatChange positive>
            +2 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#F59E0B">
              <StarIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>4.8</StatValue>
          <StatLabel>Avaliação média</StatLabel>
          <StatChange positive>
            +0.2 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#8B5CF6">
              <ClockIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>24h</StatValue>
          <StatLabel>Horas voluntariadas</StatLabel>
          <StatChange positive>
            +8h este mês
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Oportunidades Recentes</SectionTitle>
            <ViewAllLink onClick={handleViewOpportunities}>
              Ver todas
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          {recentOpportunities.length > 0 ? (
            <OpportunityList>
              {recentOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
                  <OpportunityHeader>
                    <div>
                      <OpportunityTitle>{opportunity.title}</OpportunityTitle>
                      <OpportunityInstitution>{opportunity.institution?.name}</OpportunityInstitution>
                    </div>
                  </OpportunityHeader>
                  <OpportunityDescription>
                    {opportunity.description}
                  </OpportunityDescription>
                  <OpportunityMeta>
                    <MetaItem>
                      <CalendarIcon width={12} height={12} />
                      {new Date(opportunity.startDate).toLocaleDateString('pt-BR')}
                    </MetaItem>
                    <MetaItem>
                      <ClockIcon width={12} height={12} />
                      {opportunity.durationInHours}h
                    </MetaItem>
                    <MetaItem>
                      <UserGroupIcon width={12} height={12} />
                      {opportunity.maxParticipants} vagas
                    </MetaItem>
                  </OpportunityMeta>
                </OpportunityCard>
              ))}
            </OpportunityList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <HeartIcon width={32} height={32} />
              </EmptyIcon>
              <EmptyTitle>Nenhuma oportunidade encontrada</EmptyTitle>
              <EmptyMessage>
                Que tal explorar as oportunidades disponíveis?
              </EmptyMessage>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Atividade Recente</SectionTitle>
          </SectionHeader>
          
          <ActivityList>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon iconColor={activity.iconColor}>
                  <activity.icon width={20} height={20} />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                </ActivityContent>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default VolunteerDashboard;
