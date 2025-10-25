import React from 'react';
import styled from 'styled-components';
import { 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Institution = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const InstitutionAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  flex-shrink: 0;
`;

const InstitutionName = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: ${props => props.theme.typography.lineHeights.tight};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Category = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.full};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const MetaIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.theme.colors.gray500};
`;

const Skills = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SkillsLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray700};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
`;

const SkillTag = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.gray100};
  color: ${props => props.theme.colors.gray700};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Participants = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const ParticipantsCount = styled.span`
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
`;

const ApplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
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

const StatusBadge = styled.span`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  background-color: ${props => props.status === 'ACTIVE' ? props.theme.colors.success + '20' : props.theme.colors.warning + '20'};
  color: ${props => props.status === 'ACTIVE' ? props.theme.colors.success : props.theme.colors.warning};
`;

const getCategoryLabel = (category) => {
  const categories = {
    ASSISTENCIA_SOCIAL: 'Assistência Social',
    EDUCACAO: 'Educação',
    MEIO_AMBIENTE: 'Meio Ambiente',
    SAUDE: 'Saúde',
    CULTURA: 'Cultura',
    ESPORTE: 'Esporte',
    TECNOLOGIA: 'Tecnologia',
    OUTROS: 'Outros'
  };
  return categories[category] || 'Outros';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const OpportunityCard = ({ opportunity, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onClick(opportunity.id);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    // Implementar lógica de candidatura
    console.log('Aplicar para oportunidade:', opportunity.id);
  };

  return (
    <Card onClick={handleClick}>
      <StatusBadge status={opportunity.status}>
        {opportunity.status === 'ACTIVE' ? 'Ativa' : 'Pendente'}
      </StatusBadge>
      
      <CardHeader>
        <Institution>
          <InstitutionAvatar>
            {opportunity.institution?.name?.charAt(0) || 'O'}
          </InstitutionAvatar>
          <InstitutionName>{opportunity.institution?.name || 'Instituição'}</InstitutionName>
        </Institution>
        
        <Title>{opportunity.title}</Title>
        <Description>{opportunity.description}</Description>
        
        <Category>{getCategoryLabel(opportunity.category)}</Category>
      </CardHeader>

      <CardBody>
        <MetaInfo>
          <MetaItem>
            <MetaIcon>
              <MapPinIcon width={16} height={16} />
            </MetaIcon>
            <span>{opportunity.location}</span>
          </MetaItem>
          
          <MetaItem>
            <MetaIcon>
              <CalendarIcon width={16} height={16} />
            </MetaIcon>
            <span>{formatDate(opportunity.startDate)}</span>
          </MetaItem>
          
          <MetaItem>
            <MetaIcon>
              <ClockIcon width={16} height={16} />
            </MetaIcon>
            <span>{opportunity.durationInHours}h</span>
          </MetaItem>
        </MetaInfo>

        {opportunity.skills && opportunity.skills.length > 0 && (
          <Skills>
            <SkillsLabel>Habilidades necessárias:</SkillsLabel>
            <SkillsList>
              {opportunity.skills.slice(0, 3).map((skill, index) => (
                <SkillTag key={index}>{skill}</SkillTag>
              ))}
              {opportunity.skills.length > 3 && (
                <SkillTag>+{opportunity.skills.length - 3}</SkillTag>
              )}
            </SkillsList>
          </Skills>
        )}
      </CardBody>

      <CardFooter>
        <Participants>
          <UserGroupIcon width={16} height={16} />
          <ParticipantsCount>
            {opportunity.currentParticipants || 0}/{opportunity.maxParticipants}
          </ParticipantsCount>
          <span>participantes</span>
        </Participants>
        
        <ApplyButton onClick={handleApplyClick}>
          <HeartIcon width={16} height={16} />
          Candidatar-se
        </ApplyButton>
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;
