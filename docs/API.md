# OZmap Challenge API Documentation

## Visão Geral

A OZmap Challenge API é uma API RESTful desenvolvida para gerenciar regiões geográficas. A API permite criar, ler, atualizar e deletar regiões definidas como polígonos GeoJSON, além de realizar consultas geoespaciais avançadas.

## Base URL

```
http://localhost:3000/api
```

## Autenticação

Atualmente, a API não requer autenticação. Todas as rotas são públicas.

## Formato de Resposta

Todas as respostas seguem o formato padrão:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string (apenas em caso de erro)
}
```

## Endpoints

### Health Check

#### GET /health

Verifica o status da API.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-08-18T20:51:49.707Z",
    "uptime": 39.470716257,
    "environment": "development"
  },
  "message": "API is running successfully"
}
```

### Versão da API

#### GET /version

Retorna informações sobre a versão da API.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "name": "OZmap Challenge API",
    "description": "RESTful API for managing geographic regions"
  },
  "message": "API version information"
}
```

## Regiões

### Criar Região

#### POST /regions

Cria uma nova região.

**Body:**
```json
{
  "name": "Nome da Região",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [
      [
        [longitude1, latitude1],
        [longitude2, latitude2],
        [longitude3, latitude3],
        [longitude1, latitude1]
      ]
    ]
  }
}
```

**Validações:**
- `name`: obrigatório, string entre 1 e 100 caracteres
- `coordinates`: obrigatório, polígono GeoJSON válido
- O polígono deve ser fechado (primeiro e último pontos iguais)
- Mínimo de 4 coordenadas

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "68a3926b6a3084cffa224e1b",
    "name": "Nome da Região",
    "coordinates": {
      "type": "Polygon",
      "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]
    },
    "createdAt": "2025-08-18T20:51:55.900Z",
    "updatedAt": "2025-08-18T20:51:55.900Z"
  },
  "message": "Region created successfully"
}
```

### Listar Regiões

#### GET /regions

Lista todas as regiões com paginação.

**Query Parameters:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 10, máximo: 100)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "68a3926b6a3084cffa224e1b",
        "name": "Nome da Região",
        "coordinates": {...},
        "createdAt": "2025-08-18T20:51:55.900Z",
        "updatedAt": "2025-08-18T20:51:55.900Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Regions retrieved successfully"
}
```

### Obter Região por ID

#### GET /regions/:id

Obtém uma região específica pelo ID.

**Parâmetros:**
- `id`: ID da região (MongoDB ObjectId)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "68a3926b6a3084cffa224e1b",
    "name": "Nome da Região",
    "coordinates": {...},
    "createdAt": "2025-08-18T20:51:55.900Z",
    "updatedAt": "2025-08-18T20:51:55.900Z"
  },
  "message": "Region retrieved successfully"
}
```

**Resposta (404):**
```json
{
  "success": false,
  "error": "Region not found"
}
```

### Atualizar Região

#### PUT /regions/:id

Atualiza uma região existente.

**Parâmetros:**
- `id`: ID da região (MongoDB ObjectId)

**Body:**
```json
{
  "name": "Novo Nome da Região",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [...]
  }
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "68a3926b6a3084cffa224e1b",
    "name": "Novo Nome da Região",
    "coordinates": {...},
    "createdAt": "2025-08-18T20:51:55.900Z",
    "updatedAt": "2025-08-18T20:52:15.123Z"
  },
  "message": "Region updated successfully"
}
```

### Deletar Região

#### DELETE /regions/:id

Remove uma região.

**Parâmetros:**
- `id`: ID da região (MongoDB ObjectId)

**Resposta (200):**
```json
{
  "success": true,
  "message": "Region deleted successfully"
}
```

### Buscar Regiões por Ponto

#### GET /regions/point

Encontra regiões que contêm um ponto específico.

**Query Parameters:**
- `longitude`: longitude do ponto (-180 a 180)
- `latitude`: latitude do ponto (-90 a 90)

**Exemplo:**
```
GET /regions/point?longitude=0.5&latitude=0.5
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "68a3926b6a3084cffa224e1b",
      "name": "Região Teste",
      "coordinates": {...},
      "createdAt": "2025-08-18T20:51:55.900Z",
      "updatedAt": "2025-08-18T20:51:55.900Z"
    }
  ],
  "message": "Found 1 regions containing the specified point"
}
```

### Buscar Regiões por Distância

#### GET /regions/distance

Encontra regiões dentro de uma distância específica de um ponto.

**Query Parameters:**
- `longitude`: longitude do ponto (-180 a 180)
- `latitude`: latitude do ponto (-90 a 90)
- `distance`: distância em metros (valor positivo)

**Exemplo:**
```
GET /regions/distance?longitude=0&latitude=0&distance=100000
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "68a3926b6a3084cffa224e1b",
      "name": "Região Próxima",
      "coordinates": {...},
      "createdAt": "2025-08-18T20:51:55.900Z",
      "updatedAt": "2025-08-18T20:51:55.900Z"
    }
  ],
  "message": "Found 1 regions within 100000 meters"
}
```

### Buscar Regiões por Endereço

#### GET /regions/address

Geocodifica um endereço e encontra regiões que o contêm.

**Query Parameters:**
- `address`: endereço para geocodificar (3-200 caracteres)
- `countryCode` (opcional): código do país (2 letras, padrão: BR)

**Exemplo:**
```
GET /regions/address?address=São Paulo, Brasil&countryCode=BR
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "geocodeResult": {
      "latitude": -23.5506507,
      "longitude": -46.6333824,
      "formattedAddress": "São Paulo, Região Imediata de São Paulo, ..."
    },
    "regions": []
  },
  "message": "Address geocoded successfully. Found 0 regions containing this location."
}
```

### Buscar Regiões por Nome

#### GET /regions/search

Busca regiões por nome usando correspondência parcial.

**Query Parameters:**
- `name`: termo de busca (1-100 caracteres)
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 10, máximo: 100)

**Exemplo:**
```
GET /regions/search?name=São&page=1&limit=10
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "68a3926b6a3084cffa224e1b",
        "name": "São Paulo",
        "coordinates": {...},
        "createdAt": "2025-08-18T20:51:55.900Z",
        "updatedAt": "2025-08-18T20:51:55.900Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Found 1 regions matching \"São\""
}
```

## Códigos de Status HTTP

- `200 OK`: Operação bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou erro de validação
- `404 Not Found`: Recurso não encontrado
- `429 Too Many Requests`: Limite de taxa excedido
- `500 Internal Server Error`: Erro interno do servidor

## Rate Limiting

A API implementa limitação de taxa:
- **Desenvolvimento**: 1000 requisições por 15 minutos por IP
- **Produção**: 100 requisições por 15 minutos por IP

## Geocodificação

A API utiliza o serviço OpenStreetMap Nominatim para geocodificação de endereços. O serviço é gratuito mas possui limitações de taxa.

## Logs

A API registra todas as operações importantes, incluindo:
- Criação, atualização e remoção de regiões
- Consultas geoespaciais
- Geocodificação de endereços
- Erros e exceções

## Formato GeoJSON

As coordenadas seguem o padrão GeoJSON:

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [longitude, latitude],
      [longitude, latitude],
      [longitude, latitude],
      [longitude, latitude]
    ]
  ]
}
```

**Importante:**
- Coordenadas são no formato `[longitude, latitude]`
- Longitude: -180 a 180
- Latitude: -90 a 90
- O polígono deve ser fechado (primeiro e último pontos iguais)
- Mínimo de 4 pontos para formar um polígono válido

## Exemplos de Uso

### Criar uma região retangular

```bash
curl -X POST http://localhost:3000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Região Central",
    "coordinates": {
      "type": "Polygon",
      "coordinates": [[[-46.7, -23.5], [-46.6, -23.5], [-46.6, -23.6], [-46.7, -23.6], [-46.7, -23.5]]]
    }
  }'
```

### Verificar se um ponto está em alguma região

```bash
curl "http://localhost:3000/api/regions/point?longitude=-46.65&latitude=-23.55"
```

### Buscar regiões próximas a um ponto

```bash
curl "http://localhost:3000/api/regions/distance?longitude=-46.65&latitude=-23.55&distance=5000"
```

### Geocodificar endereço e buscar regiões

```bash
curl "http://localhost:3000/api/regions/address?address=Avenida Paulista, São Paulo"
```

