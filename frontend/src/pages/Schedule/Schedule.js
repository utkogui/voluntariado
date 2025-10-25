import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CalendarIcon,
  PlusIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { fetchActivities } from '../../store/slices/scheduleSlice';
import useSchedule from '../../hooks/useSchedule';
import Calendar from '../../components/Schedule/Calendar';
import ActivityList from '../../components/Schedule/ActivityList';
import ActivityForm from '../../components/Schedule/ActivityForm';

const ScheduleContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const PageHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const PageDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const ViewControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.gray600};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
  }
`;

const SearchAndFilters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.gray600};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
  }
`;

const CreateButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: ${props => props.view === 'calendar' ? '1fr' : '1fr'};
  gap: ${props => props.theme.spacing.xl};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: ${props => props.view === 'calendar' ? '2fr 1fr' : '1fr'};
  }
`;

const CalendarSection = styled.div`
  ${props => props.view === 'list' && 'display: none;'}
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const ListSection = styled.div`
  ${props => props.view === 'calendar' && 'display: none;'}
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.gray500};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.error};
  text-align: center;
`;

const ErrorTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.error};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ErrorMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const Schedule = () => {
  const dispatch = useDispatch();
  const { activities, isLoading, error } = useSelector(state => state.schedule);
  const [view, setView] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  const {
    loadActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    joinActivity,
    leaveActivity
  } = useSchedule();

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowActivityForm(true);
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
  };

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async (activity) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await deleteActivity(activity.id);
      } catch (error) {
        console.error('Erro ao excluir atividade:', error);
      }
    }
  };

  const handleJoinActivity = async (activity) => {
    try {
      await joinActivity(activity.id);
    } catch (error) {
      console.error('Erro ao participar da atividade:', error);
    }
  };

  const handleLeaveActivity = async (activity) => {
    try {
      await leaveActivity(activity.id);
    } catch (error) {
      console.error('Erro ao sair da atividade:', error);
    }
  };

  const handleActivitySubmit = async (activityData) => {
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, activityData);
      } else {
        await createActivity(activityData);
      }
      setShowActivityForm(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    }
  };

  const handleCloseForm = () => {
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const filteredActivities = activities.filter(activity => {
    if (searchTerm) {
      return activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getActivityStats = () => {
    const now = new Date();
    const upcoming = activities.filter(activity => new Date(activity.startDate) > now).length;
    const ongoing = activities.filter(activity => {
      const start = new Date(activity.startDate);
      const end = new Date(activity.endDate);
      return now >= start && now <= end;
    }).length;
    const completed = activities.filter(activity => new Date(activity.endDate) < now).length;
    const total = activities.length;

    return { upcoming, ongoing, completed, total };
  };

  const stats = getActivityStats();

  if (isLoading) {
    return (
      <ScheduleContainer>
        <LoadingState>Carregando atividades...</LoadingState>
      </ScheduleContainer>
    );
  }

  if (error) {
    return (
      <ScheduleContainer>
        <ErrorState>
          <ErrorTitle>Erro ao carregar atividades</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </ScheduleContainer>
    );
  }

  return (
    <ScheduleContainer>
      <PageHeader>
        <PageTitle>
          <CalendarIcon width={32} height={32} />
          Agendamento de Atividades
        </PageTitle>
        <PageDescription>
          Gerencie suas atividades, reuniões e eventos
        </PageDescription>
      </PageHeader>

      {/* Estatísticas */}
      <StatsSection>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total de Atividades</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.upcoming}</StatValue>
          <StatLabel>Próximas</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.ongoing}</StatValue>
          <StatLabel>Em Andamento</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Concluídas</StatLabel>
        </StatCard>
      </StatsSection>

      {/* Controles */}
      <ControlsSection>
        <ViewControls>
          <ViewButton
            active={view === 'calendar'}
            onClick={() => setView('calendar')}
          >
            <CalendarIcon width={16} height={16} />
            Calendário
          </ViewButton>
          <ViewButton
            active={view === 'list'}
            onClick={() => setView('list')}
          >
            <ListBulletIcon width={16} height={16} />
            Lista
          </ViewButton>
        </ViewControls>

        <SearchAndFilters>
          <SearchInput
            type="text"
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterButton
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon width={16} height={16} />
          </FilterButton>
        </SearchAndFilters>

        <CreateButton onClick={handleCreateActivity}>
          <PlusIcon width={16} height={16} />
          Nova Atividade
        </CreateButton>
      </ControlsSection>

      {/* Conteúdo */}
      <ContentArea view={view}>
        <CalendarSection view={view}>
          <Calendar
            activities={filteredActivities}
            onDateSelect={handleDateSelect}
            onActivitySelect={handleActivitySelect}
            onCreateActivity={handleCreateActivity}
            selectedDate={selectedDate}
          />
        </CalendarSection>

        <ListSection view={view}>
          <ActivityList
            activities={filteredActivities}
            onActivitySelect={handleActivitySelect}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onJoinActivity={handleJoinActivity}
            onLeaveActivity={handleLeaveActivity}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            isLoading={isLoading}
          />
        </ListSection>
      </ContentArea>

      {/* Formulário de Atividade */}
      <ActivityForm
        isOpen={showActivityForm}
        onClose={handleCloseForm}
        onSubmit={handleActivitySubmit}
        activity={editingActivity}
        initialDate={selectedDate}
        isLoading={isLoading}
      />
    </ScheduleContainer>
  );
};

export default Schedule;
