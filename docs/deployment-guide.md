# Guia de Deploy e Manutenção

Este documento fornece instruções completas para deploy e manutenção do sistema de voluntariado em produção.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy com Docker](#deploy-com-docker)
4. [Deploy com Kubernetes](#deploy-com-kubernetes)
5. [Configuração de Banco de Dados](#configuração-de-banco-de-dados)
6. [Configuração de SSL/TLS](#configuração-de-ssltls)
7. [Monitoramento e Logs](#monitoramento-e-logs)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Manutenção](#manutenção)
10. [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Servidor
- **OS**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **CPU**: Mínimo 2 cores, recomendado 4 cores+
- **Disco**: Mínimo 50GB SSD
- **Rede**: Acesso à internet e porta 80/443 liberadas

### Software
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Kubernetes**: 1.21+ (opcional)
- **kubectl**: 1.21+ (opcional)
- **Git**: 2.30+
- **Node.js**: 18+ (para desenvolvimento)

### Serviços Externos
- **PostgreSQL**: 13+ (ou serviço gerenciado)
- **Redis**: 6+ (ou serviço gerenciado)
- **AWS S3**: Para armazenamento de arquivos
- **SendGrid**: Para emails transacionais
- **Twilio**: Para SMS (opcional)
- **Firebase**: Para notificações push

## Configuração do Ambiente

### 1. Clonar Repositório
```bash
git clone https://github.com/utkogui/voluntariado.git
cd voluntariado
```

### 2. Configurar Variáveis de Ambiente
```bash
cp config/production.env .env
nano .env
```

### 3. Configurar Secrets
```bash
# Gerar JWT secret
openssl rand -base64 32

# Gerar session secret
openssl rand -base64 32

# Configurar senhas do banco
echo "DATABASE_PASSWORD=$(openssl rand -base64 32)" >> .env
echo "REDIS_PASSWORD=$(openssl rand -base64 32)" >> .env
```

### 4. Configurar DNS
```bash
# Configurar registros DNS
# A record: voluntariado.com -> IP_DO_SERVIDOR
# CNAME: www.voluntariado.com -> voluntariado.com
```

## Deploy com Docker

### 1. Build da Imagem
```bash
# Build da imagem
docker build -t voluntariado:latest .

# Tag para registry
docker tag voluntariado:latest your-registry.com/voluntariado:latest

# Push para registry
docker push your-registry.com/voluntariado:latest
```

### 2. Deploy com Docker Compose
```bash
# Deploy completo
docker-compose -f docker-compose.yml up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Configuração de Rede
```bash
# Criar rede personalizada
docker network create voluntariado-network

# Conectar containers
docker network connect voluntariado-network voluntariado-app
docker network connect voluntariado-network voluntariado-postgres
docker network connect voluntariado-network voluntariado-redis
```

## Deploy com Kubernetes

### 1. Configurar Namespace
```bash
kubectl create namespace production
kubectl config set-context --current --namespace=production
```

### 2. Configurar Secrets
```bash
# Criar secrets
kubectl create secret generic volunteer-app-secrets \
  --from-literal=DATABASE_PASSWORD=your_password \
  --from-literal=JWT_SECRET=your_jwt_secret \
  --from-literal=REDIS_PASSWORD=your_redis_password

# Criar configmap
kubectl create configmap volunteer-app-config \
  --from-env-file=config/production.env
```

### 3. Deploy da Aplicação
```bash
# Aplicar configurações
kubectl apply -f k8s/production.yaml

# Verificar pods
kubectl get pods

# Verificar serviços
kubectl get services

# Verificar ingress
kubectl get ingress
```

### 4. Configurar SSL/TLS
```bash
# Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Aplicar certificados SSL
kubectl apply -f k8s/ssl-certificates.yaml
```

## Configuração de Banco de Dados

### 1. PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE volunteer_app_prod;
CREATE USER volunteer_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE volunteer_app_prod TO volunteer_user;
\q
```

### 2. Executar Migrações
```bash
# Executar migrações
npm run db:migrate

# Executar seeds
npm run db:seed
```

### 3. Configurar Backup
```bash
# Configurar backup automático
crontab -e
# Adicionar linha:
# 0 2 * * * /path/to/backup-script.sh
```

## Configuração de SSL/TLS

### 1. Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d voluntariado.com -d www.voluntariado.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx SSL
```bash
# Configurar Nginx
sudo cp nginx/ssl.conf /etc/nginx/sites-available/voluntariado
sudo ln -s /etc/nginx/sites-available/voluntariado /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoramento e Logs

### 1. Configurar Logs
```bash
# Criar diretório de logs
sudo mkdir -p /var/log/voluntariado
sudo chown -R www-data:www-data /var/log/voluntariado

# Configurar logrotate
sudo nano /etc/logrotate.d/voluntariado
```

### 2. Configurar Monitoramento
```bash
# Instalar New Relic
curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=your_key NEW_RELIC_ACCOUNT_ID=your_account_id /usr/local/bin/newrelic install

# Configurar Sentry
npm install @sentry/node
```

### 3. Configurar Alertas
```bash
# Configurar alertas por email
# Configurar alertas por Slack
# Configurar alertas por SMS
```

## Backup e Recuperação

### 1. Backup do Banco de Dados
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="volunteer_app_prod"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload para S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://voluntariado-backups/database/

# Limpar backups locais antigos
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### 2. Backup de Arquivos
```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/files"
FILES_DIR="/var/www/voluntariado/uploads"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz $FILES_DIR

# Upload para S3
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://voluntariado-backups/files/

# Limpar backups locais antigos
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +7 -delete
```

### 3. Recuperação
```bash
# Restaurar banco de dados
gunzip backup_20231201_120000.sql.gz
psql volunteer_app_prod < backup_20231201_120000.sql

# Restaurar arquivos
tar -xzf files_20231201_120000.tar.gz -C /
```

## Manutenção

### 1. Atualizações
```bash
# Atualizar aplicação
git pull origin main
npm install
npm run build
docker-compose restart

# Atualizar dependências
npm audit fix
npm update
```

### 2. Limpeza
```bash
# Limpar logs antigos
find /var/log/voluntariado -name "*.log" -mtime +30 -delete

# Limpar cache
redis-cli FLUSHALL

# Limpar imagens Docker antigas
docker system prune -a
```

### 3. Monitoramento
```bash
# Verificar status dos serviços
systemctl status nginx
systemctl status postgresql
systemctl status redis

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h

# Verificar processos
ps aux | grep node
```

### 4. Performance
```bash
# Otimizar banco de dados
psql volunteer_app_prod -c "VACUUM ANALYZE;"

# Otimizar Redis
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Otimizar Nginx
nginx -s reload
```

## Troubleshooting

### 1. Problemas Comuns

#### Aplicação não inicia
```bash
# Verificar logs
docker-compose logs voluntariado-app

# Verificar variáveis de ambiente
docker-compose config

# Verificar conectividade do banco
docker-compose exec voluntariado-app npm run db:test
```

#### Banco de dados não conecta
```bash
# Verificar status do PostgreSQL
systemctl status postgresql

# Verificar logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-13-main.log

# Testar conexão
psql -h localhost -U volunteer_user -d volunteer_app_prod
```

#### SSL não funciona
```bash
# Verificar certificados
openssl x509 -in /etc/ssl/certs/voluntariado.crt -text -noout

# Verificar configuração do Nginx
nginx -t

# Verificar portas
netstat -tlnp | grep :443
```

### 2. Logs Importantes
```bash
# Logs da aplicação
tail -f /var/log/voluntariado/app.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-13-main.log

# Logs do Redis
tail -f /var/log/redis/redis-server.log
```

### 3. Comandos Úteis
```bash
# Reiniciar serviços
systemctl restart nginx
systemctl restart postgresql
systemctl restart redis

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h

# Verificar processos
ps aux | grep -E "(node|nginx|postgres|redis)"

# Verificar portas
netstat -tlnp

# Verificar conectividade
curl -I https://voluntariado.com/health
```

### 4. Contatos de Emergência
- **Administrador do Sistema**: admin@voluntariado.com
- **Suporte Técnico**: suporte@voluntariado.com
- **Emergência**: +55 11 99999-9999

### 5. Documentação Adicional
- [Documentação da API](docs/api.md)
- [Guia de Desenvolvimento](docs/development.md)
- [Guia de Testes](docs/testing.md)
- [Guia de Segurança](docs/security.md)

## Checklist de Deploy

### Antes do Deploy
- [ ] Backup do banco de dados atual
- [ ] Backup dos arquivos de upload
- [ ] Teste em ambiente de staging
- [ ] Verificação de todas as dependências
- [ ] Configuração de monitoramento
- [ ] Configuração de alertas

### Durante o Deploy
- [ ] Deploy da aplicação
- [ ] Execução de migrações
- [ ] Verificação de saúde da aplicação
- [ ] Teste de funcionalidades críticas
- [ ] Verificação de logs
- [ ] Configuração de SSL/TLS

### Após o Deploy
- [ ] Teste completo da aplicação
- [ ] Verificação de performance
- [ ] Configuração de backup
- [ ] Documentação de mudanças
- [ ] Notificação aos usuários
- [ ] Monitoramento contínuo

## Manutenção Preventiva

### Diária
- [ ] Verificar logs de erro
- [ ] Verificar uso de recursos
- [ ] Verificar status dos serviços
- [ ] Verificar backups

### Semanal
- [ ] Análise de performance
- [ ] Limpeza de logs antigos
- [ ] Verificação de segurança
- [ ] Atualização de dependências

### Mensal
- [ ] Backup completo do sistema
- [ ] Análise de uso de disco
- [ ] Revisão de configurações
- [ ] Teste de recuperação

### Trimestral
- [ ] Auditoria de segurança
- [ ] Revisão de monitoramento
- [ ] Atualização de documentação
- [ ] Treinamento da equipe
