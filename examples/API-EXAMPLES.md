# Exemplos de Uso da API LudoLens

## 1. Health Check

```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T22:30:00.000Z"
}
```

## 2. Upload de Manual (PDF)

```bash
curl -X POST http://localhost:3000/manuals \
  -F "gameName=Ticket to Ride" \
  -F "file=@/path/to/manual.pdf"
```

Resposta:
```json
{
  "success": true,
  "data": {
    "manualId": "123e4567-e89b-12d3-a456-426614174000",
    "gameName": "Ticket to Ride",
    "fileName": "manual.pdf",
    "message": "Manual enviado com sucesso. O processamento foi iniciado."
  }
}
```

## 3. Listar Todos os Manuais

```bash
curl http://localhost:3000/manuals
```

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "gameName": "Ticket to Ride",
      "fileName": "manual.pdf",
      "filePath": "./uploads/123e4567-e89b-12d3-a456-426614174000.pdf",
      "uploadedAt": "2026-01-06T22:00:00.000Z",
      "processedAt": "2026-01-06T22:00:15.000Z",
      "isProcessed": true
    }
  ]
}
```

## 4. Buscar Manual por ID

```bash
curl http://localhost:3000/manuals/123e4567-e89b-12d3-a456-426614174000
```

## 5. Consulta com Imagem (Multimodal)

```bash
curl -X POST http://localhost:3000/query \
  -F "manualId=123e4567-e89b-12d3-a456-426614174000" \
  -F "image=@/path/to/game-photo.jpg" \
  -F "question=Posso colocar dois trens nesta rota?"
```

Resposta:
```json
{
  "success": true,
  "data": {
    "answer": "Analisando a imagem da mesa, vejo que você está tentando colocar trens em uma rota amarela. De acordo com o manual, cada rota pode ser ocupada por apenas um jogador. Se a rota já está ocupada por outro jogador (como parece na imagem), você não pode colocar seus trens ali. Você precisará buscar uma rota alternativa para conectar essas cidades."
  }
}
```

## 6. Consulta Apenas com Texto

```bash
curl -X POST http://localhost:3000/query/text \
  -H "Content-Type: application/json" \
  -d '{
    "manualId": "123e4567-e89b-12d3-a456-426614174000",
    "question": "Como funciona o sistema de pontuação no final do jogo?"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "answer": "O sistema de pontuação no Ticket to Ride funciona da seguinte forma:\n\n1. **Pontos por rotas completadas**: Você ganha pontos baseado no comprimento das rotas:\n   - 1 vagão = 1 ponto\n   - 2 vagões = 2 pontos\n   - 3 vagões = 4 pontos\n   - 4 vagões = 7 pontos\n   - 5 vagões = 10 pontos\n   - 6 vagões = 15 pontos\n\n2. **Cartões de destino**:\n   - Se você completou: soma os pontos\n   - Se não completou: subtrai os pontos\n\n3. **Rota mais longa**: O jogador com a rota contínua mais longa ganha 10 pontos bônus.\n\nO jogador com mais pontos no final vence!"
  }
}
```

## 7. Deletar Manual

```bash
curl -X DELETE http://localhost:3000/manuals/123e4567-e89b-12d3-a456-426614174000
```

Resposta:
```json
{
  "success": true,
  "message": "Manual deletado com sucesso"
}
```

## Usando JavaScript/TypeScript

### Upload de Manual

```typescript
const formData = new FormData()
formData.append('gameName', 'Ticket to Ride')
formData.append('file', pdfFile) // File object

const response = await fetch('http://localhost:3000/manuals', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log(data.data.manualId)
```

### Consulta com Imagem

```typescript
const formData = new FormData()
formData.append('manualId', '123e4567-e89b-12d3-a456-426614174000')
formData.append('image', imageFile) // File object
formData.append('question', 'Posso construir aqui?')

const response = await fetch('http://localhost:3000/query', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log(data.data.answer)
```

### Consulta com Texto

```typescript
const response = await fetch('http://localhost:3000/query/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    manualId: '123e4567-e89b-12d3-a456-426614174000',
    question: 'Como funciona o sistema de pontuação?',
  }),
})

const data = await response.json()
console.log(data.data.answer)
```

## Usando Python

```python
import requests

# Upload manual
files = {'file': open('manual.pdf', 'rb')}
data = {'gameName': 'Ticket to Ride'}
response = requests.post('http://localhost:3000/manuals', files=files, data=data)
manual_id = response.json()['data']['manualId']

# Consulta com imagem
files = {'image': open('game-photo.jpg', 'rb')}
data = {
    'manualId': manual_id,
    'question': 'Posso colocar dois trens aqui?'
}
response = requests.post('http://localhost:3000/query', files=files, data=data)
answer = response.json()['data']['answer']
print(answer)
```

## Tratamento de Erros

### Manual não processado ainda

```json
{
  "success": false,
  "error": "Manual ainda está sendo processado. Aguarde alguns instantes."
}
```

### Manual não encontrado

```json
{
  "success": false,
  "error": "Manual não encontrado"
}
```

### Arquivo inválido

```json
{
  "success": false,
  "error": "Apenas arquivos PDF são permitidos"
}
```

## Documentação Interativa

Acesse http://localhost:3000/docs para uma interface interativa onde você pode testar todos os endpoints diretamente no navegador!
