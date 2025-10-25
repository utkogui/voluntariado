import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { 
  UserIcon,
  PencilIcon,
  CameraIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  StarIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../../store/slices/profileSlice';

const ProfileContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  position: relative;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: bold;
  position: relative;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const AvatarEditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: 3px solid white;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
    transform: scale(1.05);
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const UserRole = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.full};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UserBio = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.gray600};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.lg};
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const ContactIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray500};
`;

const EditButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.lg};
  right: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.gray700};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing['2xl']};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Section = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.gray900};
  margin: 0;
`;

const SectionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray600};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.gray50};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.gray900};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const SkillTag = styled.span`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.gray50};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.iconColor}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor};
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.gray900};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const ActivityDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
`;

const ActivityTime = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.gray500};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.md} auto;
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

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { userProfile, isLoading, error } = useSelector(state => state.profile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchProfileStart());
    // Simular carregamento do perfil
    setTimeout(() => {
      dispatch(fetchProfileSuccess({
        ...user,
        bio: 'Apaixonado por fazer a diferença na comunidade através do voluntariado.',
        skills: ['Trabalho em equipe', 'Comunicação', 'Liderança', 'Organização'],
        location: 'São Paulo, SP',
        joinDate: '2023-01-15',
        stats: {
          activitiesCompleted: 12,
          hoursVolunteered: 48,
          rating: 4.8,
          applications: 8
        }
      }));
    }, 1000);
  }, [dispatch, user]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Implementar salvamento do perfil
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (userType) => {
    const labels = {
      VOLUNTEER: 'Voluntário',
      INSTITUTION: 'Instituição',
      COMPANY: 'Empresa',
      UNIVERSITY: 'Universidade',
      ADMIN: 'Administrador'
    };
    return labels[userType] || 'Usuário';
  };

  const recentActivity = [
    {
      id: 1,
      title: 'Candidatura enviada',
      description: 'Para "Ajuda com distribuição de alimentos"',
      time: '2h atrás',
      icon: HeartIcon,
      iconColor: '#3B82F6'
    },
    {
      id: 2,
      title: 'Atividade concluída',
      description: 'Limpeza da praia - ONG Verde Vida',
      time: '1 dia atrás',
      icon: CheckCircleIcon,
      iconColor: '#10B981'
    },
    {
      id: 3,
      title: 'Avaliação recebida',
      description: '5 estrelas da ONG Esperança',
      time: '3 dias atrás',
      icon: StarIcon,
      iconColor: '#F59E0B'
    }
  ];

  if (isLoading) {
    return (
      <ProfileContainer>
        <LoadingState>
          <LoadingSpinner />
        </LoadingState>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <div>Erro ao carregar perfil: {error}</div>
      </ProfileContainer>
    );
  }

  const profile = userProfile || user;

  return (
    <ProfileContainer>
      <ProfileHeader>
        <EditButton onClick={handleEditProfile}>
          <PencilIcon width={16} height={16} />
          Editar Perfil
        </EditButton>
        
        <ProfileInfo>
          <AvatarContainer>
            <Avatar>
              {profile.profilePicture ? (
                <AvatarImage src={profile.profilePicture} alt={profile.name} />
              ) : (
                getUserInitials(profile.name)
              )}
            </Avatar>
            <AvatarEditButton>
              <CameraIcon width={16} height={16} />
            </AvatarEditButton>
          </AvatarContainer>
          
          <UserDetails>
            <UserName>{profile.name || 'Usuário'}</UserName>
            <UserRole>{getRoleLabel(profile.userType)}</UserRole>
            <UserBio>{profile.bio || 'Nenhuma biografia disponível.'}</UserBio>
            
            <ContactInfo>
              <ContactItem>
                <ContactIcon>
                  <EnvelopeIcon width={16} height={16} />
                </ContactIcon>
                <span>{profile.email || 'email@exemplo.com'}</span>
              </ContactItem>
              
              <ContactItem>
                <ContactIcon>
                  <MapPinIcon width={16} height={16} />
                </ContactIcon>
                <span>{profile.location || 'Localização não informada'}</span>
              </ContactItem>
              
              <ContactItem>
                <ContactIcon>
                  <CalendarIcon width={16} height={16} />
                </ContactIcon>
                <span>Membro desde {new Date(profile.joinDate || '2023-01-01').toLocaleDateString('pt-BR')}</span>
              </ContactItem>
            </ContactInfo>
          </UserDetails>
        </ProfileInfo>
      </ProfileHeader>

      <ProfileContent>
        <MainContent>
          <Section>
            <SectionHeader>
              <SectionTitle>Habilidades</SectionTitle>
              <SectionButton>
                <PencilIcon width={16} height={16} />
                Editar
              </SectionButton>
            </SectionHeader>
            
            {profile.skills && profile.skills.length > 0 ? (
              <SkillsList>
                {profile.skills.map((skill, index) => (
                  <SkillTag key={index}>{skill}</SkillTag>
                ))}
              </SkillsList>
            ) : (
              <EmptyState>
                <EmptyIcon>
                  <StarIcon width={32} height={32} />
                </EmptyIcon>
                <EmptyTitle>Nenhuma habilidade adicionada</EmptyTitle>
                <EmptyMessage>
                  Adicione suas habilidades para destacar seu perfil
                </EmptyMessage>
              </EmptyState>
            )}
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Atividade Recente</SectionTitle>
            </SectionHeader>
            
            <ActivityList>
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id}>
                  <ActivityIcon iconColor={activity.iconColor}>
                    <activity.icon width={20} height={20} />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityTitle>{activity.title}</ActivityTitle>
                    <ActivityDescription>{activity.description}</ActivityDescription>
                  </ActivityContent>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityItem>
              ))}
            </ActivityList>
          </Section>
        </MainContent>

        <Sidebar>
          <Section>
            <SectionHeader>
              <SectionTitle>Estatísticas</SectionTitle>
            </SectionHeader>
            
            <StatsGrid>
              <StatCard>
                <StatValue>{profile.stats?.activitiesCompleted || 0}</StatValue>
                <StatLabel>Atividades Concluídas</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatValue>{profile.stats?.hoursVolunteered || 0}h</StatValue>
                <StatLabel>Horas Voluntariadas</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatValue>{profile.stats?.rating || 0}</StatValue>
                <StatLabel>Avaliação Média</StatLabel>
              </StatCard>
              
              <StatCard>
                <StatValue>{profile.stats?.applications || 0}</StatValue>
                <StatLabel>Candidaturas</StatLabel>
              </StatCard>
            </StatsGrid>
          </Section>
        </Sidebar>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;
