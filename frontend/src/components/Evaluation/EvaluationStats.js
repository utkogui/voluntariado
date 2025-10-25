import React from 'react';
import styled from 'styled-components';
import { 
  StarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  ThumbUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatSubtitle = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const RatingBreakdown = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
  min-width: 80px;
`;

const Star = styled.div`
  color: ${props => props.filled ? props.theme.colors.accent : props.theme.colors.gray300};
  width: 12px;
  height: 12px;
`;

const RatingBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${props => props.theme.colors.gray200};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const RatingFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.accent};
  width: ${props => props.percentage}%;
  transition: width ${props => props.theme.transitions.normal};
`;

const RatingCount = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  min-width: 30px;
  text-align: right;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme.colors.gray200};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  width: ${props => props.percentage}%;
  transition: width ${props => props.theme.transitions.normal};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.sm};
`;

const ChartContainer = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const ChartTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const SimpleBarChart = styled.div`
  display: flex;
  align-items: end;
  gap: ${props => props.theme.spacing.xs};
  height: 100px;
`;

const Bar = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm} ${props => props.theme.borderRadius.sm} 0 0;
  min-height: 4px;
  height: ${props => props.percentage}%;
  transition: height ${props => props.theme.transitions.normal};
`;

const BarLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  text-align: center;
  margin-top: ${props => props.theme.spacing.xs};
`;

const EvaluationStats = ({ 
  evaluations = [], 
  targetType = 'opportunity',
  targetId = null,
  period = 'all' 
}) => {
  const getAverageRating = () => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, eval) => acc + eval.rating, 0);
    return (sum / evaluations.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    evaluations.forEach(eval => {
      distribution[eval.rating]++;
    });
    return distribution;
  };

  const getRecommendationRate = () => {
    if (evaluations.length === 0) return 0;
    const recommended = evaluations.filter(eval => eval.wouldRecommend).length;
    return ((recommended / evaluations.length) * 100).toFixed(1);
  };

  const getResponseRate = () => {
    // This would typically come from backend data
    // For now, we'll calculate based on evaluations with comments
    if (evaluations.length === 0) return 0;
    const withComments = evaluations.filter(eval => eval.comment && eval.comment.trim().length > 0).length;
    return ((withComments / evaluations.length) * 100).toFixed(1);
  };

  const getRecentTrend = () => {
    // Calculate trend over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvaluations = evaluations.filter(eval => 
      new Date(eval.createdAt) >= thirtyDaysAgo
    );
    
    if (recentEvaluations.length === 0) return 0;
    
    const recentSum = recentEvaluations.reduce((acc, eval) => acc + eval.rating, 0);
    const recentAverage = recentSum / recentEvaluations.length;
    
    const olderEvaluations = evaluations.filter(eval => 
      new Date(eval.createdAt) < thirtyDaysAgo
    );
    
    if (olderEvaluations.length === 0) return 0;
    
    const olderSum = olderEvaluations.reduce((acc, eval) => acc + eval.rating, 0);
    const olderAverage = olderSum / olderEvaluations.length;
    
    return ((recentAverage - olderAverage) / olderAverage * 100).toFixed(1);
  };

  const getCategoryStats = () => {
    const categoryCount = {};
    evaluations.forEach(eval => {
      if (eval.categories) {
        eval.categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const renderStars = (rating) => {
    return (
      <RatingStars>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={star <= rating}>
            <StarSolidIcon width={12} height={12} />
          </Star>
        ))}
      </RatingStars>
    );
  };

  const ratingDistribution = getRatingDistribution();
  const totalEvaluations = evaluations.length;
  const maxCount = Math.max(...Object.values(ratingDistribution));

  const stats = {
    averageRating: getAverageRating(),
    totalEvaluations,
    recommendationRate: getRecommendationRate(),
    responseRate: getResponseRate(),
    recentTrend: getRecentTrend(),
    categoryStats: getCategoryStats()
  };

  return (
    <StatsContainer>
      {/* Rating Overview */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.accent}>
            <StarIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Avaliação Média</StatTitle>
        </StatHeader>
        <StatValue>{stats.averageRating}/5</StatValue>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderStars(Math.round(stats.averageRating))}
        </div>
        <StatSubtitle>
          Baseado em {stats.totalEvaluations} avaliações
        </StatSubtitle>
        {stats.recentTrend !== 0 && (
          <TrendIndicator positive={stats.recentTrend > 0}>
            <TrendingUpIcon width={12} height={12} />
            {stats.recentTrend > 0 ? '+' : ''}{stats.recentTrend}% vs período anterior
          </TrendIndicator>
        )}
      </StatCard>

      {/* Total Evaluations */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.primary}>
            <ChatBubbleLeftIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Total de Avaliações</StatTitle>
        </StatHeader>
        <StatValue>{stats.totalEvaluations}</StatValue>
        <StatSubtitle>
          {targetType === 'opportunity' ? 'Avaliações da oportunidade' : 'Avaliações da atividade'}
        </StatSubtitle>
      </StatCard>

      {/* Recommendation Rate */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.success}>
            <ThumbUpIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Taxa de Recomendação</StatTitle>
        </StatHeader>
        <StatValue>{stats.recommendationRate}%</StatValue>
        <ProgressBar>
          <ProgressFill percentage={stats.recommendationRate} />
        </ProgressBar>
        <StatSubtitle>
          Usuários que recomendariam
        </StatSubtitle>
      </StatCard>

      {/* Response Rate */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.info}>
            <ChartBarIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Taxa de Resposta</StatTitle>
        </StatHeader>
        <StatValue>{stats.responseRate}%</StatValue>
        <ProgressBar>
          <ProgressFill percentage={stats.responseRate} />
        </ProgressBar>
        <StatSubtitle>
          Avaliações com comentários
        </StatSubtitle>
      </StatCard>

      {/* Rating Distribution */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.warning}>
            <ChartBarIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Distribuição de Avaliações</StatTitle>
        </StatHeader>
        <RatingBreakdown>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating];
            const percentage = totalEvaluations > 0 ? (count / totalEvaluations) * 100 : 0;
            
            return (
              <RatingRow key={rating}>
                {renderStars(rating)}
                <RatingBar>
                  <RatingFill percentage={percentage} />
                </RatingBar>
                <RatingCount>{count}</RatingCount>
              </RatingRow>
            );
          })}
        </RatingBreakdown>
      </StatCard>

      {/* Top Categories */}
      <StatCard>
        <StatHeader>
          <StatIcon color={props => props.theme.colors.secondary}>
            <UserGroupIcon width={20} height={20} />
          </StatIcon>
          <StatTitle>Categorias Mais Mencionadas</StatTitle>
        </StatHeader>
        <ChartContainer>
          {stats.categoryStats.length > 0 ? (
            <>
              <ChartTitle>Top 5 Categorias</ChartTitle>
              <SimpleBarChart>
                {stats.categoryStats.map(([category, count], index) => {
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <Bar percentage={percentage} />
                      <BarLabel>{category}</BarLabel>
                    </div>
                  );
                })}
              </SimpleBarChart>
            </>
          ) : (
            <StatSubtitle>Nenhuma categoria mencionada</StatSubtitle>
          )}
        </ChartContainer>
      </StatCard>
    </StatsContainer>
  );
};

export default EvaluationStats;
