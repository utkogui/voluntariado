import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { updateNotificationSettings } from '../../store/slices/notificationsSlice';
import notificationService from '../../services/notificationService';

const SettingsContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SettingsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SettingsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.gray100};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const SettingDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.gray600};
  margin: 0;
  line-height: 1.4;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.gray300};
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const PermissionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  ${props => {
    switch (props.status) {
      case 'granted':
        return `
          background-color: ${props.theme.colors.success}20;
          color: ${props.theme.colors.success};
          border: 1px solid ${props.theme.colors.success}40;
        `;
      case 'denied':
        return `
          background-color: ${props.theme.colors.error}20;
          color: ${props.theme.colors.error};
          border: 1px solid ${props.theme.colors.error}40;
        `;
      default:
        return `
          background-color: ${props.theme.colors.warning}20;
          color: ${props.theme.colors.warning};
          border: 1px solid ${props.theme.colors.warning}40;
        `;
    }
  }}
`;

const PermissionText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const RequestButton = styled.button`
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
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray300};
    cursor: not-allowed;
  }
`;

const TestButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing.md};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondaryDark};
  }
`;

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const { settings, isLoading } = useSelector(state => state.notifications);
  const [localSettings, setLocalSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    desktopEnabled: true,
    mobileEnabled: true,
    frequency: 'immediate',
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    types: {
      messages: true,
      opportunities: true,
      evaluations: true,
      schedule: true,
      system: true
    }
  });
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeChange = (type, value) => {
    setLocalSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await notificationService.updateSettings(localSettings);
      dispatch(updateNotificationSettings(localSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      setPermission(Notification.permission);
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const handleTestNotification = () => {
    notificationService.createLocalNotification('Teste de Notificação', {
      body: 'Esta é uma notificação de teste para verificar se tudo está funcionando corretamente.',
      icon: '/logo192.png',
      tag: 'test',
      requireInteraction: true
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { status: 'granted', text: 'Permitido' };
      case 'denied':
        return { status: 'denied', text: 'Negado' };
      default:
        return { status: 'default', text: 'Não solicitado' };
    }
  };

  const permissionInfo = getPermissionStatus();

  return (
    <SettingsContainer>
      <SettingsHeader>
        <BellIcon width={24} height={24} />
        <SettingsTitle>Configurações de Notificação</SettingsTitle>
      </SettingsHeader>

      {/* Status da permissão */}
      <PermissionStatus status={permissionInfo.status}>
        {permissionInfo.status === 'granted' ? (
          <CheckIcon width={20} height={20} />
        ) : permissionInfo.status === 'denied' ? (
          <XMarkIcon width={20} height={20} />
        ) : (
          <ExclamationTriangleIcon width={20} height={20} />
        )}
        <PermissionText>
          Permissão: {permissionInfo.text}
        </PermissionText>
        {permissionInfo.status !== 'granted' && (
          <RequestButton onClick={handleRequestPermission}>
            Solicitar Permissão
          </RequestButton>
        )}
      </PermissionStatus>

      {/* Configurações gerais */}
      <SettingsSection>
        <SectionTitle>Configurações Gerais</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="pushEnabled">Notificações Push</SettingLabel>
            <SettingDescription>
              Receber notificações em tempo real no navegador
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="pushEnabled"
              checked={localSettings.pushEnabled}
              onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="soundEnabled">Som</SettingLabel>
            <SettingDescription>
              Reproduzir som quando receber notificações
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="soundEnabled"
              checked={localSettings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="vibrationEnabled">Vibração</SettingLabel>
            <SettingDescription>
              Vibrar o dispositivo quando receber notificações
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="vibrationEnabled"
              checked={localSettings.vibrationEnabled}
              onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="frequency">Frequência</SettingLabel>
            <SettingDescription>
              Com que frequência receber notificações
            </SettingDescription>
          </SettingInfo>
          <Select
            value={localSettings.frequency}
            onChange={(e) => handleSettingChange('frequency', e.target.value)}
          >
            <option value="immediate">Imediato</option>
            <option value="hourly">A cada hora</option>
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
          </Select>
        </SettingItem>
      </SettingsSection>

      {/* Tipos de notificação */}
      <SettingsSection>
        <SectionTitle>Tipos de Notificação</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="messages">Mensagens</SettingLabel>
            <SettingDescription>
              Notificações de novas mensagens no chat
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="messages"
              checked={localSettings.types.messages}
              onChange={(e) => handleTypeChange('messages', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="opportunities">Oportunidades</SettingLabel>
            <SettingDescription>
              Notificações sobre novas oportunidades de voluntariado
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="opportunities"
              checked={localSettings.types.opportunities}
              onChange={(e) => handleTypeChange('opportunities', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="evaluations">Avaliações</SettingLabel>
            <SettingDescription>
              Notificações sobre avaliações e feedback
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="evaluations"
              checked={localSettings.types.evaluations}
              onChange={(e) => handleTypeChange('evaluations', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="schedule">Agenda</SettingLabel>
            <SettingDescription>
              Notificações sobre atividades agendadas
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="schedule"
              checked={localSettings.types.schedule}
              onChange={(e) => handleTypeChange('schedule', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="system">Sistema</SettingLabel>
            <SettingDescription>
              Notificações do sistema e atualizações
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="system"
              checked={localSettings.types.system}
              onChange={(e) => handleTypeChange('system', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </SettingsSection>

      {/* Horário silencioso */}
      <SettingsSection>
        <SectionTitle>Horário Silencioso</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="quietHours">Ativar Horário Silencioso</SettingLabel>
            <SettingDescription>
              Não receber notificações durante o horário configurado
            </SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="quietHours"
              checked={localSettings.quietHours}
              onChange={(e) => handleSettingChange('quietHours', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        {localSettings.quietHours && (
          <>
            <SettingItem>
              <SettingInfo>
                <SettingLabel htmlFor="quietStart">Início</SettingLabel>
                <SettingDescription>
                  Horário de início do modo silencioso
                </SettingDescription>
              </SettingInfo>
              <input
                type="time"
                id="quietStart"
                value={localSettings.quietStart}
                onChange={(e) => handleSettingChange('quietStart', e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel htmlFor="quietEnd">Fim</SettingLabel>
                <SettingDescription>
                  Horário de fim do modo silencioso
                </SettingDescription>
              </SettingInfo>
              <input
                type="time"
                id="quietEnd"
                value={localSettings.quietEnd}
                onChange={(e) => handleSettingChange('quietEnd', e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </SettingItem>
          </>
        )}
      </SettingsSection>

      {/* Botões de ação */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <RequestButton onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </RequestButton>
        
        <TestButton onClick={handleTestNotification}>
          Testar Notificação
        </TestButton>
      </div>
    </SettingsContainer>
  );
};

export default NotificationSettings;
