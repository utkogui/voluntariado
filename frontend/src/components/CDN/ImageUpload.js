import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UploadContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.normal};
  background-color: ${props => props.theme.colors.background};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primaryLight};
  }

  ${props => props.isDragOver && `
    border-color: ${props.theme.colors.primary};
    background-color: ${props.theme.colors.primaryLight};
  `}
`;

const UploadIcon = styled.div`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UploadText = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const UploadSubtext = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const PreviewItem = styled.div`
  position: relative;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background-color: ${props => props.theme.colors.background};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
`;

const PreviewInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
`;

const PreviewName = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewSize = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background-color: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  &:hover {
    background-color: ${props => props.theme.colors.errorDark};
  }
`;

const UploadButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSizes.base};
  transition: ${props => props.theme.transitions.normal};
  margin-top: ${props => props.theme.spacing.md};

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-top: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.success ? props.theme.colors.successLight : props.theme.colors.errorLight};
  color: ${props => props.success ? props.theme.colors.successDark : props.theme.colors.errorDark};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const Checkbox = styled.input`
  margin-right: ${props => props.theme.spacing.xs};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const ImageUpload = ({ 
  onUpload, 
  onMultipleUpload, 
  isLoading, 
  error 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [options, setOptions] = useState({
    folder: 'images',
    generateSizes: true,
    uploadToCDN: true
  });
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setMessage({ 
        text: 'Alguns arquivos não são imagens e foram ignorados.', 
        success: false 
      });
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ text: 'Selecione pelo menos uma imagem.', success: false });
      return;
    }

    setMessage(null);

    try {
      if (selectedFiles.length === 1) {
        await onUpload(selectedFiles[0], options);
      } else {
        await onMultipleUpload(selectedFiles, options);
      }
      
      setSelectedFiles([]);
      setMessage({ 
        text: `${selectedFiles.length} imagem(ns) enviada(s) com sucesso!`, 
        success: true 
      });
    } catch (error) {
      setMessage({ 
        text: `Erro ao enviar imagens: ${error.message}`, 
        success: false 
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <UploadContainer>
      <Title>Upload de Imagens</Title>
      
      <UploadArea
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon>
          <PhotoIcon width={48} height={48} />
        </UploadIcon>
        <UploadText>
          Arraste e solte imagens aqui ou clique para selecionar
        </UploadText>
        <UploadSubtext>
          Suporte para JPG, PNG, WebP e GIF (máx. 10MB cada)
        </UploadSubtext>
      </UploadArea>

      <FileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
      />

      {selectedFiles.length > 0 && (
        <PreviewContainer>
          {selectedFiles.map((file, index) => (
            <PreviewItem key={index}>
              <PreviewImage
                src={URL.createObjectURL(file)}
                alt={file.name}
              />
              <PreviewInfo>
                <PreviewName>{file.name}</PreviewName>
                <PreviewSize>{formatFileSize(file.size)}</PreviewSize>
              </PreviewInfo>
              <RemoveButton onClick={() => removeFile(index)}>
                <XMarkIcon width={12} height={12} />
              </RemoveButton>
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}

      <OptionsContainer>
        <OptionGroup>
          <Label>Pasta de Destino:</Label>
          <input
            type="text"
            value={options.folder}
            onChange={(e) => setOptions(prev => ({ ...prev, folder: e.target.value }))}
            placeholder="images"
          />
        </OptionGroup>

        <OptionGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={options.generateSizes}
              onChange={(e) => setOptions(prev => ({ ...prev, generateSizes: e.target.checked }))}
            />
            Gerar diferentes tamanhos
          </CheckboxLabel>
        </OptionGroup>

        <OptionGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={options.uploadToCDN}
              onChange={(e) => setOptions(prev => ({ ...prev, uploadToCDN: e.target.checked }))}
            />
            Upload para CDN
          </CheckboxLabel>
        </OptionGroup>
      </OptionsContainer>

      <UploadButton onClick={handleUpload} disabled={isLoading || selectedFiles.length === 0}>
        {isLoading ? 'Enviando...' : `Enviar ${selectedFiles.length} Imagem(ns)`}
        {!isLoading && <CloudArrowUpIcon width={20} height={20} />}
      </UploadButton>

      {message && (
        <Message success={message.success}>
          {message.success ? (
            <CheckCircleIcon width={16} height={16} />
          ) : (
            <ExclamationTriangleIcon width={16} height={16} />
          )}
          {message.text}
        </Message>
      )}

      {error && (
        <Message success={false}>
          <ExclamationTriangleIcon width={16} height={16} />
          {error}
        </Message>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;
