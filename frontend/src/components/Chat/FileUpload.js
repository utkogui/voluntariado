import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  PaperClipIcon, 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const FileUploadContainer = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray900};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const FilePreview = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.md};
  width: 300px;
  max-height: 200px;
  z-index: ${props => props.theme.zIndex.popover};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FilePreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  padding-bottom: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const FilePreviewTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
`;

const FileList = styled.div`
  max-height: 120px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray50};
  }
`;

const FileIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.gray100};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.gray600};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray500};
  margin: 0;
`;

const RemoveButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray400};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.error};
  }
`;

const UploadButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray300};
    cursor: not-allowed;
  }
`;

const FileUpload = ({ onFileSelect, onFileRemove, selectedFiles = [] }) => {
  const fileInputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => onFileSelect(file));
    setShowPreview(true);
  };

  const handleRemoveFile = (index) => {
    onFileRemove(index);
    if (selectedFiles.length === 1) {
      setShowPreview(false);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <PhotoIcon width={16} height={16} />;
      case 'video':
        return <VideoCameraIcon width={16} height={16} />;
      default:
        return <DocumentIcon width={16} height={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    // Implementar upload dos arquivos
    console.log('Uploading files:', selectedFiles);
    setShowPreview(false);
  };

  return (
    <FileUploadContainer>
      <FileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
      />
      
      <FileButton
        onClick={() => fileInputRef.current?.click()}
        title="Anexar arquivo"
      >
        <PaperClipIcon width={20} height={20} />
      </FileButton>

      <FilePreview isOpen={showPreview && selectedFiles.length > 0}>
        <FilePreviewHeader>
          <FilePreviewTitle>Anexos ({selectedFiles.length})</FilePreviewTitle>
          <CloseButton onClick={() => setShowPreview(false)}>
            <XMarkIcon width={16} height={16} />
          </CloseButton>
        </FilePreviewHeader>

        <FileList>
          {selectedFiles.map((file, index) => (
            <FileItem key={index}>
              <FileIcon>
                {getFileIcon(file)}
              </FileIcon>
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileSize>{formatFileSize(file.size)}</FileSize>
              </FileInfo>
              <RemoveButton onClick={() => handleRemoveFile(index)}>
                <XMarkIcon width={16} height={16} />
              </RemoveButton>
            </FileItem>
          ))}
        </FileList>

        <UploadButton onClick={handleUpload}>
          Enviar {selectedFiles.length} arquivo{selectedFiles.length !== 1 ? 's' : ''}
        </UploadButton>
      </FilePreview>
    </FileUploadContainer>
  );
};

export default FileUpload;
