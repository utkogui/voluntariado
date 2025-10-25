import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

const ListContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const ListTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterTab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.gray600};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
  }
`;

const ActivityList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.gray100};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.status === 'upcoming' && `
    border-left: 4px solid ${props.theme.colors.primary};
  `}
  
  ${props => props.status === 'ongoing' && `
    border-left: 4px solid ${props.theme.colors.success};
  `}
  
  ${props => props.status === 'completed' && `
    border-left: 4px solid ${props.theme.colors.gray400};
    opacity: 0.7;
  `}
  
  ${props => props.status === 'cancelled' && `
    border-left: 4px solid ${props.theme.colors.error};
    opacity: 0.7;
  `}
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ActivityTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1;
`;

const ActivityType = styled.span`
  background-color: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-left: ${props => props.theme.spacing.sm};
`;

const ActivityDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: 1.4;
`;

const ActivityDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ParticipantsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const ParticipantCount = styled.span`
  background-color: ${props => props.theme.colors.gray100};
  color: ${props => props.theme.colors.gray700};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const ActivityActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  
  ${ActivityItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
  
  &.danger:hover {
    background-color: ${props => props.theme.colors.error}20;
    color: ${props => props.theme.colors.error};
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  
  ${props => {
    switch (props.status) {
      case 'upcoming':
        return `
          background-color: ${props.theme.colors.primary}20;
          color: ${props.theme.colors.primary};
        `;
      case 'ongoing':
        return `
          background-color: ${props.theme.colors.success}20;
          color: ${props.theme.colors.success};
        `;
      case 'completed':
        return `
          background-color: ${props.theme.colors.gray200};
          color: ${props.theme.colors.gray600};
        `;
      case 'cancelled':
        return `
          background-color: ${props.theme.colors.error}20;
          color: ${props.theme.colors.error};
        `;
      default:
        return `
          background-color: ${props.theme.colors.gray200};
          color: ${props.theme.colors.gray600};
        `;
    }
  }}
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
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

const ActivityListComponent = ({ 
  activities = [], 
  onActivitySelect, 
  onEditActivity, 
  onDeleteActivity,
  onJoinActivity,
  onLeaveActivity,
  currentFilter = 'all',
  onFilterChange,
  isLoading = false 
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const getActivityStatus = (activity) => {
    const now = new Date();
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    
    if (activity.status === 'cancelled') {
      return 'cancelled';
    }
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'Próxima';
      case 'ongoing': return 'Em andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'meeting': return 'Reunião';
      case 'event': return 'Evento';
      case 'workshop': return 'Workshop';
      case 'training': return 'Treinamento';
      case 'volunteer': return 'Voluntariado';
      default: return type;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (currentFilter === 'all') return true;
    return getActivityStatus(activity) === currentFilter;
  });

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  const handleActionClick = (action, activity, event) => {
    event.stopPropagation();
    
    switch (action) {
      case 'edit':
        if (onEditActivity) onEditActivity(activity);
        break;
      case 'delete':
        if (onDeleteActivity) onDeleteActivity(activity);
        break;
      case 'view':
        if (onActivitySelect) onActivitySelect(activity);
        break;
      case 'join':
        if (onJoinActivity) onJoinActivity(activity);
        break;
      case 'leave':
        if (onLeaveActivity) onLeaveActivity(activity);
        break;
    }
  };

  if (isLoading) {
    return (
      <ListContainer>
        <EmptyState>
          <EmptyIcon>
            <CalendarIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Carregando atividades...</EmptyTitle>
        </EmptyState>
      </ListContainer>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <ListContainer>
        <ListHeader>
          <ListTitle>
            <CalendarIcon width={24} height={24} />
            Atividades
          </ListTitle>
        </ListHeader>
        
        <EmptyState>
          <EmptyIcon>
            <CalendarIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma atividade encontrada</EmptyTitle>
          <EmptyMessage>
            {currentFilter === 'all' 
              ? 'Não há atividades cadastradas'
              : `Não há atividades com status "${getStatusLabel(currentFilter)}"`
            }
          </EmptyMessage>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <ListTitle>
          <CalendarIcon width={24} height={24} />
          Atividades ({filteredActivities.length})
        </ListTitle>
        
        <FilterTabs>
          <FilterTab
            active={currentFilter === 'all'}
            onClick={() => onFilterChange('all')}
          >
            Todas
          </FilterTab>
          <FilterTab
            active={currentFilter === 'upcoming'}
            onClick={() => onFilterChange('upcoming')}
          >
            Próximas
          </FilterTab>
          <FilterTab
            active={currentFilter === 'ongoing'}
            onClick={() => onFilterChange('ongoing')}
          >
            Em andamento
          </FilterTab>
          <FilterTab
            active={currentFilter === 'completed'}
            onClick={() => onFilterChange('completed')}
          >
            Concluídas
          </FilterTab>
        </FilterTabs>
      </ListHeader>

      <ActivityList>
        {filteredActivities.map((activity) => {
          const status = getActivityStatus(activity);
          const startDateTime = formatDateTime(activity.startDate);
          const endDateTime = formatDateTime(activity.endDate);
          const isParticipant = activity.participants?.some(p => p.id === activity.currentUserId);

          return (
            <ActivityItem
              key={activity.id}
              status={status}
              onClick={() => handleActivityClick(activity)}
            >
              <ActivityHeader>
                <ActivityTitle>{activity.title}</ActivityTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ActivityType>{getTypeLabel(activity.type)}</ActivityType>
                  <StatusBadge status={status}>
                    {getStatusLabel(status)}
                  </StatusBadge>
                </div>
              </ActivityHeader>

              {activity.description && (
                <ActivityDescription>
                  {activity.description}
                </ActivityDescription>
              )}

              <ActivityDetails>
                <DetailItem>
                  <CalendarIcon width={16} height={16} />
                  {startDateTime.date}
                </DetailItem>
                <DetailItem>
                  <ClockIcon width={16} height={16} />
                  {startDateTime.time} - {endDateTime.time}
                </DetailItem>
                {activity.location && (
                  <DetailItem>
                    <MapPinIcon width={16} height={16} />
                    {activity.location}
                  </DetailItem>
                )}
                {activity.isOnline && (
                  <DetailItem>
                    <MapPinIcon width={16} height={16} />
                    Online
                  </DetailItem>
                )}
              </ActivityDetails>

              <ActivityMeta>
                <ParticipantsInfo>
                  <UsersIcon width={16} height={16} />
                  <span>
                    {activity.participants?.length || 0}
                    {activity.maxParticipants && ` / ${activity.maxParticipants}`}
                  </span>
                  <ParticipantCount>
                    {activity.participants?.length || 0} participantes
                  </ParticipantCount>
                </ParticipantsInfo>

                <ActivityActions>
                  <ActionButton
                    onClick={(e) => handleActionClick('view', activity, e)}
                    title="Ver detalhes"
                  >
                    <EyeIcon width={16} height={16} />
                  </ActionButton>
                  
                  {status === 'upcoming' && (
                    <>
                      {isParticipant ? (
                        <ActionButton
                          onClick={(e) => handleActionClick('leave', activity, e)}
                          title="Sair da atividade"
                        >
                          <UserMinusIcon width={16} height={16} />
                        </ActionButton>
                      ) : (
                        <ActionButton
                          onClick={(e) => handleActionClick('join', activity, e)}
                          title="Participar da atividade"
                        >
                          <UserPlusIcon width={16} height={16} />
                        </ActionButton>
                      )}
                    </>
                  )}
                  
                  <ActionButton
                    onClick={(e) => handleActionClick('edit', activity, e)}
                    title="Editar atividade"
                  >
                    <PencilIcon width={16} height={16} />
                  </ActionButton>
                  
                  <ActionButton
                    className="danger"
                    onClick={(e) => handleActionClick('delete', activity, e)}
                    title="Excluir atividade"
                  >
                    <TrashIcon width={16} height={16} />
                  </ActionButton>
                </ActivityActions>
              </ActivityMeta>
            </ActivityItem>
          );
        })}
      </ActivityList>
    </ListContainer>
  );
};

export default ActivityListComponent;
