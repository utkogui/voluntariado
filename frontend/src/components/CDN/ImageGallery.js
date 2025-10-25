import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  PhotoIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const GalleryContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const GalleryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(${props => props.theme.colors.primaryRGB}, 0.2);
  }
`;

const SizeSelect = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const ImageCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background-color: ${props => props.theme.colors.background};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  opacity: 0;
  transition: ${props => props.theme.transitions.normal};

  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    background-color: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.errorDark};
    transform: scale(1.1);
  }
`;

const ImageInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
`;

const ImageName = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ImageSize = styled.span`
  margin-right: ${props => props.theme.spacing.sm};
`;

const ImageDate = styled.span``;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  padding: ${props => props.theme.spacing.xl};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: ${props => props.theme.borderRadius.md};
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background-color: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ImageGallery = ({ 
  images, 
  onDelete, 
  onRefresh, 
  isLoading, 
  error 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState('original');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = images.filter(image =>
    image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDelete = async (imageId) => {
    if (window.confirm('Tem certeza que deseja deletar esta imagem?')) {
      await onDelete(imageId);
    }
  };

  if (isLoading) {
    return (
      <GalleryContainer>
        <Title>Galeria de Imagens</Title>
        <EmptyState>Carregando imagens...</EmptyState>
      </GalleryContainer>
    );
  }

  if (error) {
    return (
      <GalleryContainer>
        <Title>Galeria de Imagens</Title>
        <EmptyState style={{ color: 'red' }}>Erro ao carregar imagens: {error}</EmptyState>
      </GalleryContainer>
    );
  }

  return (
    <>
      <GalleryContainer>
        <GalleryHeader>
          <Title>Galeria de Imagens ({images.length})</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar imagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SizeSelect
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="original">Original</option>
              <option value="thumbnail">Thumbnail</option>
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
            </SizeSelect>
            <ActionButton onClick={onRefresh} primary>
              <ArrowPathIcon width={16} height={16} />
            </ActionButton>
          </SearchContainer>
        </GalleryHeader>

        {filteredImages.length === 0 ? (
          <EmptyState>
            <PhotoIcon width={48} height={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhuma imagem encontrada</p>
          </EmptyState>
        ) : (
          <GalleryGrid>
            {filteredImages.map((image) => (
              <ImageCard key={image.id}>
                <ImageContainer onClick={() => handleImageClick(image)}>
                  <Image
                    src={image.url || image.cdnUrl}
                    alt={image.originalName}
                  />
                  <ImageOverlay>
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(image);
                    }} primary>
                      <EyeIcon width={16} height={16} />
                    </ActionButton>
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}>
                      <TrashIcon width={16} height={16} />
                    </ActionButton>
                  </ImageOverlay>
                </ImageContainer>
                <ImageInfo>
                  <ImageName>{image.originalName}</ImageName>
                  <ImageDetails>
                    <ImageSize>{formatFileSize(image.size)}</ImageSize>
                    <ImageDate>
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </ImageDate>
                  </ImageDetails>
                </ImageInfo>
              </ImageCard>
            ))}
          </GalleryGrid>
        )}
      </GalleryContainer>

      {selectedImage && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseModal}>
              ×
            </CloseButton>
            <ModalImage
              src={selectedImage.url || selectedImage.cdnUrl}
              alt={selectedImage.originalName}
            />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ImageGallery;
