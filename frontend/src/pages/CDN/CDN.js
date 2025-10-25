import React from 'react';
import styled from 'styled-components';
import useCDN from '../../hooks/useCDN';
import ImageUpload from '../../components/CDN/ImageUpload';
import ImageGallery from '../../components/CDN/ImageGallery';

const CDNContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.textSecondary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const CDN = () => {
  const {
    images,
    stats,
    isLoading,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    fetchImages,
    fetchAllData
  } = useCDN();

  return (
    <CDNContainer>
      <Header>
        <Title>Gerenciamento de Imagens</Title>
        <Subtitle>
          Upload, organize e gerencie suas imagens com CDN
        </Subtitle>
      </Header>

      <Content>
        <ImageUpload
          onUpload={uploadImage}
          onMultipleUpload={uploadMultipleImages}
          isLoading={isLoading}
          error={error}
        />
        
        <ImageGallery
          images={images}
          onDelete={deleteImage}
          onRefresh={fetchImages}
          isLoading={isLoading}
          error={error}
        />
      </Content>
    </CDNContainer>
  );
};

export default CDN;
