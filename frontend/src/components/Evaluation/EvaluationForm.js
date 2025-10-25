import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  XMarkIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows['2xl']};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
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

const Required = styled.span`
  color: ${props => props.theme.colors.error};
  margin-left: ${props => props.theme.spacing.xs};
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.active ? props.theme.colors.accent : props.theme.colors.gray300};
  transition: color ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.accent};
  }
`;

const RatingLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.gray600};
  margin-left: ${props => props.theme.spacing.sm};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.surface};
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
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

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.sm};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  ${props => props.variant === 'primary' && `
    background-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.primaryDark};
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: ${props.theme.colors.surface};
    color: ${props.theme.colors.gray700};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover:not(:disabled) {
      background-color: ${props.theme.colors.gray100};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EvaluationForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  evaluation = null, 
  targetType = 'opportunity',
  targetId = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    categories: [],
    isAnonymous: false,
    wouldRecommend: false,
    strengths: '',
    improvements: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (evaluation) {
      setFormData({
        rating: evaluation.rating || 0,
        comment: evaluation.comment || '',
        categories: evaluation.categories || [],
        isAnonymous: evaluation.isAnonymous || false,
        wouldRecommend: evaluation.wouldRecommend || false,
        strengths: evaluation.strengths || '',
        improvements: evaluation.improvements || ''
      });
    } else {
      setFormData({
        rating: 0,
        comment: '',
        categories: [],
        isAnonymous: false,
        wouldRecommend: false,
        strengths: '',
        improvements: ''
      });
    }
    setErrors({});
  }, [evaluation, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleCategoryChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Por favor, selecione uma avaliação';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Por favor, escreva um comentário';
    }

    if (formData.comment.length < 10) {
      newErrors.comment = 'O comentário deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const evaluationData = {
      ...formData,
      targetType,
      targetId,
      rating: parseInt(formData.rating)
    };

    onSubmit(evaluationData);
  };

  const ratingLabels = {
    1: 'Muito Ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente'
  };

  const categoryOptions = [
    'Organização',
    'Comunicação',
    'Flexibilidade',
    'Suporte',
    'Qualidade',
    'Pontualidade',
    'Profissionalismo',
    'Ambiente'
  ];

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {evaluation ? 'Editar Avaliação' : 'Nova Avaliação'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <XMarkIcon width={20} height={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            {/* Rating */}
            <FormGroup>
              <Label>
                Avaliação Geral <Required>*</Required>
              </Label>
              <RatingContainer>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarButton
                    key={star}
                    type="button"
                    active={star <= formData.rating}
                    onClick={() => handleRatingChange(star)}
                  >
                    {star <= formData.rating ? (
                      <StarSolidIcon width={24} height={24} />
                    ) : (
                      <StarIcon width={24} height={24} />
                    )}
                  </StarButton>
                ))}
                <RatingLabel>
                  {formData.rating > 0 && ratingLabels[formData.rating]}
                </RatingLabel>
              </RatingContainer>
              {errors.rating && (
                <ErrorMessage>
                  <ExclamationTriangleIcon width={16} height={16} />
                  {errors.rating}
                </ErrorMessage>
              )}
            </FormGroup>

            {/* Comment */}
            <FormGroup>
              <Label>
                Comentário <Required>*</Required>
              </Label>
              <TextArea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Conte-nos sobre sua experiência..."
                rows={4}
              />
              {errors.comment && (
                <ErrorMessage>
                  <ExclamationTriangleIcon width={16} height={16} />
                  {errors.comment}
                </ErrorMessage>
              )}
            </FormGroup>

            {/* Categories */}
            <FormGroup>
              <Label>Categorias (opcional)</Label>
              <CheckboxGroup>
                {categoryOptions.map((category) => (
                  <CheckboxItem key={category}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    />
                    {category}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>

            {/* Strengths */}
            <FormGroup>
              <Label>Pontos Fortes (opcional)</Label>
              <TextArea
                value={formData.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                placeholder="O que mais gostou?"
                rows={3}
              />
            </FormGroup>

            {/* Improvements */}
            <FormGroup>
              <Label>Sugestões de Melhoria (opcional)</Label>
              <TextArea
                value={formData.improvements}
                onChange={(e) => handleInputChange('improvements', e.target.value)}
                placeholder="O que poderia ser melhorado?"
                rows={3}
              />
            </FormGroup>

            {/* Options */}
            <FormGroup>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  checked={formData.wouldRecommend}
                  onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
                />
                Recomendaria para outros
              </CheckboxItem>
              
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
                Avaliação anônima
              </CheckboxItem>
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : (evaluation ? 'Atualizar' : 'Avaliar')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EvaluationForm;
