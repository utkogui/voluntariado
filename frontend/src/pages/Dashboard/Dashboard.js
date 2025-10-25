import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  HeartIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon, 
  BellIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { fetchOpportunitiesStart } from '../../store/slices/opportunitiesSlice';
import { fetchNotificationsStart } from '../../store/slices/notificationsSlice';
import VolunteerDashboard from './VolunteerDashboard';
import InstitutionDashboard from './InstitutionDashboard';
import CompanyDashboard from './CompanyDashboard';
import UniversityDashboard from './UniversityDashboard';
import AdminDashboard from './AdminDashboard';

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

const QuickStats = styled.div`
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

const RecentActivity = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
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

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { list: opportunities, isLoading: opportunitiesLoading } = useSelector(state => state.opportunities);
  const { list: notifications, isLoading: notificationsLoading } = useSelector(state => state.notifications);

  useEffect(() => {
    // Carregar dados iniciais do dashboard
    dispatch(fetchOpportunitiesStart());
    dispatch(fetchNotificationsStart());
  }, [dispatch]);

  const getUserDisplayName = () => {
    return user?.name || 'Usuário';
  };

  const getUserTypeDisplayName = () => {
    const types = {
      VOLUNTEER: 'Voluntário',
      INSTITUTION: 'Instituição',
      COMPANY: 'Empresa',
      UNIVERSITY: 'Universidade',
      ADMIN: 'Administrador'
    };
    return types[user?.userType] || 'Usuário';
  };

  const renderDashboard = () => {
    switch (user?.userType) {
      case 'VOLUNTEER':
        return <VolunteerDashboard />;
      case 'INSTITUTION':
        return <InstitutionDashboard />;
      case 'COMPANY':
        return <CompanyDashboard />;
      case 'UNIVERSITY':
        return <UniversityDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  const DefaultDashboard = () => (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>
          Bem-vindo, {getUserDisplayName()}!
        </WelcomeTitle>
        <WelcomeSubtitle>
          Aqui está um resumo da sua atividade como {getUserTypeDisplayName().toLowerCase()}
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickStats>
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
              <CalendarIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>3</StatValue>
          <StatLabel>Atividades agendadas</StatLabel>
          <StatChange positive>
            +1 esta semana
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#8B5CF6">
              <ChatBubbleLeftRightIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>5</StatValue>
          <StatLabel>Conversas ativas</StatLabel>
          <StatChange positive>
            +2 hoje
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon iconColor="#F59E0B">
              <BellIcon width={24} height={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{notifications.length}</StatValue>
          <StatLabel>Notificações</StatLabel>
          <StatChange positive>
            {notifications.filter(n => !n.read).length} não lidas
          </StatChange>
        </StatCard>
      </QuickStats>

      <RecentActivity>
        <SectionTitle>Atividade Recente</SectionTitle>
        <ActivityList>
          <ActivityItem>
            <ActivityIcon iconColor="#3B82F6">
              <HeartIcon width={20} height={20} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Nova oportunidade disponível</ActivityTitle>
              <ActivityDescription>
                "Ajuda com distribuição de alimentos" - ONG Esperança
              </ActivityDescription>
            </ActivityContent>
            <ActivityTime>2h atrás</ActivityTime>
          </ActivityItem>

          <ActivityItem>
            <ActivityIcon iconColor="#10B981">
              <CheckCircleIcon width={20} height={20} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Participação confirmada</ActivityTitle>
              <ActivityDescription>
                Sua participação em "Limpeza da praia" foi confirmada
              </ActivityDescription>
            </ActivityContent>
            <ActivityTime>1 dia atrás</ActivityTime>
          </ActivityItem>

          <ActivityItem>
            <ActivityIcon iconColor="#8B5CF6">
              <ChatBubbleLeftRightIcon width={20} height={20} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Nova mensagem</ActivityTitle>
              <ActivityDescription>
                Você recebeu uma mensagem de ONG Esperança
              </ActivityDescription>
            </ActivityContent>
            <ActivityTime>2 dias atrás</ActivityTime>
          </ActivityItem>
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );

  return renderDashboard();
};

export default Dashboard;
