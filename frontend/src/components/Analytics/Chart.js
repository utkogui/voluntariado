import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ChartLineIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';

const ChartContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ChartIcon = styled.div`
  width: 24px;
  height: 24px;
  color: ${props => props.theme.colors.primary};
`;

const ChartActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const ActionButton = styled.button`
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

const ChartContent = styled.div`
  position: relative;
  height: ${props => props.height || '300px'};
  width: 100%;
`;

const ChartCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.color};
`;

const ChartStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.sm};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.colors.gray500};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.theme.colors.error};
  text-align: center;
`;

const ErrorMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: ${props => props.theme.spacing.sm} 0 0 0;
`;

const Chart = ({ 
  type = 'line',
  data = [],
  options = {},
  title = '',
  height = 300,
  isLoading = false,
  error = null,
  onExport = null,
  onRefresh = null,
  showLegend = true,
  showStats = true,
  stats = []
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  const getChartIcon = () => {
    switch (type) {
      case 'bar':
        return <ChartBarIcon width={24} height={24} />;
      case 'pie':
        return <ChartPieIcon width={24} height={24} />;
      case 'line':
      default:
        return <ChartLineIcon width={24} height={24} />;
    }
  };

  const renderSimpleChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height: canvasHeight } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);
    
    if (!data || data.length === 0) return;

    // Simple chart rendering based on type
    switch (type) {
      case 'bar':
        renderBarChart(ctx, width, canvasHeight);
        break;
      case 'pie':
        renderPieChart(ctx, width, canvasHeight);
        break;
      case 'line':
      default:
        renderLineChart(ctx, width, canvasHeight);
        break;
    }
  };

  const renderBarChart = (ctx, width, height) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * height * 0.8;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - barHeight - 20;
      
      ctx.fillStyle = item.color || '#3B82F6';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - 5);
    });
  };

  const renderLineChart = (ctx, width, height) => {
    if (data.length < 2) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((item, index) => {
      const x = (index / (data.length - 1)) * (width - 40) + 20;
      const y = height - 20 - ((item.value - minValue) / valueRange) * (height - 40);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Data points
    data.forEach((item, index) => {
      const x = (index / (data.length - 1)) * (width - 40) + 20;
      const y = height - 20 - ((item.value - minValue) / valueRange) * (height - 40);
      
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const renderPieChart = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.fillStyle = item.color || `hsl(${index * 60}, 70%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      renderSimpleChart();
    }
  }, [data, type, height]);

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export behavior
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${title || 'chart'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>
            <ChartIcon>{getChartIcon()}</ChartIcon>
            {title}
          </ChartTitle>
        </ChartHeader>
        <LoadingState>Carregando gráfico...</LoadingState>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>
            <ChartIcon>{getChartIcon()}</ChartIcon>
            {title}
          </ChartTitle>
        </ChartHeader>
        <ErrorState>
          <div>Erro ao carregar gráfico</div>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>
          <ChartIcon>{getChartIcon()}</ChartTitle>
          {title}
        </ChartTitle>
        <ChartActions>
          {onRefresh && (
            <ActionButton onClick={onRefresh} title="Atualizar">
              <TrendingUpIcon width={16} height={16} />
            </ActionButton>
          )}
          <ActionButton onClick={handleExport} title="Exportar">
            <TrendingDownIcon width={16} height={16} />
          </ActionButton>
        </ChartActions>
      </ChartHeader>

      <ChartContent height={height}>
        <ChartCanvas
          ref={canvasRef}
          width={800}
          height={height}
        />
      </ChartContent>

      {showLegend && data && data.length > 0 && (
        <ChartLegend>
          {data.map((item, index) => (
            <LegendItem key={index}>
              <LegendColor color={item.color || `hsl(${index * 60}, 70%, 50%)`} />
              {item.label}
            </LegendItem>
          ))}
        </ChartLegend>
      )}

      {showStats && stats && stats.length > 0 && (
        <ChartStats>
          {stats.map((stat, index) => (
            <StatItem key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
              {stat.trend && (
                <TrendIndicator positive={stat.trend > 0}>
                  {stat.trend > 0 ? (
                    <TrendingUpIcon width={12} height={12} />
                  ) : (
                    <TrendingDownIcon width={12} height={12} />
                  )}
                  {Math.abs(stat.trend)}%
                </TrendIndicator>
              )}
            </StatItem>
          ))}
        </ChartStats>
      )}
    </ChartContainer>
  );
};

export default Chart;
