import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing.lg};
`;

const FormContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const FormTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
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

const FormContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const FormSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray500};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
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

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.gray50};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  ${props => props.variant === 'primary' ? `
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${props.theme.colors.primaryDark};
    }
    
    &:disabled {
      background-color: ${props.theme.colors.gray300};
      cursor: not-allowed;
    }
  ` : `
    background-color: ${props.theme.colors.surface};
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background-color: ${props.theme.colors.gray50};
    }
  `}
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ActivityForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  activity = null, 
  initialDate = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    type: 'meeting',
    maxParticipants: '',
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
    isOnline: false,
    meetingLink: '',
    requirements: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
        startTime: activity.startTime || '',
        endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
        endTime: activity.endTime || '',
        location: activity.location || '',
        type: activity.type || 'meeting',
        maxParticipants: activity.maxParticipants || '',
        isRecurring: activity.isRecurring || false,
        recurrenceType: activity.recurrenceType || 'none',
        recurrenceInterval: activity.recurrenceInterval || 1,
        recurrenceDays: activity.recurrenceDays || [],
        isOnline: activity.isOnline || false,
        meetingLink: activity.meetingLink || '',
        requirements: activity.requirements || '',
        notes: activity.notes || ''
      });
    } else if (initialDate) {
      const date = new Date(initialDate);
      setFormData(prev => ({
        ...prev,
        startDate: date.toISOString().split('T')[0],
        endDate: date.toISOString().split('T')[0]
      }));
    }
  }, [activity, initialDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleRecurrenceDayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: checked 
        ? [...prev.recurrenceDays, day]
        : prev.recurrenceDays.filter(d => d !== day)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Horário de início é obrigatório';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Horário de fim é obrigatório';
    }

    if (formData.isOnline && !formData.meetingLink.trim()) {
      newErrors.meetingLink = 'Link da reunião é obrigatório para atividades online';
    }

    if (!formData.isOnline && !formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória para atividades presenciais';
    }

    // Validar se data de fim é posterior à data de início
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'Data/hora de fim deve ser posterior à data/hora de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      startDateTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
      endDateTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      type: 'meeting',
      maxParticipants: '',
      isRecurring: false,
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceDays: [],
      isOnline: false,
      meetingLink: '',
      requirements: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const weekDays = [
    { value: 'monday', label: 'Segunda' },
    { value: 'tuesday', label: 'Terça' },
    { value: 'wednesday', label: 'Quarta' },
    { value: 'thursday', label: 'Quinta' },
    { value: 'friday', label: 'Sexta' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  return (
    <FormOverlay onClick={handleClose}>
      <FormContainer onClick={(e) => e.stopPropagation()}>
        <FormHeader>
          <FormTitle>
            {activity ? 'Editar Atividade' : 'Nova Atividade'}
          </FormTitle>
          <CloseButton onClick={handleClose}>
            <XMarkIcon width={20} height={20} />
          </CloseButton>
        </FormHeader>

        <form onSubmit={handleSubmit}>
          <FormContent>
            {/* Informações Básicas */}
            <FormSection>
              <SectionTitle>
                <DocumentTextIcon width={20} height={20} />
                Informações Básicas
              </SectionTitle>
              
              <FormGroup>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título da atividade"
                />
                {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Descrição</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva a atividade..."
                />
              </FormGroup>

              <FormGrid>
                <FormGroup>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="meeting">Reunião</option>
                    <option value="event">Evento</option>
                    <option value="workshop">Workshop</option>
                    <option value="training">Treinamento</option>
                    <option value="volunteer">Voluntariado</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="maxParticipants">Máx. Participantes</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    placeholder="Número máximo de participantes"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Data e Horário */}
            <FormSection>
              <SectionTitle>
                <CalendarIcon width={20} height={20} />
                Data e Horário
              </SectionTitle>
              
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                  {errors.startDate && <ErrorMessage>{errors.startDate}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="startTime">Horário de Início *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                  {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="endDate">Data de Fim *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                  {errors.endDate && <ErrorMessage>{errors.endDate}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="endTime">Horário de Fim *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                  {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Localização */}
            <FormSection>
              <SectionTitle>
                <MapPinIcon width={20} height={20} />
                Localização
              </SectionTitle>
              
              <FormGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={(e) => handleCheckboxChange('isOnline', e.target.checked)}
                  />
                  Atividade online
                </CheckboxItem>
              </FormGroup>

              {formData.isOnline ? (
                <FormGroup>
                  <Label htmlFor="meetingLink">Link da Reunião *</Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                  {errors.meetingLink && <ErrorMessage>{errors.meetingLink}</ErrorMessage>}
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Digite o endereço ou local"
                  />
                  {errors.location && <ErrorMessage>{errors.location}</ErrorMessage>}
                </FormGroup>
              )}
            </FormSection>

            {/* Recorrência */}
            <FormSection>
              <SectionTitle>
                <ClockIcon width={20} height={20} />
                Recorrência
              </SectionTitle>
              
              <FormGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => handleCheckboxChange('isRecurring', e.target.checked)}
                  />
                  Atividade recorrente
                </CheckboxItem>
              </FormGroup>

              {formData.isRecurring && (
                <>
                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="recurrenceType">Tipo de Recorrência</Label>
                      <Select
                        id="recurrenceType"
                        value={formData.recurrenceType}
                        onChange={(e) => handleInputChange('recurrenceType', e.target.value)}
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="yearly">Anual</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="recurrenceInterval">Intervalo</Label>
                      <Input
                        id="recurrenceInterval"
                        type="number"
                        min="1"
                        value={formData.recurrenceInterval}
                        onChange={(e) => handleInputChange('recurrenceInterval', e.target.value)}
                      />
                    </FormGroup>
                  </FormGrid>

                  {formData.recurrenceType === 'weekly' && (
                    <FormGroup>
                      <Label>Dias da Semana</Label>
                      <CheckboxGroup>
                        {weekDays.map(day => (
                          <CheckboxItem key={day.value}>
                            <Checkbox
                              type="checkbox"
                              checked={formData.recurrenceDays.includes(day.value)}
                              onChange={(e) => handleRecurrenceDayChange(day.value, e.target.checked)}
                            />
                            {day.label}
                          </CheckboxItem>
                        ))}
                      </CheckboxGroup>
                    </FormGroup>
                  )}
                </>
              )}
            </FormSection>

            {/* Informações Adicionais */}
            <FormSection>
              <SectionTitle>
                <TagIcon width={20} height={20} />
                Informações Adicionais
              </SectionTitle>
              
              <FormGroup>
                <Label htmlFor="requirements">Requisitos</Label>
                <TextArea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Liste os requisitos para participar da atividade..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="notes">Observações</Label>
                <TextArea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações adicionais..."
                />
              </FormGroup>
            </FormSection>
          </FormContent>

          <FormActions>
            <Button type="button" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : activity ? 'Atualizar' : 'Criar Atividade'}
            </Button>
          </FormActions>
        </form>
      </FormContainer>
    </FormOverlay>
  );
};

export default ActivityForm;
