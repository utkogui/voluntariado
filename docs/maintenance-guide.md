# Manual de Manutenção do Sistema

Este documento fornece instruções detalhadas para manutenção do sistema de voluntariado em produção.

## Índice

1. [Monitoramento Diário](#monitoramento-diário)
2. [Manutenção Preventiva](#manutenção-preventiva)
3. [Resolução de Problemas](#resolução-de-problemas)
4. [Atualizações e Patches](#atualizações-e-patches)
5. [Backup e Recuperação](#backup-e-recuperação)
6. [Segurança](#segurança)
7. [Performance](#performance)
8. [Logs e Auditoria](#logs-e-auditoria)

## Monitoramento Diário

### 1. Verificações de Saúde
```bash
# Verificar status dos serviços
systemctl status nginx postgresql redis

# Verificar uso de recursos
htop
df -h
free -h

# Verificar conectividade
curl -I https://voluntariado.com/health
```

### 2. Logs de Erro
```bash
# Verificar logs de erro da aplicação
tail -f /var/log/voluntariado/error.log

# Verificar logs do Nginx
tail -f /var/log/nginx/error.log

# Verificar logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-13-main.log
```

### 3. Métricas de Performance
```bash
# Verificar métricas do Redis
redis-cli info memory

# Verificar métricas do PostgreSQL
psql -c "SELECT * FROM pg_stat_activity;"

# Verificar métricas da aplicação
curl https://voluntariado.com/api/health
```

## Manutenção Preventiva

### 1. Limpeza de Logs
```bash
#!/bin/bash
# cleanup-logs.sh

# Limpar logs antigos (mais de 30 dias)
find /var/log/voluntariado -name "*.log" -mtime +30 -delete

# Limpar logs do Nginx (mais de 7 dias)
find /var/log/nginx -name "*.log" -mtime +7 -delete

# Limpar logs do PostgreSQL (mais de 14 dias)
find /var/log/postgresql -name "*.log" -mtime +14 -delete

# Rotacionar logs
logrotate -f /etc/logrotate.d/voluntariado
```

### 2. Limpeza de Cache
```bash
#!/bin/bash
# cleanup-cache.sh

# Limpar cache do Redis
redis-cli FLUSHDB

# Limpar cache do sistema
echo 3 > /proc/sys/vm/drop_caches

# Limpar cache do Nginx
rm -rf /var/cache/nginx/*
```

### 3. Otimização do Banco de Dados
```bash
#!/bin/bash
# optimize-database.sh

# VACUUM e ANALYZE
psql volunteer_app_prod -c "VACUUM ANALYZE;"

# Verificar índices não utilizados
psql volunteer_app_prod -c "
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0 AND idx_tup_fetch = 0;
"

# Verificar tabelas grandes
psql volunteer_app_prod -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## Resolução de Problemas

### 1. Aplicação Não Responde
```bash
# Verificar status do container
docker-compose ps

# Verificar logs
docker-compose logs voluntariado-app

# Reiniciar aplicação
docker-compose restart voluntariado-app

# Verificar recursos
docker stats
```

### 2. Banco de Dados Lento
```bash
# Verificar queries ativas
psql volunteer_app_prod -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
"

# Verificar locks
psql volunteer_app_prod -c "
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
"
```

### 3. Problemas de Memória
```bash
# Verificar uso de memória
free -h
ps aux --sort=-%mem | head -10

# Verificar swap
swapon -s

# Limpar cache de memória
echo 3 > /proc/sys/vm/drop_caches
```

### 4. Problemas de Disco
```bash
# Verificar uso de disco
df -h
du -sh /var/log/*

# Encontrar arquivos grandes
find / -type f -size +100M 2>/dev/null | head -10

# Limpar arquivos temporários
rm -rf /tmp/*
rm -rf /var/tmp/*
```

## Atualizações e Patches

### 1. Atualização da Aplicação
```bash
#!/bin/bash
# update-application.sh

# Fazer backup antes da atualização
./scripts/backup-database.sh
./scripts/backup-files.sh

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Executar migrações
npm run db:migrate

# Rebuild da aplicação
npm run build

# Reiniciar serviços
docker-compose restart

# Verificar saúde
curl -I https://voluntariado.com/health
```

### 2. Atualização de Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

### 3. Atualização do Sistema
```bash
# Atualizar sistema operacional
sudo apt update
sudo apt upgrade -y

# Reiniciar se necessário
sudo reboot
```

## Backup e Recuperação

### 1. Backup Automático
```bash
#!/bin/bash
# backup-automatic.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup do banco de dados
pg_dump volunteer_app_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup de arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/voluntariado/uploads

# Upload para S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://voluntariado-backups/database/
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://voluntariado-backups/files/

# Limpar backups locais antigos
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### 2. Teste de Recuperação
```bash
#!/bin/bash
# test-recovery.sh

# Testar restauração do banco
gunzip -c /backups/db_latest.sql.gz | psql volunteer_app_test

# Testar restauração de arquivos
tar -xzf /backups/files_latest.tar.gz -C /tmp/test-restore

# Verificar integridade
psql volunteer_app_test -c "SELECT COUNT(*) FROM users;"
```

## Segurança

### 1. Verificação de Segurança
```bash
# Verificar portas abertas
nmap localhost

# Verificar processos suspeitos
ps aux | grep -E "(nc|netcat|wget|curl)"

# Verificar arquivos modificados recentemente
find /var/www -type f -mtime -1 -ls
```

### 2. Atualização de Certificados
```bash
# Verificar expiração de certificados
openssl x509 -in /etc/ssl/certs/voluntariado.crt -noout -dates

# Renovar certificados
certbot renew --dry-run
certbot renew

# Verificar configuração SSL
sslscan voluntariado.com
```

### 3. Auditoria de Logs
```bash
# Verificar tentativas de login
grep "Failed password" /var/log/auth.log

# Verificar acessos suspeitos
grep "404" /var/log/nginx/access.log | tail -20

# Verificar erros de aplicação
grep "ERROR" /var/log/voluntariado/app.log | tail -20
```

## Performance

### 1. Otimização de Consultas
```bash
# Verificar queries lentas
psql volunteer_app_prod -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# Verificar índices
psql volunteer_app_prod -c "
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
"
```

### 2. Otimização de Cache
```bash
# Verificar hit rate do Redis
redis-cli info stats | grep keyspace

# Verificar cache do Nginx
curl -I https://voluntariado.com/static/css/main.css

# Limpar cache se necessário
redis-cli FLUSHDB
```

### 3. Monitoramento de Performance
```bash
# Verificar métricas do sistema
iostat -x 1 5
vmstat 1 5
sar -u 1 5

# Verificar métricas da aplicação
curl https://voluntariado.com/api/metrics
```

## Logs e Auditoria

### 1. Configuração de Logs
```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/voluntariado

# Configurar syslog
sudo nano /etc/rsyslog.d/50-voluntariado.conf
```

### 2. Análise de Logs
```bash
# Analisar logs de acesso
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Analisar erros
grep "ERROR" /var/log/voluntariado/app.log | awk '{print $4}' | sort | uniq -c | sort -nr

# Analisar performance
grep "slow query" /var/log/postgresql/postgresql-13-main.log
```

### 3. Relatórios de Auditoria
```bash
#!/bin/bash
# audit-report.sh

DATE=$(date +%Y%m%d)
REPORT_DIR="/reports"

# Gerar relatório de acesso
awk '{print $1, $4, $7, $9}' /var/log/nginx/access.log | \
  sort | uniq -c | sort -nr > $REPORT_DIR/access_$DATE.txt

# Gerar relatório de erros
grep "ERROR" /var/log/voluntariado/app.log | \
  awk '{print $1, $2, $4, $5}' | \
  sort | uniq -c | sort -nr > $REPORT_DIR/errors_$DATE.txt

# Gerar relatório de performance
psql volunteer_app_prod -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
" > $REPORT_DIR/performance_$DATE.txt
```

## Checklist de Manutenção

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

## Contatos de Emergência

- **Administrador do Sistema**: admin@voluntariado.com
- **Suporte Técnico**: suporte@voluntariado.com
- **Emergência**: +55 11 99999-9999
- **Slack**: #voluntariado-support
- **Discord**: #voluntariado-dev

## Documentação Relacionada

- [Guia de Deploy](deployment-guide.md)
- [Documentação da API](api.md)
- [Guia de Desenvolvimento](development.md)
- [Guia de Testes](testing.md)
- [Guia de Segurança](security.md)
