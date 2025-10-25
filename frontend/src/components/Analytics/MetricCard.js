import React from 'react';
import styled from 'styled-components';
import { 
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const CardContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  line-height: 1;
`;

const MetricSubtitle = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const TrendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.positive ? props.theme.colors.success}10 : props.theme.colors.error}10;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const TrendIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TrendText = styled.span`
  white-space: nowrap;
`;

const TrendPeriod = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  margin-left: ${props => props.theme.spacing.xs};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => {
    switch (props.status) {
      case 'excellent': return props.theme.colors.success;
      case 'good': return props.theme.colors.info;
      case 'warning': return props.theme.colors.warning;
      case 'error': return props.theme.colors.error;
      default: return props.theme.colors.gray400;
    }
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${props => props.theme.colors.gray200};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.color || props.theme.colors.primary};
  width: ${props => props.percentage}%;
  transition: width ${props => props.theme.transitions.normal};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  color: ${props => props.theme.colors.gray500};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: ${props => props.theme.colors.error};
  text-align: center;
`;

const ErrorMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  margin: ${props => props.theme.spacing.xs} 0 0 0;
`;

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = '#3B82F6',
  trend = null,
  trendPeriod = 'vs período anterior',
  status = null,
  progress = null,
  isLoading = false,
  error = null,
  onClick = null,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <ArrowUpIcon width={12} height={12} />;
    } else if (trend < 0) {
      return <ArrowDownIcon width={12} height={12} />;
    } else {
      return <ArrowRightIcon width={12} height={12} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'gray';
    return trend > 0 ? 'success' : trend < 0 ? 'error' : 'gray';
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const formatTrend = (trend) => {
    if (trend === null || trend === undefined) return null;
    const absTrend = Math.abs(trend);
    return `${absTrend.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <CardContainer className={className}>
        <LoadingState>Carregando...</LoadingState>
      </CardContainer>
    );
  }

  if (error) {
    return (
      <CardContainer className={className}>
        <ErrorState>
          <div>Erro</div>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </CardContainer>
    );
  }

  return (
    <CardContainer 
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardIcon color={color}>
          {icon}
        </CardIcon>
      </CardHeader>

      <CardContent>
        <MetricValue>{formatValue(value)}</MetricValue>
        {subtitle && <MetricSubtitle>{subtitle}</MetricSubtitle>}
        
        {trend !== null && (
          <TrendContainer>
            <TrendIndicator positive={trend > 0}>
              <TrendIcon>
                {getTrendIcon()}
              </TrendIcon>
              <TrendText>{formatTrend(trend)}</TrendText>
              <TrendPeriod>{trendPeriod}</TrendPeriod>
            </TrendIndicator>
          </TrendContainer>
        )}

        {progress !== null && (
          <ProgressBar>
            <ProgressFill 
              percentage={progress.percentage} 
              color={progress.color || color}
            />
          </ProgressBar>
        )}
      </CardContent>

      <CardFooter>
        <FooterLeft>
          {status && (
            <>
              <StatusIndicator status={status} />
              <span>{status}</span>
            </>
          )}
        </FooterLeft>
        <FooterRight>
          {onClick && <span>Clique para detalhes</span>}
        </FooterRight>
      </CardFooter>
    </CardContainer>
  );
};

export default MetricCard;
