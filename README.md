# OZmap Challenge - API de Geolocalização

[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.0+-lightgrey.svg)](https://expressjs.com/)

Uma API RESTful robusta para gerenciamento de regiões geográficas, desenvolvida como parte do desafio técnico da OZmap. A API permite criar, gerenciar e consultar regiões definidas como polígonos GeoJSON, com funcionalidades avançadas de geolocalização.

## 🌟 Funcionalidades

### Gerenciamento de Regiões
- ✅ **CRUD completo** para regiões geográficas
- ✅ **Validação rigorosa** de polígonos GeoJSON
- ✅ **Paginação** em todas as listagens
- ✅ **Busca por nome** com correspondência parcial

### Consultas Geoespaciais
- ✅ **Busca por ponto**: encontrar regiões que contêm coordenadas específicas
- ✅ **Busca por distância**: encontrar regiões próximas a um ponto
- ✅ **Geocodificação**: converter endereços em coordenadas e buscar regiões

### Recursos Técnicos
- ✅ **API RESTful** seguindo melhores práticas
- ✅ **Documentação completa** da API
- ✅ **Testes unitários e de integração**
- ✅ **Logs estruturados** com Winston
- ✅ **Rate limiting** para proteção
- ✅ **Validação de entrada** com express-validator
- ✅ **Tratamento de erros** padronizado
- ✅ **Internacionalização** preparada
- ✅ **Controle de país** para geocodificação

## 🛠 Tecnologias Utilizadas

- **Node.js 22+** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **MongoDB 8+** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Mocha/Chai** - Framework de testes
- **ESLint + Prettier** - Linting e formatação
- **Winston** - Sistema de logs
- **Axios** - Cliente HTTP para geocodificação

## 📋 Pré-requisitos

- Node.js 22 ou superior
- MongoDB 8 ou superior
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone git@github.com:RobertoPClaro/OZmap-Challenge.git
cd OZmap-Challenge
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ozmap-challenge
NODE_ENV=development
GEOCODING_API_KEY=demo_key
GEOCODING_COUNTRY_CODE=BR
LOG_LEVEL=info
```

### 4. Inicie o MongoDB
```bash
# Usando Docker Compose (recomendado)
docker-compose up -d

# Ou inicie o MongoDB localmente
sudo systemctl start mongod
```

### 5. Execute a aplicação

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`

## 📖 Documentação da API

### Endpoints Principais

- **GET** `/api/health` - Status da API
- **GET** `/api/version` - Informações da versão
- **POST** `/api/regions` - Criar região
- **GET** `/api/regions` - Listar regiões
- **GET** `/api/regions/:id` - Obter região por ID
- **PUT** `/api/regions/:id` - Atualizar região
- **DELETE** `/api/regions/:id` - Deletar região
- **GET** `/api/regions/point` - Buscar por ponto
- **GET** `/api/regions/distance` - Buscar por distância
- **GET** `/api/regions/address` - Buscar por endereço
- **GET** `/api/regions/search` - Buscar por nome

### Exemplo de Uso

#### Criar uma região
```bash
curl -X POST http://localhost:3000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Centro de São Paulo",
    "coordinates": {
      "type": "Polygon",
      "coordinates": [[[-46.7, -23.5], [-46.6, -23.5], [-46.6, -23.6], [-46.7, -23.6], [-46.7, -23.5]]]
    }
  }'
```

#### Buscar regiões que contêm um ponto
```bash
curl "http://localhost:3000/api/regions/point?longitude=-46.65&latitude=-23.55"
```

#### Geocodificar endereço e buscar regiões
```bash
curl "http://localhost:3000/api/regions/address?address=Avenida Paulista, São Paulo"
```

Para documentação completa, consulte [docs/API.md](docs/API.md).

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Testes unitários
```bash
npm run test:unit
```

### Testes de integração
```bash
npm run test:integration
```

### Cobertura de código
```bash
npm run test:coverage
```

## 🔧 Scripts Disponíveis

- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia a aplicação em produção
- `npm run dev` - Inicia em modo desenvolvimento com hot reload
- `npm test` - Executa todos os testes
- `npm run test:unit` - Executa testes unitários
- `npm run test:integration` - Executa testes de integração
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run lint` - Executa linting
- `npm run lint:fix` - Corrige problemas de linting automaticamente
- `npm run format` - Formata código com Prettier
- `npm run docker:up` - Inicia MongoDB via Docker
- `npm run docker:down` - Para MongoDB via Docker
- `npm run docker:logs` - Visualiza logs do MongoDB

## 📁 Estrutura do Projeto

```
ozmap-challenge/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Definições de rotas
│   ├── services/       # Lógica de negócio
│   ├── middleware/     # Middlewares customizados
│   ├── utils/          # Utilitários e helpers
│   ├── types/          # Definições de tipos TypeScript
│   ├── config/         # Configurações da aplicação
│   ├── app.ts          # Configuração do Express
│   └── index.ts        # Ponto de entrada da aplicação
├── tests/
│   ├── unit/           # Testes unitários
│   ├── integration/    # Testes de integração
│   └── setup.ts        # Configuração dos testes
└── docs/
    └── API.md          # Documentação da API
```

## 📊 Logs e Monitoramento

A aplicação gera logs estruturados em JSON com diferentes níveis:
- **error**: Erros críticos
- **warn**: Avisos importantes
- **info**: Informações gerais
- **debug**: Informações de depuração

Os logs são em:
- Console

## 🔒 Segurança

A API implementa várias medidas de segurança:
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem cruzada
- **Rate Limiting**: Proteção contra spam
- **Validação de entrada**: Sanitização de dados
- **Logs de auditoria**: Rastreamento de operações



## 👨‍💻 Autor

Desenvolvido por Roberto Pacheco Claro como parte do desafio técnico da OZmap para vaga de Desenvolvedor Pleno.

**OZmap Challenge** - Construindo a Geolocalização do Futuro 🌍