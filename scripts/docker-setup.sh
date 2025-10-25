#!/bin/bash

# Script para configurar e executar o projeto com Docker

set -e

echo "🐳 Configurando projeto Volunteer App com Docker..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    print_message "Criando arquivo .env..."
    cp env.example .env
    print_warning "Arquivo .env criado. Por favor, configure as variáveis de ambiente."
fi

# Criar diretórios necessários
print_message "Criando diretórios necessários..."
mkdir -p uploads logs nginx/ssl

# Função para escolher o ambiente
choose_environment() {
    echo "Escolha o ambiente:"
    echo "1) Desenvolvimento (com hot reload)"
    echo "2) Produção"
    read -p "Digite sua escolha (1 ou 2): " choice

    case $choice in
        1)
            ENVIRONMENT="development"
            COMPOSE_FILE="docker-compose.dev.yml"
            ;;
        2)
            ENVIRONMENT="production"
            COMPOSE_FILE="docker-compose.yml"
            ;;
        *)
            print_error "Escolha inválida. Usando desenvolvimento por padrão."
            ENVIRONMENT="development"
            COMPOSE_FILE="docker-compose.dev.yml"
            ;;
    esac
}

# Função para executar comandos Docker
run_docker() {
    local command=$1
    print_message "Executando: $command"
    eval $command
}

# Menu principal
echo "🚀 Volunteer App - Docker Setup"
echo "================================"

choose_environment

print_message "Ambiente selecionado: $ENVIRONMENT"

# Parar containers existentes
print_message "Parando containers existentes..."
run_docker "docker-compose -f $COMPOSE_FILE down"

# Remover volumes se solicitado
read -p "Deseja remover volumes existentes? (y/N): " remove_volumes
if [[ $remove_volumes =~ ^[Yy]$ ]]; then
    print_message "Removendo volumes..."
    run_docker "docker-compose -f $COMPOSE_FILE down -v"
fi

# Construir imagens
print_message "Construindo imagens Docker..."
run_docker "docker-compose -f $COMPOSE_FILE build --no-cache"

# Iniciar serviços
print_message "Iniciando serviços..."
run_docker "docker-compose -f $COMPOSE_FILE up -d"

# Aguardar serviços ficarem prontos
print_message "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
print_message "Verificando status dos containers..."
run_docker "docker-compose -f $COMPOSE_FILE ps"

# Executar migrações e seed (apenas em desenvolvimento)
if [ "$ENVIRONMENT" = "development" ]; then
    print_message "Executando migrações do banco de dados..."
    run_docker "docker-compose -f $COMPOSE_FILE exec app npx prisma migrate dev --name init"
    
    print_message "Executando seed do banco de dados..."
    run_docker "docker-compose -f $COMPOSE_FILE exec app npm run db:seed"
fi

# Mostrar logs
print_message "Mostrando logs dos containers..."
run_docker "docker-compose -f $COMPOSE_FILE logs --tail=50"

echo ""
echo "🎉 Setup concluído!"
echo "==================="
echo "📊 Backend: http://localhost:3000"
echo "🌐 Frontend: http://localhost:3001"
echo "📈 Health Check: http://localhost:3000/api/health"
echo "📊 Métricas: http://localhost:3000/api/metrics (apenas em desenvolvimento)"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  - Parar: docker-compose -f $COMPOSE_FILE down"
echo "  - Reiniciar: docker-compose -f $COMPOSE_FILE restart"
echo "  - Acessar container: docker-compose -f $COMPOSE_FILE exec app sh"
echo ""
