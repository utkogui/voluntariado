import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { fetchOpportunitiesStart, fetchOpportunitiesSuccess, fetchOpportunitiesFailure } from '../../store/slices/opportunitiesSlice';
import OpportunityCard from '../../components/OpportunityCard';
import FilterPanel from '../../components/FilterPanel';
import SearchBar from '../../components/SearchBar';

const OpportunitiesContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const SearchAndFilters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: column;
  }
`;

const SearchSection = styled.div`
  flex: 1;
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? 'white' : props.theme.colors.gray700};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray50};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const ResultsCount = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const SortSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.gray700};
  cursor: pointer;
  transition: border-color ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const FilterPanelContainer = styled.div`
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: ${props => props.theme.zIndex.modal};
    padding: ${props => props.theme.spacing.lg};
  }
`;

const FilterPanelContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  height: fit-content;
  position: sticky;
  top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    position: relative;
    top: 0;
    max-height: 80vh;
    overflow-y: auto;
  }
`;

const FilterPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const FilterPanelTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.gray700};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const OpportunitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.gray500};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.gray200};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray400};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray500};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const ClearFiltersButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.error};
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg} auto;
  background-color: ${props => props.theme.colors.error}20;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.error};
`;

const ErrorTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.error};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ErrorMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const Opportunities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: opportunities, isLoading, error } = useSelector(state => state.opportunities);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateRange: '',
    duration: '',
    type: '',
    status: 'ACTIVE'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);

  useEffect(() => {
    dispatch(fetchOpportunitiesStart());
  }, [dispatch]);

  useEffect(() => {
    // Simular dados de oportunidades
    const mockOpportunities = [
      {
        id: 1,
        title: 'Ajuda com distribuição de alimentos',
        description: 'Auxiliar na distribuição de alimentos para famílias carentes na comunidade local.',
        institution: { name: 'ONG Esperança', id: 1 },
        category: 'ASSISTENCIA_SOCIAL',
        location: 'São Paulo, SP',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        durationInHours: 4,
        maxParticipants: 10,
        currentParticipants: 7,
        status: 'ACTIVE',
        requirements: ['Idade mínima: 16 anos', 'Disponibilidade aos fins de semana'],
        skills: ['Trabalho em equipe', 'Comunicação']
      },
      {
        id: 2,
        title: 'Limpeza da praia',
        description: 'Participar da limpeza da praia e conscientização sobre preservação ambiental.',
        institution: { name: 'Instituto Verde', id: 2 },
        category: 'MEIO_AMBIENTE',
        location: 'Santos, SP',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        durationInHours: 6,
        maxParticipants: 25,
        currentParticipants: 18,
        status: 'ACTIVE',
        requirements: ['Idade mínima: 14 anos', 'Roupa confortável'],
        skills: ['Consciência ambiental', 'Trabalho em equipe']
      },
      {
        id: 3,
        title: 'Aulas de reforço escolar',
        description: 'Dar aulas de reforço para crianças em situação de vulnerabilidade social.',
        institution: { name: 'Casa do Bem', id: 3 },
        category: 'EDUCACAO',
        location: 'Rio de Janeiro, RJ',
        startDate: '2024-01-25',
        endDate: '2024-03-25',
        durationInHours: 2,
        maxParticipants: 5,
        currentParticipants: 3,
        status: 'ACTIVE',
        requirements: ['Ensino médio completo', 'Paciência com crianças'],
        skills: ['Didática', 'Paciência', 'Conhecimento em matemática']
      }
    ];

    dispatch(fetchOpportunitiesSuccess(mockOpportunities));
  }, [dispatch]);

  useEffect(() => {
    let filtered = opportunities.filter(opportunity => {
      // Filtro por status
      if (opportunity.status !== filters.status) return false;
      
      // Filtro por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opportunity.title.toLowerCase().includes(query);
        const matchesDescription = opportunity.description.toLowerCase().includes(query);
        const matchesInstitution = opportunity.institution?.name.toLowerCase().includes(query);
        const matchesLocation = opportunity.location.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesInstitution && !matchesLocation) {
          return false;
        }
      }
      
      // Filtro por categoria
      if (filters.category && opportunity.category !== filters.category) return false;
      
      // Filtro por localização
      if (filters.location && !opportunity.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      
      // Filtro por duração
      if (filters.duration) {
        const duration = parseInt(filters.duration);
        if (opportunity.durationInHours > duration) return false;
      }
      
      // Filtro por tipo
      if (filters.type && opportunity.type !== filters.type) return false;
      
      return true;
    });

    // Ordenação
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'participants':
        filtered.sort((a, b) => b.currentParticipants - a.currentParticipants);
        break;
      default:
        break;
    }

    setFilteredOpportunities(filtered);
  }, [opportunities, searchQuery, filters, sortBy]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      location: '',
      dateRange: '',
      duration: '',
      type: '',
      status: 'ACTIVE'
    });
    setSearchQuery('');
  };

  const handleOpportunityClick = (opportunityId) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  if (error) {
    return (
      <OpportunitiesContainer>
        <ErrorState>
          <ErrorIcon>
            <XMarkIcon width={40} height={40} />
          </ErrorIcon>
          <ErrorTitle>Erro ao carregar oportunidades</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </OpportunitiesContainer>
    );
  }

  return (
    <OpportunitiesContainer>
      <Header>
        <Title>Oportunidades de Voluntariado</Title>
        <Subtitle>
          Encontre a oportunidade perfeita para fazer a diferença na sua comunidade
        </Subtitle>
      </Header>

      <SearchAndFilters>
        <SearchSection>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar por título, descrição, instituição ou localização..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterToggle
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon width={20} height={20} />
            Filtros
          </FilterToggle>
        </SearchSection>
      </SearchAndFilters>

      <ContentLayout>
        <FilterPanelContainer isOpen={showFilters}>
          <FilterPanelContent>
            <FilterPanelHeader>
              <FilterPanelTitle>Filtros</FilterPanelTitle>
              <CloseButton onClick={() => setShowFilters(false)}>
                <XMarkIcon width={20} height={20} />
              </CloseButton>
            </FilterPanelHeader>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </FilterPanelContent>
        </FilterPanelContainer>

        <div>
          <ResultsHeader>
            <ResultsCount>
              {filteredOpportunities.length} oportunidade{filteredOpportunities.length !== 1 ? 's' : ''} encontrada{filteredOpportunities.length !== 1 ? 's' : ''}
            </ResultsCount>
            <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="title">Título A-Z</option>
              <option value="date">Data</option>
              <option value="participants">Mais participantes</option>
            </SortSelect>
          </ResultsHeader>

          {isLoading ? (
            <LoadingState>
              <LoadingSpinner />
            </LoadingState>
          ) : filteredOpportunities.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <HeartIcon width={40} height={40} />
              </EmptyIcon>
              <EmptyTitle>Nenhuma oportunidade encontrada</EmptyTitle>
              <EmptyMessage>
                Tente ajustar seus filtros ou termos de busca para encontrar mais oportunidades.
              </EmptyMessage>
              <ClearFiltersButton onClick={handleClearFilters}>
                Limpar filtros
              </ClearFiltersButton>
            </EmptyState>
          ) : (
            <OpportunitiesGrid>
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onClick={() => handleOpportunityClick(opportunity.id)}
                />
              ))}
            </OpportunitiesGrid>
          )}
        </div>
      </ContentLayout>
    </OpportunitiesContainer>
  );
};

export default Opportunities;
