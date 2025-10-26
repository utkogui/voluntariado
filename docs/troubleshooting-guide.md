# Guia de Troubleshooting

Este documento fornece soluções para problemas comuns encontrados no sistema de voluntariado.

## Índice

1. [Problemas de Conectividade](#problemas-de-conectividade)
2. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
3. [Problemas de Performance](#problemas-de-performance)
4. [Problemas de Segurança](#problemas-de-segurança)
5. [Problemas de SSL/TLS](#problemas-de-ssltls)
6. [Problemas de Cache](#problemas-de-cache)
7. [Problemas de Logs](#problemas-de-logs)
8. [Problemas de Deploy](#problemas-de-deploy)

## Problemas de Conectividade

### 1. Aplicação Não Responde
**Sintomas**: Aplicação não carrega, timeout de conexão

**Diagnóstico**:
```bash
# Verificar status do container
docker-compose ps

# Verificar logs
docker-compose logs voluntariado-app

# Verificar portas
netstat -tlnp | grep :3000
```

**Soluções**:
```bash
# Reiniciar aplicação
docker-compose restart voluntariado-app

# Verificar recursos
docker stats

# Verificar configuração
docker-compose config
```

### 2. Nginx Não Responde
**Sintomas**: Erro 502 Bad Gateway, timeout

**Diagnóstico**:
```bash
# Verificar status do Nginx
systemctl status nginx

# Verificar configuração
nginx -t

# Verificar logs
tail -f /var/log/nginx/error.log
```

**Soluções**:
```bash
# Reiniciar Nginx
systemctl restart nginx

# Verificar upstream
curl http://localhost:3000/health

# Verificar configuração de proxy
grep -r "proxy_pass" /etc/nginx/
```

## Problemas de Banco de Dados

### 1. Conexão Recusada
**Sintomas**: Erro de conexão com PostgreSQL

**Diagnóstico**:
```bash
# Verificar status do PostgreSQL
systemctl status postgresql

# Verificar logs
tail -f /var/log/postgresql/postgresql-13-main.log

# Testar conexão
psql -h localhost -U volunteer_user -d volunteer_app_prod
```

**Soluções**:
```bash
# Reiniciar PostgreSQL
systemctl restart postgresql

# Verificar configuração
sudo -u postgres psql -c "SHOW listen_addresses;"

# Verificar usuário
sudo -u postgres psql -c "SELECT * FROM pg_user WHERE usename = 'volunteer_user';"
```

### 2. Queries Lentas
**Sintomas**: Aplicação lenta, timeout de queries

**Diagnóstico**:
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

**Soluções**:
```bash
# Matar queries longas
psql volunteer_app_prod -c "SELECT pg_terminate_backend(pid);"

# Verificar índices
psql volunteer_app_prod -c "
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
"

# Otimizar banco
psql volunteer_app_prod -c "VACUUM ANALYZE;"
```

## Problemas de Performance

### 1. Uso Alto de CPU
**Sintomas**: Sistema lento, CPU em 100%

**Diagnóstico**:
```bash
# Verificar processos
top -p $(pgrep -f "node.*server.js")

# Verificar uso de CPU
htop

# Verificar métricas
curl https://voluntariado.com/api/metrics
```

**Soluções**:
```bash
# Reiniciar aplicação
docker-compose restart voluntariado-app

# Verificar queries lentas
psql volunteer_app_prod -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# Verificar cache
redis-cli info memory
```

### 2. Uso Alto de Memória
**Sintomas**: Sistema lento, memória esgotada

**Diagnóstico**:
```bash
# Verificar uso de memória
free -h
ps aux --sort=-%mem | head -10

# Verificar swap
swapon -s

# Verificar métricas do Redis
redis-cli info memory
```

**Soluções**:
```bash
# Limpar cache de memória
echo 3 > /proc/sys/vm/drop_caches

# Reiniciar Redis
systemctl restart redis

# Verificar vazamentos de memória
node --inspect server.js
```

## Problemas de Segurança

### 1. Tentativas de Ataque
**Sintomas**: Muitas tentativas de login, acessos suspeitos

**Diagnóstico**:
```bash
# Verificar tentativas de login
grep "Failed password" /var/log/auth.log

# Verificar acessos suspeitos
grep "404" /var/log/nginx/access.log | tail -20

# Verificar IPs suspeitos
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

**Soluções**:
```bash
# Bloquear IPs suspeitos
iptables -A INPUT -s IP_SUSPEITO -j DROP

# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar configuração
sudo fail2ban-client status
```

### 2. Certificados SSL Expirados
**Sintomas**: Aviso de certificado inválido

**Diagnóstico**:
```bash
# Verificar expiração
openssl x509 -in /etc/ssl/certs/voluntariado.crt -noout -dates

# Verificar configuração SSL
sslscan voluntariado.com
```

**Soluções**:
```bash
# Renovar certificados
certbot renew --dry-run
certbot renew

# Verificar configuração
nginx -t
systemctl reload nginx
```

## Problemas de SSL/TLS

### 1. Certificado Inválido
**Sintomas**: Erro de certificado no navegador

**Diagnóstico**:
```bash
# Verificar certificado
openssl x509 -in /etc/ssl/certs/voluntariado.crt -text -noout

# Verificar cadeia de certificados
openssl s_client -connect voluntariado.com:443 -showcerts

# Verificar configuração do Nginx
nginx -t
```

**Soluções**:
```bash
# Renovar certificados
certbot renew

# Verificar configuração
grep -r "ssl_certificate" /etc/nginx/

# Reiniciar Nginx
systemctl restart nginx
```

### 2. Redirecionamento HTTP para HTTPS
**Sintomas**: Site não redireciona para HTTPS

**Diagnóstico**:
```bash
# Verificar configuração
grep -r "return 301" /etc/nginx/

# Testar redirecionamento
curl -I http://voluntariado.com
```

**Soluções**:
```bash
# Configurar redirecionamento
sudo nano /etc/nginx/sites-available/voluntariado

# Adicionar:
# return 301 https://$server_name$request_uri;

# Verificar configuração
nginx -t
systemctl reload nginx
```

## Problemas de Cache

### 1. Cache Não Funciona
**Sintomas**: Aplicação lenta, dados não atualizados

**Diagnóstico**:
```bash
# Verificar status do Redis
systemctl status redis

# Verificar conexão
redis-cli ping

# Verificar chaves
redis-cli keys "*"
```

**Soluções**:
```bash
# Reiniciar Redis
systemctl restart redis

# Limpar cache
redis-cli FLUSHALL

# Verificar configuração
redis-cli config get "*"
```

### 2. Cache Inconsistente
**Sintomas**: Dados desatualizados no cache

**Diagnóstico**:
```bash
# Verificar TTL das chaves
redis-cli ttl "chave_exemplo"

# Verificar configuração
redis-cli config get "maxmemory-policy"
```

**Soluções**:
```bash
# Limpar cache específico
redis-cli del "chave_exemplo"

# Configurar política de cache
redis-cli config set maxmemory-policy allkeys-lru

# Reiniciar aplicação
docker-compose restart voluntariado-app
```

## Problemas de Logs

### 1. Logs Não Aparecem
**Sintomas**: Logs não são gerados ou não aparecem

**Diagnóstico**:
```bash
# Verificar permissões
ls -la /var/log/voluntariado/

# Verificar configuração
grep -r "log" /etc/nginx/

# Verificar syslog
systemctl status rsyslog
```

**Soluções**:
```bash
# Corrigir permissões
sudo chown -R www-data:www-data /var/log/voluntariado/

# Configurar logrotate
sudo nano /etc/logrotate.d/voluntariado

# Reiniciar serviços
systemctl restart rsyslog
systemctl restart nginx
```

### 2. Logs Muito Grandes
**Sintomas**: Disco cheio, logs muito grandes

**Diagnóstico**:
```bash
# Verificar tamanho dos logs
du -sh /var/log/voluntariado/*

# Verificar uso de disco
df -h
```

**Soluções**:
```bash
# Limpar logs antigos
find /var/log/voluntariado -name "*.log" -mtime +30 -delete

# Configurar logrotate
sudo nano /etc/logrotate.d/voluntariado

# Comprimir logs
gzip /var/log/voluntariado/*.log
```

## Problemas de Deploy

### 1. Deploy Falha
**Sintomas**: Deploy não completa, erros durante deploy

**Diagnóstico**:
```bash
# Verificar logs do deploy
docker-compose logs

# Verificar status dos containers
docker-compose ps

# Verificar recursos
docker stats
```

**Soluções**:
```bash
# Limpar containers antigos
docker-compose down
docker system prune -a

# Rebuild da aplicação
docker-compose build --no-cache

# Deploy limpo
docker-compose up -d
```

### 2. Migrações Falham
**Sintomas**: Erro durante execução de migrações

**Diagnóstico**:
```bash
# Verificar status do banco
psql volunteer_app_prod -c "SELECT version();"

# Verificar migrações
psql volunteer_app_prod -c "SELECT * FROM _prisma_migrations;"

# Verificar logs
docker-compose logs voluntariado-app
```

**Soluções**:
```bash
# Executar migrações manualmente
docker-compose exec voluntariado-app npm run db:migrate

# Verificar schema
docker-compose exec voluntariado-app npm run db:push

# Restaurar backup se necessário
gunzip -c backup.sql.gz | psql volunteer_app_prod
```

## Comandos Úteis

### Verificação Geral
```bash
# Status dos serviços
systemctl status nginx postgresql redis

# Uso de recursos
htop
df -h
free -h

# Conectividade
curl -I https://voluntariado.com/health
```

### Logs
```bash
# Logs da aplicação
tail -f /var/log/voluntariado/app.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-13-main.log
```

### Banco de Dados
```bash
# Conectar ao banco
psql volunteer_app_prod

# Verificar queries ativas
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

# Verificar locks
SELECT * FROM pg_locks WHERE NOT granted;
```

### Cache
```bash
# Conectar ao Redis
redis-cli

# Verificar chaves
keys *

# Verificar memória
info memory

# Limpar cache
FLUSHALL
```

## Contatos de Suporte

- **Administrador do Sistema**: admin@voluntariado.com
- **Suporte Técnico**: suporte@voluntariado.com
- **Emergência**: +55 11 99999-9999
- **Slack**: #voluntariado-support
- **Discord**: #voluntariado-dev

## Documentação Relacionada

- [Guia de Deploy](deployment-guide.md)
- [Manual de Manutenção](maintenance-guide.md)
- [Documentação da API](api.md)
- [Guia de Desenvolvimento](development.md)
- [Guia de Segurança](security.md)
