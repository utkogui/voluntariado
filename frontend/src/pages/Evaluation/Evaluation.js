import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  StarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ListBulletIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { fetchEvaluations } from '../../store/slices/evaluationSlice';
import useEvaluation from '../../hooks/useEvaluation';
import EvaluationList from '../../components/Evaluation/EvaluationList';
import EvaluationForm from '../../components/Evaluation/EvaluationForm';
import EvaluationStats from '../../components/Evaluation/EvaluationStats';

const EvaluationContainer = styled.div`
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
  grid-template-columns: ${props => props.view === 'stats' ? '1fr' : '1fr'};
  gap: ${props => props.theme.spacing.xl};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: ${props => props.view === 'stats' ? '2fr 1fr' : '1fr'};
  }
`;

const StatsSection = styled.div`
  ${props => props.view === 'list' && 'display: none;'}
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const ListSection = styled.div`
  ${props => props.view === 'stats' && 'display: none;'}
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const FilterPanel = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FilterTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const FilterGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FilterLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
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

const Evaluation = () => {
  const dispatch = useDispatch();
  const { evaluations, isLoading, error } = useSelector(state => state.evaluation);
  const [view, setView] = useState('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    dateRange: 'all',
    type: 'all',
    status: 'all'
  });

  const {
    loadEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    reportEvaluation
  } = useEvaluation();

  useEffect(() => {
    loadEvaluations(filters);
  }, [loadEvaluations, filters]);

  const handleCreateEvaluation = () => {
    setEditingEvaluation(null);
    setShowEvaluationForm(true);
  };

  const handleEditEvaluation = (evaluation) => {
    setEditingEvaluation(evaluation);
    setShowEvaluationForm(true);
  };

  const handleDeleteEvaluation = async (evaluation) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteEvaluation(evaluation.id);
      } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
      }
    }
  };

  const handleReportEvaluation = async (evaluation) => {
    const reason = prompt('Motivo do relatório:');
    if (reason) {
      try {
        await reportEvaluation(evaluation.id, { reason });
        alert('Avaliação reportada com sucesso');
      } catch (error) {
        console.error('Erro ao reportar avaliação:', error);
      }
    }
  };

  const handleEvaluationSubmit = async (evaluationData) => {
    try {
      if (editingEvaluation) {
        await updateEvaluation(editingEvaluation.id, evaluationData);
      } else {
        await createEvaluation(evaluationData);
      }
      setShowEvaluationForm(false);
      setEditingEvaluation(null);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const handleCloseForm = () => {
    setShowEvaluationForm(false);
    setEditingEvaluation(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return evaluation.comment?.toLowerCase().includes(searchLower) ||
             evaluation.userName?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (isLoading) {
    return (
      <EvaluationContainer>
        <LoadingState>Carregando avaliações...</LoadingState>
      </EvaluationContainer>
    );
  }

  if (error) {
    return (
      <EvaluationContainer>
        <ErrorState>
          <ErrorTitle>Erro ao carregar avaliações</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </EvaluationContainer>
    );
  }

  return (
    <EvaluationContainer>
      <PageHeader>
        <PageTitle>
          <StarIcon width={32} height={32} />
          Sistema de Avaliações
        </PageTitle>
        <PageDescription>
          Gerencie avaliações e feedback de usuários
        </PageDescription>
      </PageHeader>

      {/* Controles */}
      <ControlsSection>
        <ViewControls>
          <ViewButton
            active={view === 'stats'}
            onClick={() => setView('stats')}
          >
            <ChartBarIcon width={16} height={16} />
            Estatísticas
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
            placeholder="Buscar avaliações..."
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

        <CreateButton onClick={handleCreateEvaluation}>
          <PlusIcon width={16} height={16} />
          Nova Avaliação
        </CreateButton>
      </ControlsSection>

      {/* Painel de Filtros */}
      <FilterPanel isOpen={showFilters}>
        <FilterTitle>Filtros</FilterTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <FilterGroup>
            <FilterLabel>Avaliação</FilterLabel>
            <Select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="5">5 estrelas</option>
              <option value="4">4+ estrelas</option>
              <option value="3">3+ estrelas</option>
              <option value="2">2+ estrelas</option>
              <option value="1">1 estrela</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Período</FilterLabel>
            <Select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este ano</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Tipo</FilterLabel>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="opportunity">Oportunidade</option>
              <option value="activity">Atividade</option>
              <option value="user">Usuário</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="reported">Reportado</option>
            </Select>
          </FilterGroup>
        </div>
      </FilterPanel>

      {/* Conteúdo */}
      <ContentArea view={view}>
        <StatsSection view={view}>
          <EvaluationStats 
            evaluations={filteredEvaluations}
            targetType="all"
          />
        </StatsSection>

        <ListSection view={view}>
          <EvaluationList
            evaluations={filteredEvaluations}
            onEvaluationSelect={handleEditEvaluation}
            onReportEvaluation={handleReportEvaluation}
            onEditEvaluation={handleEditEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            isLoading={isLoading}
            title="Todas as Avaliações"
          />
        </ListSection>
      </ContentArea>

      {/* Formulário de Avaliação */}
      <EvaluationForm
        isOpen={showEvaluationForm}
        onClose={handleCloseForm}
        onSubmit={handleEvaluationSubmit}
        evaluation={editingEvaluation}
        isLoading={isLoading}
      />
    </EvaluationContainer>
  );
};

export default Evaluation;
