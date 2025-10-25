import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  HeartIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
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

const OpportunityStatus = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => props.status === 'active' ? props.theme.colors.success + '20' : props.theme.colors.warning + '20'};
  color: ${props => props.status === 'active' ? props.theme.colors.success : props.theme.colors.warning};
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

const VolunteerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const VolunteerCard = styled.div`
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

const VolunteerAvatar = styled.div`
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

const VolunteerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const VolunteerName = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const VolunteerActivity = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const VolunteerRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
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

const InstitutionDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { list: opportunities, isLoading } = useSelector(state => state.opportunities);

  useEffect(() => {
    dispatch(fetchOpportunitiesStart());
  }, [dispatch]);

  const handleCreateOpportunity = () => {
    navigate('/create-opportunity');
  };

  const handleViewOpportunities = () => {
    navigate('/my-opportunities');
  };

  const handleViewVolunteers = () => {
    navigate('/volunteers');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const myOpportunities = opportunities.filter(opp => opp.institution?.id === user?.id).slice(0, 3);
  const recentVolunteers = [
    {
      id: 1,
      name: 'Maria Silva',
      activity: 'Ajuda com distribuição de alimentos',
      rating: 4.8,
      avatar: 'MS'
    },
    {
      id: 2,
      name: 'João Santos',
      activity: 'Limpeza da praia',
      rating: 4.9,
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Ana Costa',
      activity: 'Aulas de reforço',
      rating: 5.0,
      avatar: 'AC'
    }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Bem-vinda, {user?.name || 'Instituição'}! 🏛️
        </WelcomeTitle>
        <WelcomeSubtitle>
          Gerencie suas oportunidades e conecte-se com voluntários dedicados para fazer a diferença em sua comunidade.
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickActions>
        <ActionButton primary onClick={handleCreateOpportunity}>
          <PlusIcon width={20} height={20} />
          Criar Oportunidade
        </ActionButton>
        <ActionButton onClick={handleViewOpportunities}>
          <HeartIcon width={20} height={20} />
          Minhas Oportunidades
        </ActionButton>
        <ActionButton onClick={handleViewVolunteers}>
          <UserGroupIcon width={20} height={20} />
          Gerenciar Voluntários
        </ActionButton>
        <ActionButton onClick={handleViewReports}>
          <ChartBarIcon width={20} height={20} />
          Relatórios
        </ActionButton>
      </QuickActions>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#3B82F6">
              <HeartIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{myOpportunities.length}</StatValue>
          <StatLabel>Oportunidades ativas</StatLabel>
          <StatChange positive>
            +2 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#10B981">
              <UserGroupIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>24</StatValue>
          <StatLabel>Voluntários ativos</StatLabel>
          <StatChange positive>
            +5 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#F59E0B">
              <CheckCircleIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>156</StatValue>
          <StatLabel>Atividades concluídas</StatLabel>
          <StatChange positive>
            +12 este mês
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#8B5CF6">
              <StarIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>4.7</StatValue>
          <StatLabel>Avaliação média</StatLabel>
          <StatChange positive>
            +0.1 este mês
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Suas Oportunidades</SectionTitle>
            <ViewAllLink onClick={handleViewOpportunities}>
              Ver todas
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          {myOpportunities.length > 0 ? (
            <OpportunityList>
              {myOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
                  <OpportunityHeader>
                    <div>
                      <OpportunityTitle>{opportunity.title}</OpportunityTitle>
                    </div>
                    <OpportunityStatus status={opportunity.status === 'ACTIVE' ? 'active' : 'pending'}>
                      {opportunity.status === 'ACTIVE' ? 'Ativa' : 'Pendente'}
                    </OpportunityStatus>
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
                      {opportunity.applications?.length || 0} candidatos
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
              <EmptyTitle>Nenhuma oportunidade criada</EmptyTitle>
              <EmptyMessage>
                Que tal criar sua primeira oportunidade de voluntariado?
              </EmptyMessage>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Voluntários Recentes</SectionTitle>
            <ViewAllLink onClick={handleViewVolunteers}>
              Ver todos
              <ArrowRightIcon width={16} height={16} />
            </ViewAllLink>
          </SectionHeader>
          
          <VolunteerList>
            {recentVolunteers.map((volunteer) => (
              <VolunteerCard key={volunteer.id}>
                <VolunteerAvatar>
                  {volunteer.avatar}
                </VolunteerAvatar>
                <VolunteerInfo>
                  <VolunteerName>{volunteer.name}</VolunteerName>
                  <VolunteerActivity>{volunteer.activity}</VolunteerActivity>
                </VolunteerInfo>
                <VolunteerRating>
                  <StarIcon width={12} height={12} />
                  {volunteer.rating}
                </VolunteerRating>
              </VolunteerCard>
            ))}
          </VolunteerList>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default InstitutionDashboard;
