import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChartBarIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import MetricCard from './MetricCard';
import Chart from './Chart';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.lg};
`;

const DashboardTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const DashboardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.variant === 'primary' ? props.theme.colors.white : props.theme.colors.gray700};
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.gray100};
  }
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const WidgetContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const WidgetTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const WidgetActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  
  ${WidgetContainer}:hover & {
    opacity: 1;
  }
`;

const WidgetActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
`;

const WidgetContent = styled.div`
  min-height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.gray400};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
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

const Dashboard = ({
  title = "Dashboard de Analytics",
  metrics = [],
  charts = [],
  widgets = [],
  isLoading = false,
  error = null,
  onRefresh = null,
  onAddWidget = null,
  onEditWidget = null,
  onDeleteWidget = null,
  onShareDashboard = null,
  onConfigureDashboard = null
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleAddWidget = () => {
    if (onAddWidget) {
      onAddWidget();
    }
  };

  const handleEditWidget = (widget) => {
    if (onEditWidget) {
      onEditWidget(widget);
    }
  };

  const handleDeleteWidget = (widget) => {
    if (onDeleteWidget) {
      onDeleteWidget(widget);
    }
  };

  const handleShareDashboard = () => {
    if (onShareDashboard) {
      onShareDashboard();
    }
  };

  const handleConfigureDashboard = () => {
    if (onConfigureDashboard) {
      onConfigureDashboard();
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingState>Carregando dashboard...</LoadingState>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorState>
          <ErrorTitle>Erro ao carregar dashboard</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>
          <ChartBarIcon width={32} height={32} />
          {title}
        </DashboardTitle>
        <DashboardActions>
          <ActionButton onClick={handleRefresh} disabled={refreshing}>
            <ArrowPathIcon width={16} height={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </ActionButton>
          <ActionButton onClick={handleAddWidget}>
            <PlusIcon width={16} height={16} />
            Adicionar Widget
          </ActionButton>
          <ActionButton onClick={handleShareDashboard}>
            <ShareIcon width={16} height={16} />
            Compartilhar
          </ActionButton>
          <ActionButton onClick={handleConfigureDashboard}>
            <Cog6ToothIcon width={16} height={16} />
            Configurar
          </ActionButton>
        </DashboardActions>
      </DashboardHeader>

      {/* Métricas */}
      {metrics && metrics.length > 0 && (
        <MetricsGrid>
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
              trendPeriod={metric.trendPeriod}
              status={metric.status}
              progress={metric.progress}
              onClick={metric.onClick}
            />
          ))}
        </MetricsGrid>
      )}

      {/* Gráficos */}
      {charts && charts.length > 0 && (
        <ChartsGrid>
          {charts.map((chart, index) => (
            <Chart
              key={index}
              type={chart.type}
              data={chart.data}
              options={chart.options}
              title={chart.title}
              height={chart.height}
              isLoading={chart.isLoading}
              error={chart.error}
              onExport={chart.onExport}
              onRefresh={chart.onRefresh}
              showLegend={chart.showLegend}
              showStats={chart.showStats}
              stats={chart.stats}
            />
          ))}
        </ChartsGrid>
      )}

      {/* Widgets Personalizados */}
      {widgets && widgets.length > 0 && (
        <DashboardContent>
          {widgets.map((widget, index) => (
            <WidgetContainer key={index}>
              <WidgetHeader>
                <WidgetTitle>{widget.title}</WidgetTitle>
                <WidgetActions>
                  <WidgetActionButton onClick={() => handleEditWidget(widget)} title="Editar">
                    <PencilIcon width={16} height={16} />
                  </WidgetActionButton>
                  <WidgetActionButton onClick={() => handleDeleteWidget(widget)} title="Excluir">
                    <TrashIcon width={16} height={16} />
                  </WidgetActionButton>
                </WidgetActions>
              </WidgetHeader>
              <WidgetContent>
                {widget.content}
              </WidgetContent>
            </WidgetContainer>
          ))}
        </DashboardContent>
      )}

      {/* Estado Vazio */}
      {(!metrics || metrics.length === 0) && 
       (!charts || charts.length === 0) && 
       (!widgets || widgets.length === 0) && (
        <EmptyState>
          <EmptyIcon>
            <ChartBarIcon width={48} height={48} />
          </EmptyIcon>
          <EmptyTitle>Dashboard Vazio</EmptyTitle>
          <EmptyMessage>
            Adicione widgets e métricas para começar a visualizar seus dados
          </EmptyMessage>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
