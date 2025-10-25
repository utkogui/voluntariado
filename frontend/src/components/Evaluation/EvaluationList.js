import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  StarIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ListContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  width: 200px;
  
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

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: ${props => props.theme.zIndex.dropdown};
  min-width: 200px;
  padding: ${props => props.theme.spacing.sm};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const StatValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const ListContent = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const EvaluationItem = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const EvaluationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const EvaluationDate = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.div`
  color: ${props => props.filled ? props.theme.colors.accent : props.theme.colors.gray300};
  width: 16px;
  height: 16px;
`;

const RatingText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-left: ${props => props.theme.spacing.sm};
`;

const Actions = styled.div`
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

const EvaluationContent = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Comment = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CategoryTag = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.primary}10;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const EvaluationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
`;

const FooterLeft = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  align-items: center;
`;

const FooterRight = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const RecommendBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.success}10;
  color: ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const AnonymousBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.gray100};
  color: ${props => props.theme.colors.gray600};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const EmptyState = styled.div`
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
  padding: ${props => props.theme.spacing['4xl']};
  text-align: center;
  color: ${props => props.theme.colors.gray500};
`;

const EvaluationList = ({ 
  evaluations = [], 
  onEvaluationSelect,
  onReportEvaluation,
  onEditEvaluation,
  onDeleteEvaluation,
  isLoading = false,
  showFilters = true,
  showSearch = true,
  title = "Avaliações"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    rating: 'all',
    dateRange: 'all',
    categories: []
  });

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return evaluation.comment?.toLowerCase().includes(searchLower) ||
             evaluation.userName?.toLowerCase().includes(searchLower);
    }
    return true;
  });

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

  const renderStars = (rating) => {
    return (
      <StarRating>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={star <= rating}>
            <StarSolidIcon width={16} height={16} />
          </Star>
        ))}
      </StarRating>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <ListContainer>
        <LoadingState>Carregando avaliações...</LoadingState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <HeaderTop>
          <Title>
            <ChatBubbleLeftIcon width={20} height={20} />
            {title}
          </Title>
          <Controls>
            {showSearch && (
              <SearchInput
                type="text"
                placeholder="Buscar avaliações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            {showFilters && (
              <div style={{ position: 'relative' }}>
                <FilterButton
                  active={showFilterDropdown}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <FunnelIcon width={16} height={16} />
                </FilterButton>
                <FilterDropdown isOpen={showFilterDropdown}>
                  <FilterOption>
                    <Checkbox type="checkbox" />
                    Todas as avaliações
                  </FilterOption>
                  <FilterOption>
                    <Checkbox type="checkbox" />
                    5 estrelas
                  </FilterOption>
                  <FilterOption>
                    <Checkbox type="checkbox" />
                    4+ estrelas
                  </FilterOption>
                  <FilterOption>
                    <Checkbox type="checkbox" />
                    Com comentários
                  </FilterOption>
                </FilterDropdown>
              </div>
            )}
          </Controls>
        </HeaderTop>
        
        <StatsRow>
          <StatItem>
            <StarIcon width={16} height={16} />
            <span>Média: <StatValue>{getAverageRating()}</StatValue></span>
          </StatItem>
          <StatItem>
            <ChatBubbleLeftIcon width={16} height={16} />
            <span>Total: <StatValue>{evaluations.length}</StatValue></span>
          </StatItem>
          <StatItem>
            <CalendarIcon width={16} height={16} />
            <span>Última: <StatValue>
              {evaluations.length > 0 ? formatDate(evaluations[0].createdAt) : 'N/A'}
            </StatValue></span>
          </StatItem>
        </StatsRow>
      </ListHeader>

      <ListContent>
        {filteredEvaluations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <ChatBubbleLeftIcon width={48} height={48} />
            </EmptyIcon>
            <EmptyTitle>Nenhuma avaliação encontrada</EmptyTitle>
            <EmptyMessage>
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Ainda não há avaliações para exibir'}
            </EmptyMessage>
          </EmptyState>
        ) : (
          filteredEvaluations.map((evaluation) => (
            <EvaluationItem key={evaluation.id}>
              <EvaluationHeader>
                <UserInfo>
                  <UserAvatar>
                    {evaluation.isAnonymous ? 'A' : getInitials(evaluation.userName || 'Usuário')}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>
                      {evaluation.isAnonymous ? 'Avaliação Anônima' : evaluation.userName || 'Usuário'}
                    </UserName>
                    <EvaluationDate>
                      {formatDate(evaluation.createdAt)}
                    </EvaluationDate>
                  </UserDetails>
                </UserInfo>
                
                <RatingContainer>
                  {renderStars(evaluation.rating)}
                  <RatingText>{evaluation.rating}/5</RatingText>
                </RatingContainer>

                <Actions>
                  {evaluation.wouldRecommend && (
                    <RecommendBadge>Recomenda</RecommendBadge>
                  )}
                  {evaluation.isAnonymous && (
                    <AnonymousBadge>Anônima</AnonymousBadge>
                  )}
                  <ActionButton onClick={() => onReportEvaluation?.(evaluation)}>
                    <FlagIcon width={16} height={16} />
                  </ActionButton>
                  <ActionButton>
                    <EllipsisVerticalIcon width={16} height={16} />
                  </ActionButton>
                </Actions>
              </EvaluationHeader>

              <EvaluationContent>
                <Comment>{evaluation.comment}</Comment>
                
                {evaluation.categories && evaluation.categories.length > 0 && (
                  <Categories>
                    {evaluation.categories.map((category, index) => (
                      <CategoryTag key={index}>{category}</CategoryTag>
                    ))}
                  </Categories>
                )}
              </EvaluationContent>

              <EvaluationFooter>
                <FooterLeft>
                  <span>ID: {evaluation.id}</span>
                  {evaluation.targetType && (
                    <span>Tipo: {evaluation.targetType}</span>
                  )}
                </FooterLeft>
                <FooterRight>
                  <span>Útil: {evaluation.helpfulCount || 0}</span>
                </FooterRight>
              </EvaluationFooter>
            </EvaluationItem>
          ))
        )}
      </ListContent>
    </ListContainer>
  );
};

export default EvaluationList;
