import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const CalendarContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const CalendarTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CalendarButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: ${props => props.theme.colors.border};
`;

const CalendarDayHeader = styled.div`
  background-color: ${props => props.theme.colors.gray100};
  padding: ${props => props.theme.spacing.sm};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
`;

const CalendarDay = styled.div`
  background-color: ${props => props.theme.colors.surface};
  min-height: 120px;
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  ${props => props.isToday && `
    background-color: ${props.theme.colors.primary}10;
    border: 1px solid ${props.theme.colors.primary}30;
  `}
  
  ${props => props.isSelected && `
    background-color: ${props.theme.colors.primary}20;
    border: 1px solid ${props.theme.colors.primary};
  `}
  
  ${props => props.isOtherMonth && `
    background-color: ${props.theme.colors.gray50};
    color: ${props.theme.colors.gray400};
  `}
`;

const DayNumber = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
  
  ${props => props.isOtherMonth && `
    color: ${props.theme.colors.gray400};
  `}
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ActivityItem = styled.div`
  background-color: ${props => props.theme.colors.primary}20;
  border: 1px solid ${props => props.theme.colors.primary}40;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 2px 4px;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}30;
  }
  
  ${props => props.type === 'meeting' && `
    background-color: ${props.theme.colors.secondary}20;
    border-color: ${props.theme.colors.secondary}40;
    color: ${props.theme.colors.secondary};
    
    &:hover {
      background-color: ${props.theme.colors.secondary}30;
    }
  `}
  
  ${props => props.type === 'event' && `
    background-color: ${props.theme.colors.accent}20;
    border-color: ${props.theme.colors.accent}40;
    color: ${props.theme.colors.accent};
    
    &:hover {
      background-color: ${props.theme.colors.accent}30;
    }
  `}
`;

const MoreActivities = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  text-align: center;
  margin-top: 2px;
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

const Calendar = ({ 
  activities = [], 
  onDateSelect, 
  onActivitySelect, 
  onCreateActivity,
  selectedDate,
  view = 'month' 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(selectedDate || new Date());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isOtherMonth: true
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isOtherMonth: false
      });
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isOtherMonth: true
      });
    }
    
    return days;
  };

  const getActivitiesForDate = (date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.startDate);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleActivityClick = (activity, event) => {
    event.stopPropagation();
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const currentMonthActivities = useMemo(() => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.startDate);
      return activityDate.getMonth() === currentDate.getMonth() && 
             activityDate.getFullYear() === currentDate.getFullYear();
    });
  }, [activities, currentDate]);

  if (currentMonthActivities.length === 0) {
    return (
      <CalendarContainer>
        <CalendarHeader>
          <CalendarTitle>
            <CalendarIcon width={24} height={24} />
            Calendário
          </CalendarTitle>
          <CalendarControls>
            <CalendarButton onClick={handlePreviousMonth}>
              <ChevronLeftIcon width={16} height={16} />
            </CalendarButton>
            <CalendarButton onClick={handleToday}>Hoje</CalendarButton>
            <CalendarButton onClick={handleNextMonth}>
              <ChevronRightIcon width={16} height={16} />
            </CalendarButton>
          </CalendarControls>
        </CalendarHeader>
        
        <EmptyState>
          <EmptyIcon>
            <CalendarIcon width={32} height={32} />
          </EmptyIcon>
          <EmptyTitle>Nenhuma atividade agendada</EmptyTitle>
          <EmptyMessage>
            Não há atividades para o mês de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </EmptyMessage>
        </EmptyState>
      </CalendarContainer>
    );
  }

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          <CalendarIcon width={24} height={24} />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </CalendarTitle>
        <CalendarControls>
          <CalendarButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon width={16} height={16} />
          </CalendarButton>
          <CalendarButton onClick={handleToday}>Hoje</CalendarButton>
          <CalendarButton onClick={handleNextMonth}>
            <ChevronRightIcon width={16} height={16} />
          </CalendarButton>
          {onCreateActivity && (
            <CalendarButton onClick={() => onCreateActivity(selectedDay)}>
              <PlusIcon width={16} height={16} />
            </CalendarButton>
          )}
        </CalendarControls>
      </CalendarHeader>

      <CalendarGrid>
        {dayNames.map(day => (
          <CalendarDayHeader key={day}>{day}</CalendarDayHeader>
        ))}
        
        {days.map((day, index) => {
          const dayActivities = getActivitiesForDate(day.date);
          const maxVisibleActivities = 3;
          const visibleActivities = dayActivities.slice(0, maxVisibleActivities);
          const remainingCount = dayActivities.length - maxVisibleActivities;

          return (
            <CalendarDay
              key={index}
              isToday={isToday(day.date)}
              isSelected={isSelected(day.date)}
              isOtherMonth={day.isOtherMonth}
              onClick={() => handleDayClick(day.date)}
            >
              <DayNumber isOtherMonth={day.isOtherMonth}>
                {day.date.getDate()}
              </DayNumber>
              
              {dayActivities.length > 0 && (
                <ActivityList>
                  {visibleActivities.map((activity, activityIndex) => (
                    <ActivityItem
                      key={activityIndex}
                      type={activity.type}
                      onClick={(e) => handleActivityClick(activity, e)}
                      title={activity.title}
                    >
                      {activity.title}
                    </ActivityItem>
                  ))}
                  
                  {remainingCount > 0 && (
                    <MoreActivities>
                      +{remainingCount} mais
                    </MoreActivities>
                  )}
                </ActivityList>
              )}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar;
